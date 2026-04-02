package handlers

import (
	"log"
	"net/http"
	"time"

	"starry-server/models"

	"github.com/gin-gonic/gin"
)

// AdminStatsAPI 管理员统计数据
func AdminStatsAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	var userCount int64
	if err := models.DB.Model(&models.User{}).Count(&userCount).Error; err != nil {
		log.Printf("[admin] count users error: %v", err)
	}

	var articleCount int64
	if err := models.DB.Model(&models.Article{}).Count(&articleCount).Error; err != nil {
		log.Printf("[admin] count articles error: %v", err)
	}

	var commentCount int64
	if err := models.DB.Model(&models.Comment{}).Count(&commentCount).Error; err != nil {
		log.Printf("[admin] count comments error: %v", err)
	}

	// 总点赞数（文章 + 评论）
	var articleLikes int64
	models.DB.Model(&models.Article{}).Select("COALESCE(SUM(likes_count),0)").Scan(&articleLikes)
	var commentLikes int64
	models.DB.Model(&models.Comment{}).Select("COALESCE(SUM(likes_count),0)").Scan(&commentLikes)
	totalLikes := articleLikes + commentLikes

	// ── 近 7 天趋势：纯 Go 层面处理，兼容 MySQL 和 PostgreSQL ──
	weekAgo := time.Now().AddDate(0, 0, -6).Truncate(24 * time.Hour)

	// 查出近 7 天所有文章，在 Go 里按日期分组
	var allArticles []models.Article
	models.DB.Where("created_at >= ?", weekAgo).Find(&allArticles)
	articleMap := make(map[string]int64)
	for _, a := range allArticles {
		key := a.CreatedAt.Format("01-02")
		articleMap[key]++
	}

	// 查出近 7 天所有评论，在 Go 里按日期分组
	var allComments []models.Comment
	models.DB.Where("created_at >= ?", weekAgo).Find(&allComments)
	commentMap := make(map[string]int64)
	for _, c := range allComments {
		key := c.CreatedAt.Format("01-02")
		commentMap[key]++
	}

	// 补全缺失日期
	var weekArticlesFilled []gin.H
	var weekCommentsFilled []gin.H
	for i := 6; i >= 0; i-- {
		dateStr := time.Now().AddDate(0, 0, -i).Format("01-02")
		weekArticlesFilled = append(weekArticlesFilled, gin.H{
			"date":  dateStr,
			"count": articleMap[dateStr],
		})
		weekCommentsFilled = append(weekCommentsFilled, gin.H{
			"date":  dateStr,
			"count": commentMap[dateStr],
		})
	}

	// 今日新增
	today := time.Now().Truncate(24 * time.Hour)
	var todayArticles int64
	models.DB.Model(&models.Article{}).Where("created_at >= ?", today).Count(&todayArticles)
	var todayComments int64
	models.DB.Model(&models.Comment{}).Where("created_at >= ?", today).Count(&todayComments)
	var todayUsers int64
	models.DB.Model(&models.User{}).Where("created_at >= ?", today).Count(&todayUsers)

	// 最近 7 天新增
	var weekArticles int64
	models.DB.Model(&models.Article{}).Where("created_at >= ?", weekAgo).Count(&weekArticles)
	var weekComments int64
	models.DB.Model(&models.Comment{}).Where("created_at >= ?", weekAgo).Count(&weekComments)

	// 热门文章（按点赞数排序前 5）
	type TopArticle struct {
		ID         uint   `json:"id"`
		Title      string `json:"title"`
		LikesCount int    `json:"likes_count"`
		UserID     uint   `json:"user_id"`
	}
	var topArticles []TopArticle
	models.DB.Model(&models.Article{}).
		Select("id, title, likes_count, user_id").
		Order("likes_count desc").
		Limit(5).
		Scan(&topArticles)

	// 最近注册的 5 个用户
	var recentUsers []models.User
	models.DB.Order("created_at desc").Limit(5).Find(&recentUsers)

	log.Printf("[admin] stats: users=%d articles=%d comments=%d likes=%d",
		userCount, articleCount, commentCount, totalLikes)

	c.JSON(http.StatusOK, gin.H{
		"total_users":    userCount,
		"total_articles": articleCount,
		"total_comments": commentCount,
		"total_likes":    totalLikes,
		"today": gin.H{
			"articles": todayArticles,
			"comments": todayComments,
			"users":    todayUsers,
		},
		"week": gin.H{
			"articles": weekArticles,
			"comments": weekComments,
		},
		"weekly_articles": weekArticlesFilled,
		"weekly_comments": weekCommentsFilled,
		"top_articles":    topArticles,
		"recent_users":    recentUsers,
	})
}

