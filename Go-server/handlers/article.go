package handlers

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"strings"

	"starry-server/models"

	"github.com/gin-gonic/gin"
	"github.com/gomarkdown/markdown"
	"gorm.io/gorm"
)

// ArticleList 文章列表
func ArticleList(c *gin.Context) {
	var articles []models.Article
	models.DB.Preload("User").Order("created_at desc").Find(&articles)

	profile := LoadProfile()
	nickname, _ := c.Cookie("nickname")
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	c.HTML(http.StatusOK, "article-list", gin.H{
		"title":    "文章列表",
		"articles": articles,
		"profile": gin.H{
			"Name":     profile.Name,
			"Nickname": profile.Nickname,
			"Avatar":   profile.Avatar,
			"Bio":      profile.Bio,
			"Skills":   getSkills(profile),
			"Email":    profile.Email,
			"GitHub":   profile.GitHub,
			"Blog":     profile.Blog,
			"Location": profile.Location,
		},
		"nickname": nickname,
		"isAdmin":  nickname == "admin",
		"userID":   uint(userID),
	})
}

func getSkills(p models.Profile) []string {
	var skills []string
	json.Unmarshal([]byte(p.Skills), &skills)
	return skills
}

// ArticleDetail 文章详情
func ArticleDetail(c *gin.Context) {
	id := c.Param("id")
	var article models.Article
	if err := models.DB.Preload("User").First(&article, id).Error; err != nil {
		profile := LoadProfile()
		nickname, _ := c.Cookie("nickname")
		c.HTML(http.StatusNotFound, "article-detail", gin.H{
			"title":    "文章未找到",
			"error":    "文章不存在或已被删除",
			"profile":  profile,
			"nickname": nickname,
		})
		return
	}

	// 获取评论
	var comments []models.Comment
	models.DB.Preload("User").Where("article_id = ?", article.ID).Order("created_at desc").Find(&comments)

	// 渲染 Markdown
	mdHTML := markdown.ToHTML([]byte(article.Content), nil, nil)

	profile := LoadProfile()
	nickname, _ := c.Cookie("nickname")
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	c.HTML(http.StatusOK, "article-detail", gin.H{
		"title":    article.Title,
		"article":  article,
		"content":  template.HTML(mdHTML),
		"comments": comments,
		"profile": gin.H{
			"Name":     profile.Name,
			"Nickname": profile.Nickname,
			"Avatar":   profile.Avatar,
			"Bio":      profile.Bio,
			"Skills":   getSkills(profile),
			"Email":    profile.Email,
			"GitHub":   profile.GitHub,
			"Blog":     profile.Blog,
			"Location": profile.Location,
		},
		"nickname": nickname,
		"isAdmin":  nickname == "admin",
		"userID":   uint(userID),
	})
}

// ShowCreateArticle 显示写文章页面
func ShowCreateArticle(c *gin.Context) {
	profile := LoadProfile()
	nickname, _ := c.Cookie("nickname")
	c.HTML(http.StatusOK, "article-create", gin.H{
		"title": "写文章",
		"profile": gin.H{
			"Name":     profile.Name,
			"Nickname": profile.Nickname,
			"Avatar":   profile.Avatar,
			"Bio":      profile.Bio,
			"Skills":   getSkills(profile),
			"Email":    profile.Email,
			"GitHub":   profile.GitHub,
			"Blog":     profile.Blog,
			"Location": profile.Location,
		},
		"nickname": nickname,
	})
}

// CreateArticle 创建文章
func CreateArticle(c *gin.Context) {
	title := strings.TrimSpace(c.PostForm("title"))
	content := strings.TrimSpace(c.PostForm("content"))

	if title == "" || content == "" {
		profile := LoadProfile()
		nickname, _ := c.Cookie("nickname")
		c.HTML(http.StatusOK, "article-create", gin.H{
			"title":   "写文章",
			"error":   "标题和内容不能为空",
			"atitle":  title,
			"content": content,
			"profile": gin.H{
				"Name":     profile.Name,
				"Nickname": profile.Nickname,
				"Avatar":   profile.Avatar,
				"Bio":      profile.Bio,
				"Skills":   getSkills(profile),
				"Email":    profile.Email,
				"GitHub":   profile.GitHub,
				"Blog":     profile.Blog,
				"Location": profile.Location,
			},
			"nickname": nickname,
		})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	article := models.Article{
		Title:   title,
		Content: content,
		UserID:  uint(userID),
	}

	if err := models.DB.Create(&article).Error; err != nil {
		profile := LoadProfile()
		nickname, _ := c.Cookie("nickname")
		c.HTML(http.StatusOK, "article-create", gin.H{
			"title":   "写文章",
			"error":   "发布失败，请重试",
			"atitle":  title,
			"content": content,
			"profile": gin.H{
				"Name":     profile.Name,
				"Nickname": profile.Nickname,
				"Avatar":   profile.Avatar,
				"Bio":      profile.Bio,
				"Skills":   getSkills(profile),
				"Email":    profile.Email,
				"GitHub":   profile.GitHub,
				"Blog":     profile.Blog,
				"Location": profile.Location,
			},
			"nickname": nickname,
		})
		return
	}

	c.Redirect(http.StatusFound, "/articles/"+strconv.Itoa(int(article.ID)))
}

// DeleteArticle 删除文章
func DeleteArticle(c *gin.Context) {
	id := c.Param("id")
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))
	nickname, _ := c.Cookie("nickname")

	var article models.Article
	if err := models.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章未找到"})
		return
	}

	// 权限检查：作者本人或 admin 管理员可以删除
	if article.UserID != uint(userID) && nickname != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "没有权限删除此文章"})
		return
	}

	if err := models.DB.Delete(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.Redirect(http.StatusFound, "/articles")
}

