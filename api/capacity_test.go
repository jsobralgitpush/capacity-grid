package main

import (
	"net/url"
	"testing"
)

func TestParseCapacityRange(t *testing.T) {
	tests := []struct {
		name, from, to string
		wantError      bool
	}{
		{name: "unfiltered"},
		{name: "one week", from: "2026-01-05", to: "2026-01-12"},
		{name: "multiple weeks across year", from: "2025-12-29", to: "2026-01-19"},
		{name: "maximum range", from: "2026-01-05", to: "2028-01-03"},
		{name: "missing end", from: "2026-01-05", wantError: true},
		{name: "missing start", to: "2026-01-12", wantError: true},
		{name: "invalid date", from: "2026-02-30", to: "2026-03-09", wantError: true},
		{name: "same date", from: "2026-01-05", to: "2026-01-05", wantError: true},
		{name: "reversed", from: "2026-01-12", to: "2026-01-05", wantError: true},
		{name: "partial week", from: "2026-01-05", to: "2026-01-13", wantError: true},
		{name: "range too long", from: "2026-01-05", to: "2028-01-10", wantError: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			from, to, err := parseCapacityRange(tt.from, tt.to)
			if (err != nil) != tt.wantError {
				t.Fatalf("error = %v, wantError = %v", err, tt.wantError)
			}
			if tt.wantError {
				return
			}
			if tt.from == "" {
				if from != nil || to != nil {
					t.Fatal("unfiltered range must return nil dates")
				}
				return
			}
			if from == nil || to == nil || from.Format("2006-01-02") != tt.from || to.Format("2006-01-02") != tt.to {
				t.Fatalf("range = %v to %v, want %s to %s", from, to, tt.from, tt.to)
			}
		})
	}
}

func TestParseCapacityFilters(t *testing.T) {
	filters, err := parseCapacityFilters(url.Values{
		"from": {"2026-01-05"}, "to": {"2026-01-12"}, "person_id": {"42"},
	})
	if err != nil || filters.PersonID == nil || *filters.PersonID != 42 || filters.From == nil || filters.To == nil {
		t.Fatalf("filters = %+v, error = %v", filters, err)
	}
	filters, err = parseCapacityFilters(url.Values{})
	if err != nil || filters.PersonID != nil || filters.From != nil || filters.To != nil {
		t.Fatalf("empty filters = %+v, error = %v", filters, err)
	}
	for _, id := range []string{"0", "-1", "abc", "2147483648"} {
		t.Run(id, func(t *testing.T) {
			if _, err := parseCapacityFilters(url.Values{"person_id": {id}}); err == nil {
				t.Fatalf("expected invalid person_id %q to fail", id)
			}
		})
	}
	if _, err := parseCapacityFilters(url.Values{"from": {"2026-01-05"}}); err == nil {
		t.Fatal("expected range validation error to propagate")
	}
}
