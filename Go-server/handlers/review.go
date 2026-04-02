package handlers

import (
	"net/http"
	"starry-server/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AdminReviewsAPI 获取待审核文章列表
func AdminReviewsAPI(c *gin.Context) {
	var articles []models.Article
	if err := models.DB.Preload("User").Where("review_status = ?", 0).Order("created_at desc").Find(&articles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取列表失败"})
		return
	}
	c.JSON(http.StatusOK, articles)
}

// ReviewActionAPI 审核文章
func ReviewActionAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var input struct {
		Action  string `json:"action" binding:"required"` // approve, reject
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效输入"})
		return
	}

	var article models.Article
	if err := models.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章未找到"})
		return
	}

	status := 0
	if input.Action == "approve" {
		status = 1
	} else if input.Action == "reject" {
		status = 2
	}

	article.ReviewStatus = status
	if err := models.DB.Save(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新状态失败"})
		return
	}

	// 记录审核历史
	admin := c.MustGet("user").(models.User)
	models.DB.Create(&models.ArticleReview{
		ArticleID: uint(id),
		UserID:    admin.ID,
		Status:    status,
		Comment:   input.Comment,
	})

	// 记录操作日志
	details := "审核文章《" + article.Title + "》"
	if input.Action == "approve" {
		details += "，操作：通过"
	} else {
		details += "，操作：驳回"
		if input.Comment != "" {
			details += "，原因：" + input.Comment
		}
	}
	models.DB.Create(&models.AuditLog{
		UserID:   admin.ID,
		Action:   "review_article_" + input.Action,
		TargetID: article.ID,
		Details:  details,
	})

	// 通知用户审核结果
	models.DB.Create(&models.Notification{
		UserID:    article.UserID,
		Type:      "review_result",
		Content:   "你的文章《" + article.Title + "》审核结果为: " + input.Action,
		ArticleID: article.ID,
	})

	c.JSON(http.StatusOK, gin.H{"message": "操作成功"})
}

// AdminUserPermissionsAPI 获取用户权限列表
func AdminUserPermissionsAPI(c *gin.Context) {
	var users []models.User
	if err := models.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取列表失败"})
		return
	}

	var result []gin.H
	for _, user := range users {
		var permission models.UserSpeechPermission
		models.DB.Where("user_id = ?", user.ID).First(&permission)
		result = append(result, gin.H{
			"user_id":        user.ID,
			"username":       user.Username,
			"nickname":       user.Nickname,
			"has_permission": permission.HasPermission,
		})
	}

	c.JSON(http.StatusOK, result)
}

// UpdateUserPermissionAPI 修改用户权限
func UpdateUserPermissionAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var input struct {
		HasPermission bool `json:"has_permission"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效输入"})
		return
	}

	admin := c.MustGet("user").(models.User)
	var permission models.UserSpeechPermission
	if err := models.DB.Where("user_id = ?", id).First(&permission).Error; err != nil {
		// 不存在则创建
		models.DB.Create(&models.UserSpeechPermission{
			UserID:        uint(id),
			HasPermission: input.HasPermission,
			UpdatedBy:     admin.ID,
		})
	} else {
		permission.HasPermission = input.HasPermission
		permission.UpdatedBy = admin.ID
		models.DB.Save(&permission)
	}

	// 记录操作日志
	var targetUser models.User
	models.DB.First(&targetUser, id)
	action := "update_permission"
	details := "修改用户 " + targetUser.Username + " 的发言权权限为："
	if input.HasPermission {
		details += "开启"
	} else {
		details += "关闭"
	}
	models.DB.Create(&models.AuditLog{
		UserID:   admin.ID,
		Action:   action,
		TargetID: uint(id),
		Details:  details,
	})

	c.JSON(http.StatusOK, gin.H{"message": "操作成功"})
}
