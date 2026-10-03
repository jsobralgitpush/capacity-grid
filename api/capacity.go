package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

type capacityRow struct {
	ID         int     `json:"id"`
	Name       string  `json:"name"`
	Capacity   float64 `json:"capacity"`
	Allocation float64 `json:"allocation"`
	Status     string  `json:"status"`
	WeekStart  string  `json:"week_start"`
	WeekEnd    string  `json:"week_end"`
}

type capacityFilters struct {
	From     *time.Time
	To       *time.Time
	PersonID *int
}

// With no dates, show weeks containing assignments. Filtered ranges use
// seven-day weeks starting on from; to is exclusive. Assignment dates are inclusive.
func (s *server) handleCapacity(w http.ResponseWriter, r *http.Request) {
	filters, err := parseCapacityFilters(r.URL.Query())
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	result, err := s.queryCapacity(r.Context(), filters)
	if err != nil {
		log.Printf("capacity: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not load capacity."})
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func parseCapacityFilters(params url.Values) (capacityFilters, error) {
	var filters capacityFilters
	if text := params.Get("person_id"); text != "" {
		id, err := strconv.Atoi(text)
		if err != nil || id <= 0 || id > 2147483647 {
			return filters, errors.New("person_id must be a positive integer.")
		}
		filters.PersonID = &id
	}
	from, to, err := parseCapacityRange(params.Get("from"), params.Get("to"))
	if err != nil {
		return filters, err
	}
	filters.From, filters.To = from, to
	return filters, nil
}

func parseCapacityRange(fromText, toText string) (*time.Time, *time.Time, error) {
	if fromText == "" && toText == "" {
		return nil, nil, nil
	}
	from, fromErr := time.Parse("2006-01-02", fromText)
	to, toErr := time.Parse("2006-01-02", toText)
	if fromErr != nil || toErr != nil {
		return nil, nil, errors.New("from and to must be YYYY-MM-DD dates.")
	}
	days := int(to.Sub(from).Hours() / 24)
	if days < 7 || days%7 != 0 || days > 728 {
		return nil, nil, errors.New("Choose dates between 1 and 104 whole weeks apart.")
	}
	return &from, &to, nil
}

func (s *server) queryCapacity(ctx context.Context, filters capacityFilters) ([]capacityRow, error) {
	rows, err := s.db.Query(ctx, capacitySQL, filters.From, filters.To, filters.PersonID)
	if err != nil {
		return nil, fmt.Errorf("query capacity: %w", err)
	}
	defer rows.Close()

	result := make([]capacityRow, 0)
	for rows.Next() {
		var row capacityRow
		if err := rows.Scan(&row.ID, &row.Name, &row.Capacity, &row.Allocation, &row.Status, &row.WeekStart, &row.WeekEnd); err != nil {
			return nil, fmt.Errorf("scan capacity: %w", err)
		}
		result = append(result, row)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read capacity rows: %w", err)
	}
	return result, nil
}

// Build weeks, count working days, sum assignments, then compare each person's
// allocation with their weekly hours. $1/$2 are optional dates; $3 is a person ID.
const capacitySQL = `
		WITH weeks AS (
			SELECT DISTINCT week::date AS start
			FROM assignments a
			CROSS JOIN LATERAL generate_series(
				date_trunc('week', a.start_date::timestamp),
				date_trunc('week', a.end_date::timestamp), interval '1 week'
			) AS week
			WHERE $1::date IS NULL
			UNION
			SELECT week::date
			FROM generate_series($1::date::timestamp, ($2::date - 1)::timestamp, interval '1 week') AS week
		), working_days AS (
			SELECT w.start, day::date AS date
			FROM weeks w
			CROSS JOIN LATERAL generate_series(w.start::timestamp, (w.start + 6)::timestamp, interval '1 day') AS day
			WHERE EXTRACT(ISODOW FROM day) BETWEEN 1 AND 5
		), allocations AS (
			SELECT a.person_id, d.start, SUM(a.hours_per_day) AS hours
			FROM assignments a
			JOIN working_days d ON d.date BETWEEN a.start_date AND a.end_date
			WHERE ($3::int IS NULL OR a.person_id = $3::int)
			GROUP BY a.person_id, d.start
		)
		SELECT p.id, p.name, p.weekly_hours::float8,
			COALESCE(a.hours, 0)::float8,
			CASE
				WHEN COALESCE(a.hours, 0) > p.weekly_hours THEN 'over_capacity'
				WHEN COALESCE(a.hours, 0) = p.weekly_hours THEN 'at_capacity'
				ELSE 'below_capacity'
			END,
			to_char(w.start, 'YYYY-MM-DD'), to_char(w.start + 6, 'YYYY-MM-DD')
		FROM people p
		CROSS JOIN weeks w
		LEFT JOIN allocations a ON a.person_id = p.id AND a.start = w.start
		WHERE ($3::int IS NULL OR p.id = $3::int)
		ORDER BY w.start, p.name, p.id
	`
