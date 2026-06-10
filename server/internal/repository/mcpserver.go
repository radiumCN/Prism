package repository

import (
	"modelhub/server/internal/model"

	"gorm.io/gorm"
)

type MCPServerRepository struct {
	db *gorm.DB
}

func NewMCPServerRepository(db *gorm.DB) *MCPServerRepository {
	return &MCPServerRepository{db: db}
}

func (r *MCPServerRepository) FindAll() ([]model.MCPServer, error) {
	var servers []model.MCPServer
	err := r.db.Order("created_at DESC").Find(&servers).Error
	return servers, err
}

func (r *MCPServerRepository) FindActive() ([]model.MCPServer, error) {
	var servers []model.MCPServer
	err := r.db.Where("status = ?", "active").Order("name ASC").Find(&servers).Error
	return servers, err
}

func (r *MCPServerRepository) FindByIDs(ids []uint) ([]model.MCPServer, error) {
	var servers []model.MCPServer
	if len(ids) == 0 {
		return servers, nil
	}
	err := r.db.Where("id IN ? AND status = ?", ids, "active").Find(&servers).Error
	return servers, err
}

func (r *MCPServerRepository) FindByID(id uint) (*model.MCPServer, error) {
	var s model.MCPServer
	if err := r.db.First(&s, id).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *MCPServerRepository) Create(s *model.MCPServer) error {
	return r.db.Create(s).Error
}

func (r *MCPServerRepository) Update(s *model.MCPServer) error {
	return r.db.Save(s).Error
}

func (r *MCPServerRepository) Delete(id uint) error {
	return r.db.Delete(&model.MCPServer{}, id).Error
}
