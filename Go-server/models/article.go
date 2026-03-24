package models

import (
	"time"

	"gorm.io/gorm"
)

type Article struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Title        string         `gorm:"size:200;not null" json:"title"`
	Content      string         `gorm:"type:text;not null" json:"content"`
	UserID       uint           `gorm:"not null" json:"user_id"`
	User         User           `gorm:"foreignKey:UserID" json:"user"`
	CollectionID *uint          `gorm:"column:collection_id" json:"collection_id"`
	Collection   *Collection    `gorm:"foreignKey:CollectionID" json:"collection"`
	LikesCount   int            `gorm:"default:0" json:"likes_count"`
	IsLiked      bool           `gorm:"-" json:"is_liked"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
