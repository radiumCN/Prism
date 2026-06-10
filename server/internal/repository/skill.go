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

func (r *SkillRepository) FindAll() ([]model.Skill, error) {
	var skills []model.Skill
	err := r.db.Order("created_at DESC").Find(&skills).Error
	return skills, err
}

func (r *SkillRepository) FindActive() ([]model.Skill, error) {
	var skills []model.Skill
	err := r.db.Where("status = ?", "active").Order("name ASC").Find(&skills).Error
	return skills, err
}

func (r *SkillRepository) FindByIDs(ids []uint) ([]model.Skill, error) {
	var skills []model.Skill
	if len(ids) == 0 {
		return skills, nil
	}
	err := r.db.Where("id IN ? AND status = ?", ids, "active").Find(&skills).Error
	return skills, err
}

func (r *SkillRepository) FindByID(id uint) (*model.Skill, error) {
	var s model.Skill
	if err := r.db.First(&s, id).Error; err != nil {
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

func (r *SkillRepository) Delete(id uint) error {
	return r.db.Delete(&model.Skill{}, id).Error
}
