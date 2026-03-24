package handlers

import (
	"net/http"
	"time"

	"Go-learn/models"

	"github.com/gin-gonic/gin"
)

// AdminStatsAPI 管理员统计数据
func AdminStatsAPI(c *gin.Context) {
	nickname, _ := c.Cookie("nickname")
	if nickname != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	var userCount int64
	models.DB.Model(&models.User{}).Count(&userCount)

	var articleCount int64
	models.DB.Model(&models.Article{}).Count(&articleCount)

	var commentCount int64
	models.DB.Model(&models.Comment{}).Count(&commentCount)

	// 模拟流量数据 (近 7 天)
	trafficData := []gin.H{
		{"date": time.Now().AddDate(0, 0, -6).Format("01-02"), "views": 120, "visitors": 45},
		{"date": time.Now().AddDate(0, 0, -5).Format("01-02"), "views": 250, "visitors": 88},
		{"date": time.Now().AddDate(0, 0, -4).Format("01-02"), "views": 180, "visitors": 62},
		{"date": time.Now().AddDate(0, 0, -3).Format("01-02"), "views": 320, "visitors": 110},
		{"date": time.Now().AddDate(0, 0, -2).Format("01-02"), "views": 450, "visitors": 156},
		{"date": time.Now().AddDate(0, 0, -1).Format("01-02"), "views": 380, "visitors": 134},
		{"date": time.Now().Format("01-02"), "views": 520, "visitors": 189},
	}

	// 注册趋势 (近 7 天)
	regTrend := []gin.H{
		{"date": time.Now().AddDate(0, 0, -6).Format("01-02"), "count": 2},
		{"date": time.Now().AddDate(0, 0, -5).Format("01-02"), "count": 5},
		{"date": time.Now().AddDate(0, 0, -4).Format("01-02"), "count": 3},
		{"date": time.Now().AddDate(0, 0, -3).Format("01-02"), "count": 8},
		{"date": time.Now().AddDate(0, 0, -2).Format("01-02"), "count": 12},
		{"date": time.Now().AddDate(0, 0, -1).Format("01-02"), "count": 7},
		{"date": time.Now().Format("01-02"), "count": 15},
	}

	c.JSON(http.StatusOK, gin.H{
		"total_users":    userCount,
		"total_articles": articleCount,
		"total_comments": commentCount,
		"traffic":        trafficData,
		"reg_trend":      regTrend,
	})
}

// AdminUsersAPI 管理员获取用户列表
func AdminUsersAPI(c *gin.Context) {
	nickname, _ := c.Cookie("nickname")
	if nickname != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	var users []models.User
	models.DB.Order("created_at desc").Find(&users)

	c.JSON(http.StatusOK, users)
}
