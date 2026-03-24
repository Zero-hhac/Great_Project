package handlers

import (
	"net/http"
	"strconv"

	"starry-server/models"

	"github.com/gin-gonic/gin"
)

// GetUserProfileAPI 获取当前用户的个人资料
func GetUserProfileAPI(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateUserProfileAPI 更新当前用户的个人资料
func UpdateUserProfileAPI(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	var input struct {
		Nickname string `json:"nickname"`
		Avatar   string `json:"avatar"`
		Cover    string `json:"cover"`
		Bio      string `json:"bio"`
		Email    string `json:"email"`
		QQ       string `json:"qq"`
		Github   string `json:"github"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	var user models.User
	if err := models.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	if input.Nickname != "" {
		user.Nickname = input.Nickname
	}
	user.Avatar = input.Avatar
	user.Cover = input.Cover
	user.Bio = input.Bio
	user.Email = input.Email
	user.QQ = input.QQ
	user.Github = input.Github

	if err := models.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存失败"})
		return
	}

	// 更新 cookie 中的 nickname（如果改变了）
	c.SetCookie("nickname", user.Nickname, 3600*24*7, "/", "", false, false)

	c.JSON(http.StatusOK, gin.H{"message": "修改成功", "user": user})
}
