package middleware

import (
	"starry-server/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthRequired 登录认证中间件
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, err := c.Cookie("user_id")
		if err != nil || userIDStr == "" {
			if strings.HasPrefix(c.Request.URL.Path, "/api/") {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "请先登录"})
			} else {
				c.Redirect(http.StatusFound, "/")
			}
			c.Abort()
			return
		}

		var user models.User
		if err := models.DB.First(&user, userIDStr).Error; err != nil {
			if strings.HasPrefix(c.Request.URL.Path, "/api/") {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "用户认证失败"})
			} else {
				c.Redirect(http.StatusFound, "/")
			}
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Set("user_id", userIDStr)
		c.Next()
	}
}

// AdminRequired 管理员权限中间件
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		userVal, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "请先登录"})
			c.Abort()
			return
		}

		user := userVal.(models.User)
		if user.Username != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "权限不足，仅管理员可访问"})
			c.Abort()
			return
		}

		c.Next()
	}
}
