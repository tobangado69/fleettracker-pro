package payment

import (
	"gorm.io/gorm"
	"github.com/tobangado69/fleettracker-pro/backend/internal/common/config"
)

type Service struct {
	db   *gorm.DB
	cfg  *config.Config
}

func NewService(db *gorm.DB, cfg *config.Config) *Service {
	return &Service{db: db, cfg: cfg}
}
