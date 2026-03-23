package models

import "time"

// ArticleLike 记录用户点赞文章
type ArticleLike struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex:idx_user_article;not null" json:"user_id"`
	ArticleID uint      `gorm:"uniqueIndex:idx_user_article;not null" json:"article_id"`
	CreatedAt time.Time `json:"created_at"`
}

// CommentLike 记录用户点赞评论
type CommentLike struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex:idx_user_comment;not null" json:"user_id"`
	CommentID uint      `gorm:"uniqueIndex:idx_user_comment;not null" json:"comment_id"`
	CreatedAt time.Time `json:"created_at"`
}
