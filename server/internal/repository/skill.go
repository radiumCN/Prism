package repository

import (
	"modelhub/server/internal/model"

	"gorm.io/gorm"
)

type SkillRepository struct {
	db *gorm.DB
}

func NewSkillRepository(db *gorm.DB) *SkillRepository {
	return &SkillRepository{db: db}
}

func (r *SkillRepository) FindAll(userID uint) ([]model.Skill, error) {
	var skills []model.Skill
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&skills).Error
	return skills, err
}

func (r *SkillRepository) FindActive(userID uint) ([]model.Skill, error) {
	var skills []model.Skill
	err := r.db.Where("user_id = ? AND status = ?", userID, "active").Order("name ASC").Find(&skills).Error
	return skills, err
}

// FindByIDs returns active skills matching the given IDs that belong to the user.
func (r *SkillRepository) FindByIDs(ids []uint, userID uint) ([]model.Skill, error) {
	var skills []model.Skill
	if len(ids) == 0 {
		return skills, nil
	}
	err := r.db.Where("id IN ? AND user_id = ? AND status = ?", ids, userID, "active").Find(&skills).Error
	return skills, err
}

func (r *SkillRepository) FindByID(id, userID uint) (*model.Skill, error) {
	var s model.Skill
	if err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&s).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SkillRepository) Create(s *model.Skill) error {
	return r.db.Create(s).Error
}

func (r *SkillRepository) Update(s *model.Skill) error {
	return r.db.Save(s).Error
}

func (r *SkillRepository) Delete(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Skill{}).Error
}
