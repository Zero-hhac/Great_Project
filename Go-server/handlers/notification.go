package handlers

import (
	"net/http"
	"starry-server/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// UnreadNotificationsAPI 获取未读通知列表
func UnreadNotificationsAPI(c *gin.Context) {
	user := c.MustGet("user").(models.User)
	var notifications []models.Notification
	if err := models.DB.Where("user_id = ? AND is_read = false", user.ID).Order("created_at desc").Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取通知失败"})
		return
	}
	c.JSON(http.StatusOK, notifications)
}

// MarkNotificationReadAPI 标记通知为已读
func MarkNotificationReadAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var notification models.Notification
	if err := models.DB.First(&notification, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "通知未找到"})
		return
	}

	notification.IsRead = true
	if err := models.DB.Save(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "标记失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "标记成功"})
}

// AcknowledgeNotificationAPI 管理员已知悉弹窗通知
func AcknowledgeNotificationAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var notification models.Notification
	if err := models.DB.First(&notification, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "通知未找到"})
		return
	}

	notification.IsAcknowledged = true
	notification.IsRead = true // 同时也标记为已读
	if err := models.DB.Save(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "确认失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "确认成功"})
}
