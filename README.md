# ✦ 宏大叙事 (Great Narrative)

这是一个现代化的全栈博客系统，旨在为创作者提供一个静谧、优雅且功能完备的写作与展示空间。项目采用了前后端分离的架构，前端追求极致的视觉体验，后端提供稳健的数据支持。

## 🌟 项目亮点

### 1. 极致的视觉设计 (Frontend)
- **现代暗黑风格**：深邃的配色方案，结合毛玻璃效果 (`Glassmorphism`)，营造出高端的视觉质感。
- **动感交互**：集成 `Framer Motion`，提供流畅的页面切换、卡片悬停及入场动画。
- **响应式布局**：完美适配桌面与移动端，无论在何种设备上都能保持一致的优雅体验。
- **自定义个人主页**：支持自定义头像、简介、社交链接以及可随时切换的“可爱”背景图。

### 2. 稳健的后端架构 (Backend)
- **高性能框架**：基于 `Go` 语言和 `Gin` 框架构建，响应迅速，并发处理能力强。
- **数据库持久化**：使用 `GORM` 作为 ORM，完美适配 `MySQL`，支持自动迁移表结构。
- **安全认证**：实现基于 Cookie 的会话管理及 Bcrypt 密码加密存储。
- **权限管理**：区分管理员 (`admin`) 与普通用户，管理员可全局管理内容。

---

## 🛠️ 技术栈

### 前端 (qianduan111)
- **框架**：[React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **样式**：[Tailwind CSS](https://tailwindcss.com/)
- **动画**：[Framer Motion](https://www.framer.com/motion/)
- **图标**：[Lucide React](https://lucide.dev/)

### 后端 (Go-server)
- **语言**：[Go (Golang)](https://golang.org/)
- **框架**：[Gin Web Framework](https://github.com/gin-gonic/gin)
- **数据库**：[MySQL](https://www.mysql.com/) + [GORM](https://gorm.io/)
- **配置**：[godotenv](https://github.com/joho/godotenv)

---

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/Zero-hhac/Great_Project.git
cd Great_Project
```

### 2. 后端配置与运行
1. 进入后端目录：`cd Go-server`
2. 本项目已适配 **TiDB Cloud (Serverless)** 云数据库。
3. 检查 `.env` 文件中的配置（已自动更新为您的云端参数）：
   ```env
   DB_USER=zcNKfhFvGSDmhGS.root
   DB_PASSWORD=UK0tmeIicQ9fkmby
   DB_NAME=sys
   DB_HOST=gateway01.eu-central-1.prod.aws.tidbcloud.com
   DB_PORT=4000
   PORT=:8080
   ```
4. 运行后端：
   ```bash
   go run main.go
   ```

### 3. 前端配置与运行
1. 打开新的终端，进入前端目录：`cd qianduan111`
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 访问 `http://localhost:3000` 开始您的叙事。

---

## 📂 项目结构

```text
.
├── qianduan111/          # React 前端源代码
│   ├── src/              # 组件、页面与逻辑
│   └── tailwind.config.ts # 样式配置
├── Go-server/            # Go 后端源代码
│   ├── handlers/         # API 接口逻辑
│   ├── models/           # 数据库模型定义
│   ├── middleware/       # 鉴权与 CORS 中间件
│   └── main.go           # 程序入口
└── README.md             # 项目说明文档
```

---

## 📄 许可证

本项目基于 MIT 协议开源。
