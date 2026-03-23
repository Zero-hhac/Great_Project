package models

import (
	"time"
)

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	ArticleID uint      `gorm:"not null" json:"article_id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	User       User      `gorm:"foreignKey:UserID" json:"user"`
	LikesCount int       `gorm:"default:0" json:"likes_count"`
	IsLiked    bool      `gorm:"-" json:"is_liked"`
	CreatedAt time.Time `json:"created_at"`
}
