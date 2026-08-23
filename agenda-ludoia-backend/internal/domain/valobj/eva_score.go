// Package valobj contains Value Objects for the AgendaLudoia domain.
// Value Objects are immutable, validated types that encapsulate domain rules.
package valobj

import (
	"fmt"

	"github.com/agendaLudoia/backend/internal/domain"
)

// EVAScore represents a validated pain intensity score on the
// Visual Analog Scale (EVA/VAS), ranging from 0 (no pain) to 10 (worst pain).
type EVAScore struct {
	value int
}

// NewEVAScore creates a validated EVA score. Returns ErrInvalidEVAScore if out of range.
func NewEVAScore(score int) (EVAScore, error) {
	if score < 0 || score > 10 {
		return EVAScore{}, fmt.Errorf("%w: got %d, expected 0-10", domain.ErrInvalidEVAScore, score)
	}
	return EVAScore{value: score}, nil
}

// Value returns the integer score.
func (e EVAScore) Value() int {
	return e.value
}

// Severity returns a human-readable pain severity classification.
func (e EVAScore) Severity() string {
	switch {
	case e.value == 0:
		return "none"
	case e.value <= 3:
		return "mild"
	case e.value <= 6:
		return "moderate"
	case e.value <= 8:
		return "severe"
	default:
		return "extreme"
	}
}
