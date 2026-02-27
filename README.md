# NeoFeed - 你的个人信息中枢

**Web First 架构 | MVP 版本 v0.2**

## 📖 项目简介

NeoFeed 是一个个人信息管理系统，帮助你：
- 📝 快速保存文本、想法、链接
- 🌐 自动抓取网页内容
- 🤖 AI 自动摘要、分类、提取关键词
- 📊 统一管理你的信息流

## 🏗️ 技术架构

当前以 **Web 为主**：主应用在 `web/`（Next.js + Supabase + Inngest），旧 Python 后端与旧前端已迁至 `legacy_engine/`。

```
NeoFeed/
├── web/               # 主应用（Next.js 16, App Router）
│   ├── app/           # 页面与 API 路由
│   ├── components/    # UI 组件
│   ├── lib/           # Supabase、AI、工具函数
│   ├── inngest/       # 定时与异步任务
│   └── supabase/      # 迁移与类型
├── legacy_engine/     # 遗留（可选）
│   ├── core/          # Python 核心模块
│   ├── api/           # FastAPI 服务
│   ├── database/      # 旧数据库脚本
│   └── Figma1/        # 旧 Vite 前端
├── docs/              # 项目文档
└── .agent-skills/     # Cursor 技能（独立仓库）
```

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+
- npm / yarn / pnpm

### 2. 环境变量

```bash
cp .env.example .env
# 编辑 .env，配置 Supabase（NEXT_PUBLIC_SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY 等）
```

### 3. 启动前端（主应用）

```bash
cd web
npm install
npm run dev
```

应用运行在 `http://localhost:3000`。数据库与认证由 Supabase 提供，无需单独启动 Python 后端。

### 4. 局域网访问（手机/其他电脑同 WiFi）

```bash
cd web
npm run dev:lan:safe   # 推荐：自动提高「打开文件数」再启动，避免 404/白屏
# 或
npm run dev:lan        # 若你已在当前终端执行过 ulimit -n 10240
```

- 本机：<http://localhost:3000>
- 局域网：<http://你的本机IP:3000>（如 `ifconfig | grep "inet "` 查看）

若出现 404 或白屏，多半是 Mac 默认「打开文件数」不够，用 `dev:lan:safe` 即可。想一劳永逸可在 `~/.zshrc` 末尾加一行：`ulimit -n 10240`，然后新开终端用 `npm run dev:lan`。

### 5. 访问应用

打开浏览器访问 `http://localhost:3000`，开始使用！

## 🎯 核心功能

### MVP 版本（当前）

- ✅ Web 界面保存文本/链接
- ✅ URL 自动抓取内容
- ✅ 信息列表查看
- ✅ 统计面板
- ✅ AI 摘要、分类、关键词（可选）

### 未来规划

- 🔜 浏览器扩展（快速保存）
- 🔜 标签系统
- 🔜 搜索功能
- 🔜 周报生成
- 🔜 多设备同步

## 🛠️ 开发指南

### 主应用 API（Next.js 路由）

主要接口在 `web/app/api/`，例如：
- `GET/POST /api/feed/[id]` - 单条 Feed
- `POST /api/ingest-url` - 抓取并入库 URL
- `POST /api/process-feed` - 触发 AI 处理
- `GET /api/galaxy` - 星系数据
- `GET/POST /api/settings/rss` - RSS 订阅
- Cron：`/api/cron/fetch-rss`、`/api/cron/extract-keywords`
- Inngest：`/api/inngest`（后台任务）

### 数据库

使用 **Supabase (PostgreSQL)**。表结构见 `web/supabase/migrations/` 与 `web/types/database.ts`。

核心表：`profiles`、`feeds`、`feed_notes` 等。

### 配置说明

根目录 `.env` / `web/.env.local` 常用变量：
- `NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` - Supabase
- `OPENAI_API_KEY` 或各 AI 提供商 - 摘要/分类
- `INNGEST_EVENT_KEY`、`INNGEST_SIGNING_KEY` - 定时与异步任务

详见 `.env.example`。

## 📦 技术栈

- **前端**: Next.js 16 (App Router)、React 19、TypeScript、Tailwind CSS
- **后端/数据**: Supabase（PostgreSQL、Auth）
- **任务**: Inngest（定时抓取、周报等）
- **AI**: OpenAI / 多提供商（见设置）

## 📝 更新日志

### v0.2.0 (2025-11-10)
- 🎉 重构为 Web First 架构
- ✨ 新增 Next.js 前端
- ✨ FastAPI 后端 API
- ✨ 现代化 UI 设计
- 🗑️ 移除 Telegram Bot

### v0.1.0 (2025-11-09)
- 初始版本
- 数据库设计
- Telegram Bot（已废弃）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

---

**Built with ❤️ by NeoFeed Team**
