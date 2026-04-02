# Fade Under

> "在光影交织的边界，记录每一个值得被铭记的瞬间。"

**Fade Under** 是一个融合极简美学与现代全栈技术的个人博客系统，致力于为创作者提供沉浸式的深度阅读体验。

---

## 功能特性

### 内容创作
- Markdown 原生支持，沉浸式阅读体验
- 合集归档系统，组织主题叙事
- 全局阅读进度感知

### 互动社交
- 文章与评论点赞系统
- 个人空间定制与主题切换

### 审核机制
- 文章发布审核流程（待审核/已通过/已驳回）
- 用户发言权权限管理
- 管理员通知弹窗系统

### 管理后台
- 数据可视化看板
- 用户、文章、评论管理
- 审核操作日志记录

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + Tailwind CSS + Framer Motion |
| 后端 | Go + Gin + GORM |
| 数据库 | PostgreSQL / MySQL |

---

## 项目结构

```
├── starry-web/          # 前端 (React)
│   └── src/
│       ├── pages/       # 页面组件
│       ├── components/  # 通用组件
│       ├── types/       # 类型定义
│       └── utils/       # 工具函数
│
└── Go-server/           # 后端 (Go)
    ├── handlers/        # 请求处理
    ├── models/          # 数据模型
    ├── middleware/       # 中间件
    └── routes/          # 路由配置
```

---

## 本地开发

### 后端
```bash
cd Go-server
# 配置 .env 文件
go run main.go
```

### 前端
```bash
cd starry-web
npm install
npm run dev
```

---

## 服务器部署

```bash
# 拉取最新代码
cd /var/www/Great_Project
git pull origin main

# 构建前端
cd starry-web && npm run build

# 构建并重启后端
cd ../Go-server
go build -o server main.go
pkill server && nohup ./server &
```

---

## 许可证

MIT License
