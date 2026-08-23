// Package validator provides input validation utilities for AgendaLudoia.
package validator

import (
	"fmt"
	"regexp"

	"github.com/google/uuid"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// ValidateUUID checks if a string is a valid UUID v4.
func ValidateUUID(s string) error {
	if _, err := uuid.Parse(s); err != nil {
		return fmt.Errorf("invalid UUID: %s", s)
	}
	return nil
}

// ValidateEmail checks if a string is a valid email address.
func ValidateEmail(email string) error {
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email: %s", email)
	}
	return nil
}

// ValidateEVAScore checks if an EVA pain score is within the valid range (0-10).
func ValidateEVAScore(score int) error {
	if score < 0 || score > 10 {
		return fmt.Errorf("EVA score must be between 0 and 10, got %d", score)
	}
	return nil
}

// ValidateRequired checks that a string field is not empty.
func ValidateRequired(field, value string) error {
	if value == "" {
		return fmt.Errorf("%s is required", field)
	}
	return nil
}
