package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5"
)

type updatedPerson struct {
	ID          int     `json:"id"`
	WeeklyHours float64 `json:"weekly_hours"`
}

type updatePersonInput struct {
	WeeklyHours *float64 `json:"weekly_hours"`
}

// Weekly hours apply to every week for this person.
func (s *server) handleUpdatePerson(w http.ResponseWriter, r *http.Request) {
	id, err := parsePersonID(r.PathValue("id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	input, err := parseUpdatePersonInput(http.MaxBytesReader(w, r.Body, 4096))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	updated, err := s.updatePersonCapacity(r.Context(), id, *input.WeeklyHours)
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Person not found."})
		return
	}
	if err != nil {
		log.Printf("update person: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Could not save capacity."})
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func parsePersonID(text string) (int, error) {
	id, err := strconv.Atoi(text)
	if err != nil || id <= 0 || id > 2147483647 {
		return 0, errors.New("Invalid person ID.")
	}
	return id, nil
}

func parseUpdatePersonInput(body io.Reader) (updatePersonInput, error) {
	var input updatePersonInput
	decoder := json.NewDecoder(body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		return input, errors.New("Provide a JSON object containing weekly_hours.")
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return input, errors.New("Provide a single JSON object.")
	}
	if err := validateWeeklyHours(input.WeeklyHours); err != nil {
		return input, err
	}
	return input, nil
}

func validateWeeklyHours(hours *float64) error {
	if hours == nil || math.IsNaN(*hours) || math.IsInf(*hours, 0) || *hours < 0 || *hours > 168 {
		return errors.New("Weekly hours must be between 0 and 168.")
	}
	return nil
}

func (s *server) updatePersonCapacity(ctx context.Context, id int, hours float64) (updatedPerson, error) {
	var updated updatedPerson
	err := s.db.QueryRow(ctx, updatePersonCapacitySQL, id, hours).Scan(&updated.ID, &updated.WeeklyHours)
	if err != nil {
		return updated, fmt.Errorf("update person capacity: %w", err)
	}
	return updated, nil
}

const updatePersonCapacitySQL = `
	UPDATE people SET weekly_hours = $2::numeric
	WHERE id = $1
	RETURNING id, weekly_hours::float8
`
