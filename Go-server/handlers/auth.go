package handlers

import (
	"net/http"
	"strconv"

	"starry-server/models"

	"github.com/gin-gonic/gin"
)

// ShowLogin 显示登录页面
func ShowLogin(c *gin.Context) {
	c.HTML(http.StatusOK, "login", gin.H{})
}

// Login 处理登录
func Login(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")

	var user models.User
	if err := models.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.HTML(http.StatusOK, "login", gin.H{
			"error":    "用户名或密码错误",
			"username": username,
		})
		return
	}

	if !user.CheckPassword(password) {
		c.HTML(http.StatusOK, "login", gin.H{
			"error":    "用户名或密码错误",
			"username": username,
		})
		return
	}

	c.SetCookie("user_id", strconv.Itoa(int(user.ID)), 3600*24*7, "/", "", false, true)
	c.SetCookie("nickname", user.Nickname, 3600*24*7, "/", "", false, false)
	c.Redirect(http.StatusFound, "/")
}

// LoginAPI 处理 JSON 格式的登录请求
func LoginAPI(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	var user models.User
	if err := models.DB.Where("username = ?", input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	if !user.CheckPassword(input.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	c.SetCookie("user_id", strconv.Itoa(int(user.ID)), 3600*24*7, "/", "", false, true)
	c.SetCookie("nickname", user.Nickname, 3600*24*7, "/", "", false, false)
	
	c.JSON(http.StatusOK, gin.H{
		"message":  "登录成功",
		"user_id":  user.ID,
		"nickname": user.Nickname,
	})
}

// RegisterAPI 处理 JSON 格式的注册请求
func RegisterAPI(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Nickname string `json:"nickname"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	if input.Nickname == "" {
		input.Nickname = input.Username
	}

	// 检查用户名是否已存在
	var count int64
	models.DB.Model(&models.User{}).Where("username = ?", input.Username).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "用户名已存在"})
		return
	}

	user := models.User{
		Username: input.Username,
		Nickname: input.Nickname,
	}
	if err := user.SetPassword(input.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注册失败，请重试"})
		return
	}

	if err := models.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "注册失败，请重试"})
		return
	}

	c.SetCookie("user_id", strconv.Itoa(int(user.ID)), 3600*24*7, "/", "", false, true)
	c.SetCookie("nickname", user.Nickname, 3600*24*7, "/", "", false, false)

	c.JSON(http.StatusOK, gin.H{
		"message":  "注册成功",
		"user_id":  user.ID,
		"nickname": user.Nickname,
	})
}

// ShowRegister 显示注册页面
func ShowRegister(c *gin.Context) {
	c.HTML(http.StatusOK, "register", gin.H{})
}

// Register 处理注册
func Register(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")
	nickname := c.PostForm("nickname")

	if username == "" || password == "" {
		c.HTML(http.StatusOK, "register", gin.H{
			"error":    "用户名和密码不能为空",
			"username": username,
			"nickname": nickname,
		})
		return
	}

	if nickname == "" {
		nickname = username
	}

	// 检查用户名是否已存在
	var count int64
	models.DB.Model(&models.User{}).Where("username = ?", username).Count(&count)
	if count > 0 {
		c.HTML(http.StatusOK, "register", gin.H{
			"error":    "用户名已存在",
			"nickname": nickname,
		})
		return
	}

	user := models.User{
		Username: username,
		Nickname: nickname,
	}
	if err := user.SetPassword(password); err != nil {
		c.HTML(http.StatusOK, "register", gin.H{
			"error": "注册失败，请重试",
		})
		return
	}

	if err := models.DB.Create(&user).Error; err != nil {
		c.HTML(http.StatusOK, "register", gin.H{
			"error": "注册失败，请重试",
		})
		return
	}

	c.SetCookie("user_id", strconv.Itoa(int(user.ID)), 3600*24*7, "/", "", false, true)
	c.SetCookie("nickname", user.Nickname, 3600*24*7, "/", "", false, false)
	c.Redirect(http.StatusFound, "/")
}

// Logout 处理登出
func Logout(c *gin.Context) {
	c.SetCookie("user_id", "", -1, "/", "", false, true)
	c.SetCookie("nickname", "", -1, "/", "", false, false)
	
	// 无论从哪里登出，都统一重定向到 Next.js 的登录页面
	c.Redirect(http.StatusFound, "http://localhost:3002/")
}
