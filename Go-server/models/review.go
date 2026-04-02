package models

import (
	"time"
)

// ArticleReview 文章审核记录表
type ArticleReview struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ArticleID uint      `gorm:"not null;index" json:"article_id"`
	Article   Article   `gorm:"foreignKey:ArticleID" json:"article"`
	UserID    uint      `gorm:"not null" json:"user_id"` // 审核人 ID (管理员)
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Status    int       `gorm:"default:0" json:"status"` // 0: 待审核, 1: 已通过, 2: 已驳回
	Comment   string    `json:"comment"`                 // 驳回原因等
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserSpeechPermission 用户发言权权限表
type UserSpeechPermission struct {
	UserID        uint      `gorm:"primaryKey" json:"user_id"`
	HasPermission bool      `gorm:"default:true" json:"has_permission"`
	UpdatedBy     uint      `json:"updated_by"` // 最后修改权限的管理员 ID
	UpdatedAt     time.Time `json:"updated_at"`
}

// Notification 系统通知表
type Notification struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	UserID         uint      `gorm:"not null;index" json:"user_id"` // 接收人 ID
	Type           string    `gorm:"size:50" json:"type"`           // 通知类型: review_request, review_result, etc.
	Content        string    `gorm:"type:text" json:"content"`
	ArticleID      uint      `json:"article_id"` // 关联的文章 ID
	IsRead         bool      `gorm:"default:false" json:"is_read"`
	IsAcknowledged bool      `gorm:"default:false" json:"is_acknowledged"` // 管理员是否已点击"已知悉"
	CreatedAt      time.Time `json:"created_at"`
}

// AuditLog 审核操作日志表
type AuditLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"` // 操作人 ID
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Action    string    `gorm:"size:50;not null" json:"action"` // 操作类型: approve_article, reject_article, update_permission
	TargetID  uint      `json:"target_id"`                      // 目标 ID (文章 ID 或用户 ID)
	Details   string    `gorm:"type:text" json:"details"`       // 操作详情
	CreatedAt time.Time `json:"created_at"`
}
