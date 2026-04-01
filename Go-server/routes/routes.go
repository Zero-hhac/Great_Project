package routes

import (
	"starry-server/handlers"
	"starry-server/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterPublicRoutes 注册公开路由（无需登录）
func RegisterPublicRoutes(r *gin.Engine) {
	r.GET("/login", handlers.ShowLogin)
	r.POST("/login", handlers.Login)
	r.POST("/api/login", handlers.LoginAPI)
	r.GET("/register", handlers.ShowRegister)
	r.POST("/register", handlers.Register)
	r.POST("/api/register", handlers.RegisterAPI)
}

// RegisterAuthRoutes 注册需要认证的路由
func RegisterAuthRoutes(r *gin.Engine) {
	auth := r.Group("/")
	auth.Use(middleware.AuthRequired())
	{
		// 首页和个人资料
		auth.GET("/", handlers.Home)
		auth.GET("/api/home", handlers.HomeAPI)
		auth.GET("/profile", handlers.ShowProfile)
		auth.POST("/profile", handlers.UpdateProfile)
		auth.GET("/api/profile", handlers.ShowProfile)
		auth.POST("/api/profile", handlers.UpdateProfileAPI)
		auth.GET("/api/user/profile", handlers.GetUserProfileAPI)
		auth.POST("/api/user/profile", handlers.UpdateUserProfileAPI)
		auth.POST("/photos/update", handlers.UpdatePhotos)
		auth.POST("/api/photos/update", handlers.UpdatePhotosAPI)
		auth.POST("/logout", handlers.Logout)

		// 文章相关
		auth.GET("/articles", handlers.ArticleList)
		auth.GET("/api/articles", handlers.ArticleListAPI)
		auth.GET("/articles/create", handlers.ShowCreateArticle)
		auth.POST("/articles/create", handlers.CreateArticle)
		auth.POST("/api/articles/create", handlers.CreateArticleAPI)
		auth.GET("/articles/edit/:id", handlers.ShowEditArticle)
		auth.POST("/articles/edit/:id", handlers.UpdateArticle)
		auth.POST("/api/articles/edit/:id", handlers.UpdateArticleAPI)
		auth.POST("/articles/delete/:id", handlers.DeleteArticle)
		auth.GET("/articles/:id", handlers.ArticleDetail)
		auth.GET("/api/articles/:id", handlers.ArticleDetailAPI)
		auth.POST("/api/articles/:id/like", handlers.ToggleArticleLikeAPI)

		// 合集相关
		auth.GET("/api/collections", handlers.ListCollections)
		auth.POST("/api/collections", handlers.CreateCollection)
		auth.GET("/api/collections/:id/articles", handlers.GetCollectionArticles)

		// 评论相关
		auth.POST("/comments/create", handlers.CreateComment)
		auth.POST("/api/comments/create", handlers.CreateCommentAPI)
		auth.POST("/comments/delete/:id", handlers.DeleteComment)
		auth.POST("/api/comments/:id/like", handlers.ToggleCommentLikeAPI)

		// 管理员接口
		adminGroup := auth.Group("/api/admin")
		{
			adminGroup.GET("/stats", handlers.AdminStatsAPI)
			adminGroup.GET("/users", handlers.AdminUsersAPI)
			adminGroup.DELETE("/users/:id", handlers.AdminDeleteUserAPI)
			adminGroup.GET("/articles", handlers.AdminArticlesAPI)
			adminGroup.DELETE("/articles/:id", handlers.AdminDeleteArticleAPI)
			adminGroup.GET("/comments", handlers.AdminCommentsAPI)
			adminGroup.DELETE("/comments/:id", handlers.AdminDeleteCommentAPI)
			adminGroup.GET("/user-activity", handlers.AdminUserActivityAPI)
		}
	}
}
