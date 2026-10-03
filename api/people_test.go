package main

import (
	"strings"
	"testing"
)

func TestParsePersonID(t *testing.T) {
	id, err := parsePersonID("42")
	if err != nil || id != 42 {
		t.Fatalf("id = %d, error = %v", id, err)
	}
	for _, text := range []string{"", "0", "-1", "abc", "2147483648"} {
		t.Run(text, func(t *testing.T) {
			if _, err := parsePersonID(text); err == nil {
				t.Fatalf("expected invalid ID %q to fail", text)
			}
		})
	}
}

func TestParseUpdatePersonInput(t *testing.T) {
	tests := []struct {
		name, body string
		wantHours  float64
		wantError  bool
	}{
		{name: "normal capacity", body: `{"weekly_hours":40}`, wantHours: 40},
		{name: "zero capacity", body: `{"weekly_hours":0}`},
		{name: "fractional capacity", body: `{"weekly_hours":32.5}`, wantHours: 32.5},
		{name: "maximum capacity", body: `{"weekly_hours":168}`, wantHours: 168},
		{name: "missing hours", body: `{}`, wantError: true},
		{name: "null hours", body: `{"weekly_hours":null}`, wantError: true},
		{name: "negative hours", body: `{"weekly_hours":-1}`, wantError: true},
		{name: "too many hours", body: `{"weekly_hours":169}`, wantError: true},
		{name: "wrong type", body: `{"weekly_hours":"40"}`, wantError: true},
		{name: "unknown field", body: `{"weekly_hours":40,"name":"Ana"}`, wantError: true},
		{name: "malformed JSON", body: `{"weekly_hours":`, wantError: true},
		{name: "multiple objects", body: `{"weekly_hours":40} {}`, wantError: true},
		{name: "empty body", wantError: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			input, err := parseUpdatePersonInput(strings.NewReader(tt.body))
			if (err != nil) != tt.wantError {
				t.Fatalf("error = %v, wantError = %v", err, tt.wantError)
			}
			if !tt.wantError && (input.WeeklyHours == nil || *input.WeeklyHours != tt.wantHours) {
				t.Fatalf("hours = %v, want %v", input.WeeklyHours, tt.wantHours)
			}
		})
	}
}
