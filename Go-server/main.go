package main

import (
	"html/template"

	"starry-server/config"
	"starry-server/handlers"
	"starry-server/middleware"
	"starry-server/models"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库
	models.InitDB()

	// 创建 Gin 引擎
	r := gin.Default()

	// CORS 中间件
	r.Use(middleware.CORSMiddleware())

	// 加载所有模板文件
	tmpl := template.Must(template.ParseGlob("templates/*.html"))
	tmpl = template.Must(tmpl.ParseGlob("templates/articles/*.html"))
	r.SetHTMLTemplate(tmpl)

	// 静态文件
	r.Static("/static", "./static")

	// 公开路由（无需登录）
	r.GET("/login", handlers.ShowLogin)
	r.POST("/login", handlers.Login)
	r.POST("/api/login", handlers.LoginAPI)
	r.GET("/register", handlers.ShowRegister)
	r.POST("/register", handlers.Register)
	r.POST("/api/register", handlers.RegisterAPI)

	// 需要登录的路由（包括首页）
	auth := r.Group("/")
	auth.Use(middleware.AuthRequired())
	{
		auth.GET("/", handlers.Home)
		auth.GET("/api/home", handlers.HomeAPI)
		auth.POST("/api/photos/update", handlers.UpdatePhotosAPI)
		auth.GET("/api/profile", handlers.ShowProfile) // Global profile
		auth.POST("/api/profile", handlers.UpdateProfileAPI)

		auth.GET("/api/user/profile", handlers.GetUserProfileAPI)
		auth.POST("/api/user/profile", handlers.UpdateUserProfileAPI)
		auth.POST("/logout", handlers.Logout)
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
		}

		// 评论相关
		auth.POST("/comments/create", handlers.CreateComment)
		auth.POST("/api/comments/create", handlers.CreateCommentAPI)
		auth.POST("/comments/delete/:id", handlers.DeleteComment)
		auth.POST("/api/comments/:id/like", handlers.ToggleCommentLikeAPI)

		auth.GET("/profile", handlers.ShowProfile)
		auth.POST("/profile", handlers.UpdateProfile)
		auth.POST("/photos/update", handlers.UpdatePhotos)
	}

	// 启动服务器
	println("Server is running at: http://localhost" + config.ServerPort)
	r.Run(config.ServerPort)
}
