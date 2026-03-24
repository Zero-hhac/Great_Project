# ✦ 星野叙事 (Starry Wilderness Narrative)

> “在浩瀚的星野中，记录每一个值得被铭记的瞬间。”

**星野叙事** 是一个融合了极简美学与现代全栈技术的个人博客系统。它不仅是一个内容发布平台，更是一个追求极致阅读体验与视觉艺术的数字避风港。项目旨在为创作者提供一个静谧、优雅的空间，让文字在毛玻璃的质感与流动的动效中熠熠生辉。

---

## ✨ 核心愿景 (The Vision)

在信息碎片化的时代，**星野叙事** 致力于重塑“深度阅读”的仪式感。通过考究的排版、深邃的暗色调设计以及非线性的内容组织（合集逻辑），我们让每一次点击都成为一场探索星空的叙事之旅。

---

## 🚀 功能特性 (Core Features)

### 1. 极致的内容创作与展示
- **沉浸式阅读**：针对中文阅读深度优化，包括 18px 黄金字号、1.9 舒适行高以及限制最大行宽，辅以半透明深色背景，有效过滤视觉干扰。
- **多维归档系统**：支持**合集 (Collections)** 功能。创作者可以将零散的文章归纳为系统性的叙事主题，支持在已有文章中随时进行归档操作。
- **Markdown 支持**：原生支持 Markdown 语法，让创作回归纯粹。
- **全局进度感知**：顶部实时阅读进度条，时刻掌握叙事进度。

### 2. 交互与社交机制
- **双向互动**：完整的点赞（文章与评论）与评论系统，支持多层级实时刷新。
- **个人空间定制**：用户可自定义个人资料、社交链接，并支持从预设的“可爱/星空”主题背景中一键切换空间氛围。
- **智能导航**：集成全局层级返回逻辑，无论身处星野何处，皆可优雅归航。

### 3. 专业级管理看板 (Admin Dashboard)
- **数据可视化**：集成 `Recharts` 统计图表，实时监测注册用户增长、发文趋势及互动数据。
- **全方位治理**：管理员可全局管理（查看/删除）所有用户、文章及评论，维护星野秩序。

---

## 🛠️ 技术深度 (Tech Stack)

### 前端：艺术与性能的结合 (starry-web)
- **核心框架**：[React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)（极致的构建速度）
- **样式引擎**：[Tailwind CSS v4](https://tailwindcss.com/)（原子化 CSS，构建复杂的毛玻璃视觉系统）
- **动效灵魂**：[Framer Motion](https://www.framer.com/motion/)（实现流畅的布局转换与物理动效）
- **数据看板**：[Recharts](https://recharts.org/)（声明式图表库）
- **图标系统**：[Lucide React](https://lucide.dev/)（一致的线性视觉语言）

### 后端：稳健与高效的基石 (Go-server)
- **开发语言**：[Go (Golang)](https://golang.org/)
- **Web 框架**：[Gin](https://github.com/gin-gonic/gin)（高性能 HTTP 路由）
- **持久化层**：[GORM](https://gorm.io/)（强大的 ORM，支持多数据库适配）
- **安全认证**：基于 **Bcrypt** 加密算法与 **Session/Cookie** 的鉴权中间件。
- **内容解析**：[gomarkdown](https://github.com/gomarkdown/markdown)（快速且合规的 Markdown 渲染）

### 基础设施
- **数据库**：完美适配 **PostgreSQL (Neon Cloud)** 与 **MySQL**，支持 SSL 安全连接。
- **环境管理**：通过 `godotenv` 实现灵活的多环境配置切换。

---

## 📂 项目结构说明 (Architecture)

```text
.
├── starry-web/           # 前端艺术空间 (React)
│   ├── src/
│   │   ├── App.tsx       # 核心路由与状态中枢
│   │   ├── index.css     # 全局排版优化与主题变量
│   │   └── main.tsx      # 入口渲染
│   └── vite.config.ts    # 代理与构建优化
├── Go-server/            # 后端动力引擎 (Go)
│   ├── handlers/         # 业务逻辑层 (文章、合集、管理、互动)
│   ├── models/           # 领域模型与数据库映射
│   ├── middleware/       # 鉴权与安全拦截
│   ├── config/           # 环境配置管理
│   └── main.go           # 服务启动入口
└── README.md             # 叙事指南
```

---

## 🏁 快速启航 (Getting Started)

### 1. 获取源代码
```bash
git clone https://github.com/Zero-hhac/Great_Project.git
cd Great_Project
```

### 2. 唤醒后端服务
1. 进入目录：`cd Go-server`
2. 配置环境变量 `.env`：
   ```env
   # PostgreSQL 示例
   DATABASE_URL=postgres://user:pass@host:port/dbname?sslmode=require
   # 或本地 MySQL 配置
   DB_USER=root
   DB_PASSWORD=your_password
   PORT=:8080
   ```
3. 启动引擎：`go run main.go`

### 3. 点亮前端界面
1. 进入目录：`cd starry-web`
2. 注入依赖：`npm install`
3. 开启星野：`npm run dev`
4. 访问：`http://localhost:3000`

---

## 📄 许可证

本项目遵循 MIT 协议开源。欢迎每一位热爱叙事与技术的创作者共同完善。