// AdminUsersAPI 管理员获取用户列表
func AdminUsersAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	var users []models.User
	models.DB.Order("created_at desc").Find(&users)

	log.Printf("[admin] users list: found %d users", len(users))
	c.JSON(http.StatusOK, users)
}

// AdminDeleteUserAPI 管理员删除用户
func AdminDeleteUserAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	id := c.Param("id")
	var targetUser models.User
	if err := models.DB.First(&targetUser, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}
	if targetUser.Username == "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不能删除管理员账号"})
		return
	}

	models.DB.Where("user_id = ?", id).Delete(&models.Comment{})
	models.DB.Where("user_id = ?", id).Delete(&models.Article{})
	models.DB.Delete(&targetUser)

	log.Printf("[admin] deleted user: %s (id=%s)", targetUser.Username, id)
	c.JSON(http.StatusOK, gin.H{"message": "用户已删除"})
}

// AdminArticlesAPI 管理员获取文章列表
func AdminArticlesAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	type ArticleWithUser struct {
		ID         uint        `json:"id"`
		Title      string      `json:"title"`
		Content    string      `json:"content"`
		UserID     uint        `json:"user_id"`
		LikesCount int         `json:"likes_count"`
		CreatedAt  time.Time   `json:"created_at"`
		User       models.User `json:"user"`
	}

	var articles []models.Article
	err := models.DB.Preload("User").Order("created_at desc").Find(&articles).Error
	if err != nil {
		log.Printf("[admin] articles query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	// 统一返回格式，虽然直接返回 articles 也可以，但我们可以显式一点
	log.Printf("[admin] articles list: found %d articles", len(articles))
	c.JSON(http.StatusOK, articles)
}

// AdminDeleteArticleAPI 管理员删除文章
func AdminDeleteArticleAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	id := c.Param("id")
	var article models.Article
	if err := models.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章不存在"})
		return
	}

	models.DB.Where("article_id = ?", id).Delete(&models.Comment{})
	models.DB.Delete(&article)

	log.Printf("[admin] deleted article: %s (id=%s)", article.Title, id)
	c.JSON(http.StatusOK, gin.H{"message": "文章已删除"})
}

// AdminCommentsAPI 管理员获取评论列表
func AdminCommentsAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	var comments []models.Comment
	err := models.DB.Preload("User").Order("created_at desc").Find(&comments).Error
	if err != nil {
		log.Printf("[admin] comments query error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	// 关联文章标题
	type CommentWithArticle struct {
		ID           uint        `json:"id"`
		Content      string      `json:"content"`
		CreatedAt    time.Time   `json:"created_at"`
		LikesCount   int         `json:"likes_count"`
		UserID       uint        `json:"user_id"`
		ArticleID    uint        `json:"article_id"`
		ArticleTitle string      `json:"article_title"`
		User         models.User `json:"user"`
	}
	var results []CommentWithArticle
	for _, cm := range comments {
		var article models.Article
		models.DB.Select("title").First(&article, cm.ArticleID)
		results = append(results, CommentWithArticle{
			ID:           cm.ID,
			Content:      cm.Content,
			CreatedAt:    cm.CreatedAt,
			LikesCount:   cm.LikesCount,
			UserID:       cm.UserID,
			ArticleID:    cm.ArticleID,
			ArticleTitle: article.Title,
			User:         cm.User,
		})
	}

	log.Printf("[admin] comments list: found %d comments", len(results))
	c.JSON(http.StatusOK, results)
}

// AdminDeleteCommentAPI 管理员删除评论
func AdminDeleteCommentAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	id := c.Param("id")
	var comment models.Comment
	if err := models.DB.First(&comment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "评论不存在"})
		return
	}

	models.DB.Delete(&comment)

	log.Printf("[admin] deleted comment id=%s", id)
	c.JSON(http.StatusOK, gin.H{"message": "评论已删除"})
}

