# NeoFeed 数据库文档

## 📁 文件说明

| 文件 | 用途 | 说明 |
|------|------|------|
| `schema.sql` | SQLite 表结构定义 | 完整的数据库 schema（本地开发版） |
| `init_db.py` | 数据库初始化脚本 | 创建数据库和表结构 |
| `test_data.py` | 测试数据生成脚本 | 插入示例数据用于测试 |
| `test_queries.py` | 查询测试脚本 | 验证 CRUD 和常用查询 |
| `migrate_to_postgres.py` | 迁移工具 | SQLite → PostgreSQL 数据迁移 |

---

## 🚀 快速开始

### 1. 初始化数据库

```bash
cd database
python init_db.py
```

这会创建 `neofeed.db` 文件并建立所有表结构。

### 2. 插入测试数据

```bash
python test_data.py
```

会自动创建：
- 1 个测试用户
- 5 条信息条目
- 5 条 AI 处理结果
- 6 个标签
- 1 份周报
- 若干处理日志

### 3. 测试查询

```bash
python test_queries.py
```

会运行各种查询测试，包括：
- 基础查询
- CRUD 操作
- 高级查询
- 统计分析

---

## 📊 数据库结构

### 核心表

```
users (用户)
  ↓ 1:N
items (原始信息)
  ↓ 1:1
ai_results (AI处理结果)

items ←→ tags (多对多，通过 item_tags)

weekly_reports (周报)
  ↓ 1:N
report_items ←→ items
```

### 表详情

#### 1. `users` - 用户表
存储用户基本信息和偏好设置。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| email | TEXT | 邮箱（唯一） |
| telegram_id | TEXT | Telegram ID（唯一） |
| preferences | TEXT | JSON 格式的偏好设置 |

#### 2. `items` - 信息条目表
存储原始收集的信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 所属用户 |
| title | TEXT | 标题 |
| content | TEXT | 正文内容 |
| url | TEXT | 原始链接 |
| source_type | TEXT | 来源类型 |
| status | TEXT | 处理状态 |

#### 3. `ai_results` - AI 处理结果表
存储 AI 分析后的结果。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| item_id | INTEGER | 关联的原始信息 |
| summary | TEXT | AI 生成的摘要 |
| category | TEXT | 主分类 |
| keywords | TEXT | 关键词（逗号分隔） |
| importance_score | REAL | 重要性评分 (0-1) |

#### 4. `weekly_reports` - 周报表
存储生成的周报。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 所属用户 |
| week_start | DATE | 周起始日期 |
| week_end | DATE | 周结束日期 |
| content | TEXT | Markdown 格式的报告 |
| stats | TEXT | JSON 统计数据 |

---

## 🔄 数据迁移到 PostgreSQL/Supabase

当本地验证完成后，可以迁移到生产环境：

### 方案 1：使用迁移脚本（自动）

```bash
python migrate_to_postgres.py
```

按提示输入 PostgreSQL 连接信息，脚本会自动：
1. 创建表结构
2. 迁移所有数据
3. 转换数据类型（INTEGER → UUID，逗号分隔 → 数组等）

### 方案 2：手动迁移

1. 导出 PostgreSQL Schema：
```bash
python migrate_to_postgres.py
# 选择选项 1
```

2. 在 Supabase SQL Editor 中运行生成的 `postgres_schema.sql`

3. 使用 `pg_dump` 和 `psql` 迁移数据（适合大量数据）

---

## 💡 开发建议

### 本地开发流程

1. **初始阶段**：使用 SQLite
   - 快速验证功能
   - 不需要网络
   - 数据可视化工具：[DB Browser for SQLite](https://sqlitebrowser.org/)

2. **功能完善后**：迁移到 PostgreSQL
   - 支持向量搜索
   - 更强大的查询能力
   - 真正的数组和 JSON 类型

### 常用 SQL 命令

```bash
# 查看所有表
sqlite3 neofeed.db ".tables"

# 查看表结构
sqlite3 neofeed.db ".schema items"

# 导出数据
sqlite3 neofeed.db ".dump" > backup.sql

# 查询数据
sqlite3 neofeed.db "SELECT * FROM items LIMIT 5"
```

---

## 🛠️ 数据库管理工具

### SQLite
- **DB Browser for SQLite** - 图形化界面
- **VS Code Extension**: SQLite Viewer

### PostgreSQL/Supabase
- **Supabase Dashboard** - Web 界面
- **pgAdmin** - 功能强大的管理工具
- **VS Code Extension**: PostgreSQL

---

## 📈 性能优化

### 已配置的索引

```sql
-- 用户查询优化
CREATE INDEX idx_items_user ON items(user_id);
CREATE INDEX idx_items_created ON items(created_at DESC);

-- 分类查询优化
CREATE INDEX idx_ai_results_category ON ai_results(category);

-- 时间范围查询优化
CREATE INDEX idx_weekly_reports_dates ON weekly_reports(week_start, week_end);
```

### 查询优化建议

1. 使用 `EXPLAIN QUERY PLAN` 分析慢查询
2. 为常用的 WHERE 条件字段添加索引
3. 避免在大文本字段上使用 LIKE
4. 使用视图简化复杂查询

---

## 🔒 安全注意事项

1. **不要在代码中硬编码数据库密码**
   - 使用环境变量：`os.environ.get('DB_PASSWORD')`

2. **开启外键约束**
   - SQLite: `PRAGMA foreign_keys = ON;`
   - PostgreSQL: 默认开启

3. **防止 SQL 注入**
   - 始终使用参数化查询
   - ❌ `f"SELECT * FROM items WHERE id = {user_input}"`
   - ✅ `cursor.execute("SELECT * FROM items WHERE id = ?", (user_input,))`

4. **定期备份**
   ```bash
   # SQLite
   cp neofeed.db neofeed_backup_$(date +%Y%m%d).db
   
   # PostgreSQL
   pg_dump -U postgres neofeed > backup.sql
   ```

---

## 📚 学习资源

### SQLite
- [SQLite 官方文档](https://www.sqlite.org/docs.html)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)

### PostgreSQL
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Supabase 文档](https://supabase.com/docs)
- [pgvector 文档](https://github.com/pgvector/pgvector)

### SQL 通用
- [SQL 教程 (菜鸟教程)](https://www.runoob.com/sql/sql-tutorial.html)
- [SQL Zoo](https://sqlzoo.net/) - 交互式练习

---

## 🐛 常见问题

### Q: 数据库被锁定怎么办？
A: SQLite 不支持多个同时写入。确保：
- 及时关闭连接：`conn.close()`
- 不要在不同进程同时写入
- 使用 `PRAGMA busy_timeout = 5000;`

### Q: 如何查看数据库大小？
A: 
```python
import os
size = os.path.getsize('neofeed.db') / 1024 / 1024  # MB
print(f"数据库大小: {size:.2f} MB")
```

### Q: 迁移后 ID 不匹配怎么办？
A: 迁移脚本会自动维护 ID 映射。如果出问题：
1. 检查外键约束是否正确
2. 使用 UUID 而不是依赖自增 ID
3. 通过其他唯一字段（如 email）关联

---

## 📞 获取帮助

如果遇到问题：
1. 查看 [GitHub Issues](https://github.com/your-repo/neofeed/issues)
2. 查看日志输出的错误信息
3. 使用 `EXPLAIN` 分析 SQL 语句

---

*最后更新: 2025-11-10*

