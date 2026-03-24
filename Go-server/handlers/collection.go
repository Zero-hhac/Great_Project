package handlers

import (
	"log"
	"net/http"
	"starry-server/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ListCollections 获取所有合集
func ListCollections(c *gin.Context) {
	var collections []models.Collection
	models.DB.Preload("User").Order("created_at desc").Find(&collections)
	c.JSON(http.StatusOK, collections)
}

// CreateCollection 创建新合集
func CreateCollection(c *gin.Context) {
	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "标题是必填项"})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.Atoi(userIDStr.(string))

	collection := models.Collection{
		Title:       input.Title,
		Description: input.Description,
		UserID:      uint(userID),
	}

	if err := models.DB.Create(&collection).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	models.DB.Preload("User").First(&collection, collection.ID)
	c.JSON(http.StatusOK, collection)
}

// GetCollectionArticles 获取合集下的文章
func GetCollectionArticles(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的合集 ID"})
		return
	}

	var articles []models.Article
	// 使用整数进行查询，确保与数据库类型匹配
	log.Printf("[GetCollectionArticles] Fetching articles for collection_id: %d", id)
	err = models.DB.Preload("User").Where("collection_id = ?", id).Order("created_at desc").Find(&articles).Error
	if err != nil {
		log.Printf("[GetCollectionArticles] Error fetching articles: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询文章失败"})
		return
	}

	log.Printf("[GetCollectionArticles] Found %d articles", len(articles))
	c.JSON(http.StatusOK, articles)
}
