# ✦ 星野叙事 (Starry Wilderness Narrative)

这是一个极致追求视觉体验与阅读感的全栈博客系统。旨在为创作者提供一个静谧、优雅且功能完备的写作与展示空间。

项目采用了前后端分离的现代化架构，前端基于 **React + Vite**，追求极简与动效的平衡；后端基于 **Go (Golang) + Gin**，提供稳健且高效的 API 支持。

## 🌟 项目亮点

### 1. 极致的视觉设计 (Frontend)
- **现代暗黑毛玻璃风格**：全站采用深邃的配色方案，结合 `Glassmorphism` 效果与毛玻璃滤镜，营造高端视觉质感。
- **动感交互体验**：集成 `Framer Motion`，实现丝滑的页面切换、卡片悬停及流式入场动画。
- **卓越阅读体验**：针对中文排版进行了精细优化（18px 字体、1.9 行高、最大宽屏限制），有效降低阅读疲劳。
- **响应式全适配**：完美兼容桌面、平板与移动端，具备独立的 `MobileNav` 导航系统。
- **个性化空间**：支持自定义头像、动态背景图预设、个人简介及社交链接管理。

### 2. 深度功能集成 (Features)
- **多维内容组织**：支持基础的文章发布，并具备强大的 **合集 (Collections)** 与 **归档 (Archiving)** 逻辑。
- **全能管理后台**：内置管理员专属 Dashboard，集成 `Recharts` 实时数据看板（发文趋势、用户分布等）。
- **交互系统**：完整的点赞、评论互动机制，支持文章与评论的双向点赞。
- **智能导航**：具备全局阅读进度条、层级返回按钮以及平滑的路由跳转。

### 3. 稳健的技术底层 (Backend)
- **高性能框架**：基于 Go 语言和 Gin 框架构建，响应极速，并发处理能力卓越。
- **灵活数据库支持**：适配 **MySQL** 及 **PostgreSQL (Neon Cloud)**，支持 `DATABASE_URL` 与 SSL 安全连接。
- **安全认证机制**：实现基于 Cookie 的会话管理、Bcrypt 密码加密存储及中间件权限控制。
- **自动表迁移**：使用 `GORM` 实现数据库表结构的自动发现与迁移。

---

## 🛠️ 技术栈

### 前端 (qianduan111)
- **框架**：[React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **样式**：[Tailwind CSS v4](https://tailwindcss.com/)
- **动画**：[Framer Motion](https://www.framer.com/motion/)
- **图表**：[Recharts](https://recharts.org/)
- **图标**：[Lucide React](https://lucide.dev/)

### 后端 (Go-server)
- **语言**：[Go (Golang)](https://golang.org/)
- **框架**：[Gin Web Framework](https://github.com/gin-gonic/gin)
- **数据库**：[PostgreSQL](https://www.postgresql.org/) / [MySQL](https://www.mysql.com/) + [GORM](https://gorm.io/)
- **内容解析**：[gomarkdown](https://github.com/gomarkdown/markdown)

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/Zero-hhac/Great_Project.git
cd Great_Project
```

### 2. 后端配置与运行 (Go-server)
1. 进入后端目录：`cd Go-server`
2. 配置 `.env` 文件（支持 DSN 或 DATABASE_URL）：
   ```env
   # 云端 PostgreSQL 示例
   DATABASE_URL=postgres://user:pass@host:port/dbname?sslmode=require
   # 或本地 MySQL 配置
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=blog_db
   PORT=:8080
   ```
3. 运行后端：
   ```bash
   go run main.go
   ```

### 3. 前端配置与运行 (qianduan111)
1. 进入前端目录：`cd qianduan111`
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`
4. 访问 `http://localhost:3000` 即可开始您的叙事。

---

## 📂 项目结构

```text
.
├── qianduan111/          # React 前端
│   ├── src/              # 核心业务逻辑与 UI 组件
│   └── vite.config.ts    # 代理与构建配置
├── Go-server/            # Go 后端
│   ├── handlers/         # API 控制层 (文章、合集、管理、用户)
│   ├── models/           # 数据模型 (GORM 定义)
│   ├── middleware/       # 鉴权与 CORS 拦截器
│   └── main.go           # 路由分发与启动入口
└── README.md             # 项目核心说明文档
```

---

## 📄 许可证

本项目基于 MIT 协议开源。
