package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// SetAuthCookies 设置认证相关的Cookie
func SetAuthCookies(c *gin.Context, userID uint, nickname string) {
	isSecure := c.GetHeader("X-Forwarded-Proto") == "https" || c.Request.TLS != nil
	c.SetCookie("user_id", strconv.Itoa(int(userID)), 3600*24*7, "/", "", isSecure, true)
	c.SetCookie("nickname", nickname, 3600*24*7, "/", "", isSecure, true)
}

// ClearAuthCookies 清除认证相关的Cookie
func ClearAuthCookies(c *gin.Context) {
	isSecure := c.GetHeader("X-Forwarded-Proto") == "https" || c.Request.TLS != nil
	c.SetCookie("user_id", "", -1, "/", "", isSecure, true)
	c.SetCookie("nickname", "", -1, "/", "", isSecure, true)
}

// GetUserFromContext 从context中获取用户对象
func GetUserFromContext(c *gin.Context) (interface{}, bool) {
	return c.Get("user")
}

// GetUserIDFromContext 从context中获取用户ID
func GetUserIDFromContext(c *gin.Context) (string, bool) {
	val, exists := c.Get("user_id")
	if !exists {
		return "", false
	}
	userID, ok := val.(string)
	return userID, ok
}
