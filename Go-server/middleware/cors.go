package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		}

		// 解决跨域 Cookie 丢失问题：
		// 1. 设置 SameSite=NoneMode，允许跨域传输 Cookie
		// 2. 注意：SameSite=None 要求必须同时设置 Secure=true
		// 只有在 HTTPS 下才启用 SameSite=None，因为 HTTP 不支持 Secure
		isSecure := c.GetHeader("X-Forwarded-Proto") == "https" || c.Request.TLS != nil
		if isSecure {
			c.SetSameSite(http.SameSiteNoneMode)
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