// CreateComment 提交评论
func CreateComment(c *gin.Context) {
	articleIDStr := c.PostForm("article_id")
	articleID, _ := strconv.Atoi(articleIDStr)
	content := strings.TrimSpace(c.PostForm("content"))

	if content == "" {
		c.Redirect(http.StatusFound, "/articles/"+articleIDStr)
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	comment := models.Comment{
		Content:   content,
		ArticleID: uint(articleID),
		UserID:    uint(userID),
	}

	models.DB.Create(&comment)
	c.Redirect(http.StatusFound, "/articles/"+articleIDStr)
}

// DeleteComment 删除评论
func DeleteComment(c *gin.Context) {
	id := c.Param("id")
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))
	nickname, _ := c.Cookie("nickname")

	var comment models.Comment
	if err := models.DB.First(&comment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评论未找到"})
		return
	}

	// 只有评论者、文章作者或 admin 可以删除评论
	var article models.Article
	models.DB.First(&article, comment.ArticleID)

	if comment.UserID != uint(userID) && article.UserID != uint(userID) && nickname != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "没有权限删除此评论"})
		return
	}

	models.DB.Delete(&comment)
	c.Redirect(http.StatusFound, "/articles/"+strconv.Itoa(int(comment.ArticleID)))
}

// ShowEditArticle 显示编辑文章页面
func ShowEditArticle(c *gin.Context) {
	id := c.Param("id")
	var article models.Article
	if err := models.DB.First(&article, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/articles")
		return
	}

	// 权限检查
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))
	nickname, _ := c.Cookie("nickname")

	if article.UserID != uint(userID) && nickname != "admin" {
		c.Redirect(http.StatusFound, "/articles/"+id)
		return
	}

	profile := LoadProfile()
	c.HTML(http.StatusOK, "article-edit", gin.H{
		"title":   "编辑文章",
		"article": article,
		"profile": gin.H{
			"Name":     profile.Name,
			"Nickname": profile.Nickname,
			"Avatar":   profile.Avatar,
			"Bio":      profile.Bio,
			"Skills":   getSkills(profile),
			"Email":    profile.Email,
			"GitHub":   profile.GitHub,
			"Blog":     profile.Blog,
			"Location": profile.Location,
		},
		"nickname": nickname,
	})
}

// UpdateArticle 更新文章
func UpdateArticle(c *gin.Context) {
	id := c.Param("id")
	title := strings.TrimSpace(c.PostForm("title"))
	content := strings.TrimSpace(c.PostForm("content"))

	var article models.Article
	if err := models.DB.First(&article, id).Error; err != nil {
		c.Redirect(http.StatusFound, "/articles")
		return
	}

	// 权限检查
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))
	nickname, _ := c.Cookie("nickname")

	if article.UserID != uint(userID) && nickname != "admin" {
		c.Redirect(http.StatusFound, "/articles/"+id)
		return
	}

	article.Title = title
	article.Content = content
	models.DB.Save(&article)

	c.Redirect(http.StatusFound, "/articles/"+id)
}

// --- API Handlers ---

// ArticleListAPI 文章列表 API
func ArticleListAPI(c *gin.Context) {
	var articles []models.Article
	models.DB.Preload("User").Order("created_at desc").Find(&articles)
	c.JSON(http.StatusOK, articles)
}

// ArticleDetailAPI 文章详情 API
func ArticleDetailAPI(c *gin.Context) {
	id := c.Param("id")
	var article models.Article
	if err := models.DB.Preload("User").First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
		return
	}

	var comments []models.Comment
	models.DB.Preload("User").Where("article_id = ?", article.ID).Order("created_at desc").Find(&comments)

	// 获取当前登录用户ID
	userIDStr, exists := c.Get("user_id")
	if exists {
		userID, _ := strconv.Atoi(userIDStr.(string))
		var like models.ArticleLike
		if models.DB.Where("user_id = ? AND article_id = ?", userID, article.ID).First(&like).Error == nil {
			article.IsLiked = true
		}

		// 为每个评论检查是否点赞
		for i := range comments {
			var clike models.CommentLike
			if models.DB.Where("user_id = ? AND comment_id = ?", userID, comments[i].ID).First(&clike).Error == nil {
				comments[i].IsLiked = true
			}
		}
	}

	mdHTML := markdown.ToHTML([]byte(article.Content), nil, nil)

	c.JSON(http.StatusOK, gin.H{
		"article":  article,
		"content":  string(mdHTML),
		"comments": comments,
	})
}