// AdminUserActivityAPI 用户活跃度统计
func AdminUserActivityAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	// 获取所有用户
	var users []models.User
	models.DB.Order("created_at desc").Find(&users)

	// 统计每个用户的活跃度
	type UserActivity struct {
		ID            uint      `json:"id"`
		Username      string    `json:"username"`
		Nickname      string    `json:"nickname"`
		Avatar        string    `json:"avatar"`
		ArticleCount  int64     `json:"article_count"`
		CommentCount  int64     `json:"comment_count"`
		TotalLikes    int64     `json:"total_likes"`
		ActivityScore int64     `json:"activity_score"`
		CreatedAt     time.Time `json:"created_at"`
		LastActiveAt  time.Time `json:"last_active_at"`
	}

	var activities []UserActivity
	for _, u := range users {
		var articleCount int64
		var commentCount int64
		var totalLikes int64

		models.DB.Model(&models.Article{}).Where("user_id = ?", u.ID).Count(&articleCount)
		models.DB.Model(&models.Comment{}).Where("user_id = ?", u.ID).Count(&commentCount)
		models.DB.Model(&models.Article{}).Where("user_id = ?", u.ID).Select("COALESCE(SUM(likes_count),0)").Scan(&totalLikes)

		// 活跃度分数 = 文章数 * 10 + 评论数 * 3 + 获赞数 * 1
		activityScore := articleCount*10 + commentCount*3 + totalLikes

		// 获取最后活跃时间（最近的文章或评论）
		var lastArticle models.Article
		var lastComment models.Comment
		var lastActiveAt time.Time

		models.DB.Where("user_id = ?", u.ID).Order("created_at desc").First(&lastArticle)
		models.DB.Where("user_id = ?", u.ID).Order("created_at desc").First(&lastComment)

		if lastArticle.CreatedAt.After(lastComment.CreatedAt) {
			lastActiveAt = lastArticle.CreatedAt
		} else {
			lastActiveAt = lastComment.CreatedAt
		}

		activities = append(activities, UserActivity{
			ID:            u.ID,
			Username:      u.Username,
			Nickname:      u.Nickname,
			Avatar:        u.Avatar,
			ArticleCount:  articleCount,
			CommentCount:  commentCount,
			TotalLikes:    totalLikes,
			ActivityScore: activityScore,
			CreatedAt:     u.CreatedAt,
			LastActiveAt:  lastActiveAt,
		})
	}

	// 按活跃度排序
	for i := 0; i < len(activities)-1; i++ {
		for j := i + 1; j < len(activities); j++ {
			if activities[j].ActivityScore > activities[i].ActivityScore {
				activities[i], activities[j] = activities[j], activities[i]
			}
		}
	}

	// 统计近30天每天的新用户数
	thirtyDaysAgo := time.Now().AddDate(0, 0, -29).Truncate(24 * time.Hour)
	var recentUsers []models.User
	models.DB.Where("created_at >= ?", thirtyDaysAgo).Find(&recentUsers)

	userGrowthMap := make(map[string]int64)
	for _, u := range recentUsers {
		key := u.CreatedAt.Format("01-02")
		userGrowthMap[key]++
	}

	var userGrowth []gin.H
	for i := 29; i >= 0; i-- {
		dateStr := time.Now().AddDate(0, 0, -i).Format("01-02")
		userGrowth = append(userGrowth, gin.H{
			"date":  dateStr,
			"count": userGrowthMap[dateStr],
		})
	}

	// 统计近30天每天的活跃用户数（有文章或评论的用户）
	var thirtyDayArticles []models.Article
	var thirtyDayComments []models.Comment
	models.DB.Where("created_at >= ?", thirtyDaysAgo).Find(&thirtyDayArticles)
	models.DB.Where("created_at >= ?", thirtyDaysAgo).Find(&thirtyDayComments)

	activeUsersMap := make(map[string]map[uint]bool)
	for i := 29; i >= 0; i-- {
		dateStr := time.Now().AddDate(0, 0, -i).Format("01-02")
		activeUsersMap[dateStr] = make(map[uint]bool)
	}

	for _, a := range thirtyDayArticles {
		key := a.CreatedAt.Format("01-02")
		if _, exists := activeUsersMap[key]; exists {
			activeUsersMap[key][a.UserID] = true
		}
	}
	for _, cm := range thirtyDayComments {
		key := cm.CreatedAt.Format("01-02")
		if _, exists := activeUsersMap[key]; exists {
			activeUsersMap[key][cm.UserID] = true
		}
	}

	var activeUsers []gin.H
	for i := 29; i >= 0; i-- {
		dateStr := time.Now().AddDate(0, 0, -i).Format("01-02")
		activeUsers = append(activeUsers, gin.H{
			"date":  dateStr,
			"count": len(activeUsersMap[dateStr]),
		})
	}

	log.Printf("[admin] user activity: %d users analyzed", len(activities))

	c.JSON(http.StatusOK, gin.H{
		"users":        activities,
		"user_growth":  userGrowth,
		"active_users": activeUsers,
	})
}

// AdminAuditLogsAPI 获取操作日志列表
func AdminAuditLogsAPI(c *gin.Context) {
	user, _ := c.Get("user")
	if user.(models.User).Username != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "权限不足"})
		return
	}

	var logs []models.AuditLog
	if err := models.DB.Preload("User").Order("created_at desc").Limit(100).Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}

	c.JSON(http.StatusOK, logs)
}
