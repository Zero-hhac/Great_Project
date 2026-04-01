package main

import (
	"html/template"

	"starry-server/config"
	"starry-server/models"
	"starry-server/middleware"
	"starry-server/routes"

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

	// 注册路由
	routes.RegisterPublicRoutes(r)
	routes.RegisterAuthRoutes(r)

	// 启动服务器
	println("Server is running at: http://localhost" + config.ServerPort)
	r.Run(config.ServerPort)
}
