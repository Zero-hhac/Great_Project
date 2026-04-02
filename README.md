# Fade Under

> "在光影交织的边界，记录每一个值得被铭记的瞬间。"

**Fade Under** 是一个融合极简美学与现代全栈技术的个人博客系统，致力于为创作者提供沉浸式的深度阅读体验。旨在探索极简设计和卓越性能的完美结合。

## ✨ 核心特性

### 🖋 沉浸式内容创作
- **Markdown 原生支持** - 提供流畅、沉浸式的写作与阅读体验
- **合集归档系统** - 让主题连贯，叙事具有逻辑，不再碎片化
- **阅读进度感知** - 提供全局的阅读进度条，提升阅读体验

### 🤝 互动社交
- **动态点赞系统** - 支持对文章和评论进行点赞互动
- **个性化空间** - 用户个人主页，并支持主题无缝切换

### 🛡 完善的审核与权限机制
- **三态审核流程** - 待审核 / 已通过 / 已驳回，为内容质量保驾护航
- **发言权管理** - 精细化的用户权限与禁言功能
- **实时通知弹窗** - 关键消息及时触达，不再错过重要信息

### 📊 专业的数据管理后台
- **数据可视化看板** - 一目了然的站点数据与流量分析
- **全要素管理** - 用户、文章、评论集中统一管理
- **操作日志记录** - 详细记录每一次审核操作，追溯有迹可循

## 🛠 技术架构

**前后端分离架构，兼顾性能与开发效率：**

| 层级 | 技术选型 | 说明 |
|------|------|------|
| **前端 (Frontend)** | React 18 + Vite + Tailwind CSS | 采用 Framer Motion 实现丝滑流体动画，追求极致用户体验 |
| **后端 (Backend)** | Go + Gin + GORM | 高性能并行的后端架构，提供快速响应的 RESTful API |
| **数据库 (Database)** | PostgreSQL / MySQL | 支持主流关系型数据库，保障数据稳定与一致 |

## 📁 目录结构

项目分为前端客户端与后端服务端两大模块：

```text
e:\my_project/
├── starry-web/          # 前端客户端 (React & Vite)
│   ├── src/
│   │   ├── components/  # 抽象可复用组件 (Common, Layouts)
│   │   ├── pages/       # 业务逻辑页面 (Home, Auth, Admin...)
│   │   ├── utils/       # 辅助工具函数与 API 封装
│   │   ├── constants/   # 全局常量配置
│   │   └── types/       # TypeScript 类型定义
│   └── package.json
│
└── Go-server/           # 后端服务端 (Go & Gin)
    ├── handlers/        # 控制器层 Request 处理与响应
    ├── models/          # 数据库交互与实体定义
    ├── middleware/      # 中间件 (跨域、鉴权等)
    ├── routes/          # 路由配置注册
    ├── utils/           # 服务端工具类 (Cookies, Response)
    └── main.go          # 服务入口点
```

## 🚀 快速启动

### 准备工作
- 安装 [Node.js](https://nodejs.org/) (推荐 v18+)
- 安装 [Go](https://golang.org/) (推荐 v1.21+)
- 本地或远程启动 MySQL 数据库

### 1. 服务端配置与启动 (Go-server)
```bash
cd Go-server
# 根据需要配置 .env 文件
go run main.go
```

### 2. 客户端配置与启动 (starry-web)
```bash
cd starry-web
# 安装依赖
npm install 
# 启动开发服务器
npm run dev
```

## 📦 部署指南 (Production)

项目支持通过标准环境进行构建与部署。

```bash
# ============ 1. 拉取代码 ============
cd /var/www/Great_Project
git pull origin main

# ============ 2. 生产环境构建前端 ============
cd starry-web
npm install
npm run build 

# ============ 3. 生产环境构建与启动后端 ============
cd ../Go-server
go build -o server main.go
pkill server && nohup ./server & 
```

## 📄 许可证

本项目基于 MIT License 开源，允许自由地学习、修改和分发。欢迎使用与交流！
