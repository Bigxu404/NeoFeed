# NeoFeed - 你的个人信息中枢

**Web First 架构 | MVP 版本 v0.2**

## 📖 项目简介

NeoFeed 是一个个人信息管理系统，帮助你：
- 📝 快速保存文本、想法、链接
- 🌐 自动抓取网页内容
- 🤖 AI 自动摘要、分类、提取关键词
- 📊 统一管理你的信息流

## 🏗️ 技术架构

```
NeoFeed/
├── core/              # 核心模块（可复用）
│   ├── config.py      # 配置管理
│   ├── database.py    # 数据库操作
│   ├── fetcher.py     # 网页抓取
│   └── processor.py   # AI 处理
├── api/               # FastAPI 后端
│   └── main.py        # API 服务
├── web/               # Next.js 前端
│   ├── app/           # 页面
│   └── components/    # 组件
└── database/          # 数据库
    ├── schema.sql     # 表结构
    └── init_db.py     # 初始化脚本
```

## 🚀 快速开始

### 1. 环境要求

- Python 3.9+
- Node.js 18+
- npm/yarn

### 2. 数据库初始化

```bash
cd database
python init_db.py
```

### 3. 启动后端 API

```bash
# 安装 Python 依赖
pip install -r requirements.txt

# 配置环境变量（可选）
cp .env.example .env

# 启动 FastAPI 服务
cd api
python main.py
```

后端运行在 `http://localhost:8000`

### 4. 启动前端

```bash
cd web
npm install
npm run dev
```

前端运行在 `http://localhost:3000`。

**局域网访问（手机/其他电脑同 WiFi）：**

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

### API 端点

```
GET  /                    # 欢迎页
GET  /health              # 健康检查
POST /api/items           # 保存信息
GET  /api/items           # 获取列表
GET  /api/items/{id}      # 获取详情
GET  /api/stats           # 统计数据
POST /api/items/{id}/process  # AI 处理
```

### 数据库

使用 SQLite，位于 `database/neofeed.db`

核心表：
- `users` - 用户
- `items` - 信息条目
- `ai_results` - AI 处理结果
- `tags` - 标签
- `weekly_reports` - 周报

详见 `database/schema.sql`

### 配置说明

**后端配置** (`.env`)：
- `OPENAI_API_KEY` - OpenAI API 密钥（可选）
- `ENABLE_AI_PROCESSING` - 是否启用 AI 处理
- `ENABLE_WEB_SCRAPING` - 是否启用网页抓取

**前端配置** (`web/.env.local`)：
- `NEXT_PUBLIC_API_URL` - 后端 API 地址

## 📦 技术栈

### 后端
- **框架**: FastAPI
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **AI**: OpenAI GPT-4o-mini
- **抓取**: Jina Reader API

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态**: React Hooks

## 🧪 测试

```bash
# 测试后端 API
curl http://localhost:8000/health

# 测试保存文本
curl -X POST http://localhost:8000/api/items \
  -H "Content-Type: application/json" \
  -d '{"content": "这是一条测试信息", "enable_ai": false}'
```

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
