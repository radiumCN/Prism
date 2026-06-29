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

func (r *MCPServerRepository) FindAll(userID uint) ([]model.MCPServer, error) {
	var servers []model.MCPServer
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&servers).Error
	return servers, err
}

func (r *MCPServerRepository) FindActive(userID uint) ([]model.MCPServer, error) {
	var servers []model.MCPServer
	err := r.db.Where("user_id = ? AND status = ?", userID, "active").Order("name ASC").Find(&servers).Error
	return servers, err
}

// FindByIDs returns active MCP servers matching the given IDs that belong to the user.
func (r *MCPServerRepository) FindByIDs(ids []uint, userID uint) ([]model.MCPServer, error) {
	var servers []model.MCPServer
	if len(ids) == 0 {
		return servers, nil
	}
	err := r.db.Where("id IN ? AND user_id = ? AND status = ?", ids, userID, "active").Find(&servers).Error
	return servers, err
}

func (r *MCPServerRepository) FindByID(id, userID uint) (*model.MCPServer, error) {
	var s model.MCPServer
	if err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&s).Error; err != nil {
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

func (r *MCPServerRepository) Delete(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.MCPServer{}).Error
}
