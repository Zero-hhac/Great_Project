package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthRequired 登录认证中间件
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := c.Cookie("user_id")
		if err != nil || userID == "" {
			// 如果是 API 请求，返回 401 JSON，而不是重定向
			if strings.HasPrefix(c.Request.URL.Path, "/api/") {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "请先登录"})
				c.Abort()
				return
			}
			
			// 普通页面请求，重定向到 Next.js 登录页
			c.Redirect(http.StatusFound, "http://localhost:3002/")
			c.Abort()
			return
		}
		c.Set("user_id", userID)
		c.Next()
	}
}