// CreateArticleAPI 创建文章 API
func CreateArticleAPI(c *gin.Context) {
	var input struct {
		Title        string `json:"title" binding:"required"`
		Content      string `json:"content" binding:"required"`
		CollectionID *uint  `json:"collection_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	article := models.Article{
		Title:        input.Title,
		Content:      input.Content,
		UserID:       uint(userID),
		CollectionID: input.CollectionID,
	}

	if err := models.DB.Create(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "发布失败"})
		return
	}

	c.JSON(http.StatusOK, article)
}

// UpdateArticleAPI 更新文章 API
func UpdateArticleAPI(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Title        string `json:"title" binding:"required"`
		Content      string `json:"content" binding:"required"`
		CollectionID *uint  `json:"collection_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("[UpdateArticleAPI] BindJSON error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	log.Printf("[UpdateArticleAPI] Updating article %s: title=%s, collection_id=%v", id, input.Title, input.CollectionID)

	var article models.Article
	if err := models.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章未找到"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	// 从 context 获取用户信息，这样更可靠
	userVal, _ := c.Get("user")
	user := userVal.(models.User)

	if article.UserID != uint(userID) && user.Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "没有权限修改此文章"})
		return
	}

	article.Title = input.Title
	article.Content = input.Content
	article.CollectionID = input.CollectionID

	// 使用 Select 明确指定要更新的字段，包括 collection_id（即使它为 nil/NULL）
	if err := models.DB.Model(&article).Select("Title", "Content", "CollectionID").Updates(map[string]interface{}{
		"title":         article.Title,
		"content":       article.Content,
		"collection_id": article.CollectionID,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存文章失败"})
		return
	}

	c.JSON(http.StatusOK, article)
}

// CreateCommentAPI 提交评论 API
func CreateCommentAPI(c *gin.Context) {
	var input struct {
		ArticleID uint   `json:"article_id" binding:"required"`
		Content   string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	comment := models.Comment{
		Content:   input.Content,
		ArticleID: input.ArticleID,
		UserID:    uint(userID),
	}

	if err := models.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "评论失败"})
		return
	}

	models.DB.Preload("User").First(&comment, comment.ID)
	c.JSON(http.StatusOK, comment)
}

// ToggleArticleLikeAPI 点赞/取消点赞文章
func ToggleArticleLikeAPI(c *gin.Context) {
	id := c.Param("id")
	var article models.Article
	if err := models.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
		return
	}

	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "请先登录"})
		return
	}
	userID, _ := strconv.Atoi(userIDStr.(string))

	var like models.ArticleLike
	res := models.DB.Where("user_id = ? AND article_id = ?", userID, article.ID).First(&like)
	if res.Error == nil {
		// 已点赞，取消点赞
		models.DB.Delete(&like)
		models.DB.Model(&article).UpdateColumn("likes_count", gorm.Expr("likes_count - ?", 1))
		c.JSON(http.StatusOK, gin.H{"status": "unliked", "likes_count": article.LikesCount - 1})
	} else {
		// 未点赞，添加点赞
		newLike := models.ArticleLike{UserID: uint(userID), ArticleID: article.ID}
		models.DB.Create(&newLike)
		models.DB.Model(&article).UpdateColumn("likes_count", gorm.Expr("likes_count + ?", 1))
		c.JSON(http.StatusOK, gin.H{"status": "liked", "likes_count": article.LikesCount + 1})
	}
}

// ToggleCommentLikeAPI 点赞/取消点赞评论
func ToggleCommentLikeAPI(c *gin.Context) {
	id := c.Param("id")
	var comment models.Comment
	if err := models.DB.First(&comment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评论不存在"})
		return
	}

	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "请先登录"})
		return
	}
	userID, _ := strconv.Atoi(userIDStr.(string))

	var like models.CommentLike
	res := models.DB.Where("user_id = ? AND comment_id = ?", userID, comment.ID).First(&like)
	if res.Error == nil {
		// 已点赞，取消点赞
		models.DB.Delete(&like)
		models.DB.Model(&comment).UpdateColumn("likes_count", gorm.Expr("likes_count - ?", 1))
		c.JSON(http.StatusOK, gin.H{"status": "unliked", "likes_count": comment.LikesCount - 1})
	} else {
		// 未点赞，添加点赞
		newLike := models.CommentLike{UserID: uint(userID), CommentID: comment.ID}
		models.DB.Create(&newLike)
		models.DB.Model(&comment).UpdateColumn("likes_count", gorm.Expr("likes_count + ?", 1))
		c.JSON(http.StatusOK, gin.H{"status": "liked", "likes_count": comment.LikesCount + 1})
	}
}
