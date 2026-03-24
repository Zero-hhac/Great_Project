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

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()

		// 解决跨域 Cookie 丢失问题：在跨域请求中，现代浏览器要求 Cookie 必须设置 SameSite=None 和 Secure 属性
		header := c.Writer.Header()
		if cookies, ok := header["Set-Cookie"]; ok {
			for i, cookie := range cookies {
				header["Set-Cookie"][i] = cookie + "; SameSite=None; Secure"
			}
		}
	}
}
