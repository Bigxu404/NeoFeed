-- ============================================
-- NeoFeed 数据库 Schema (SQLite 版本)
-- 用于本地开发和验证
-- ============================================

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    telegram_id TEXT UNIQUE,
    telegram_username TEXT,
    
    -- 偏好设置（JSON格式）
    preferences TEXT DEFAULT '{"language": "zh-CN", "report_day": "sunday", "report_time": "09:00"}',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化
CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. 原始信息表 (items)
-- ============================================
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    -- 内容信息
    title TEXT,                    -- 标题（可为空）
    content TEXT NOT NULL,         -- 原文内容（必填）
    url TEXT,                      -- 原始链接（可为空）
    
    -- 来源信息
    source_type TEXT NOT NULL CHECK(source_type IN ('telegram', 'wechat', 'web', 'gpt', 'manual')),
    source_metadata TEXT,          -- JSON格式：{"公众号": "xxx", "作者": "xxx"}
    
    -- 元数据
    word_count INTEGER,            -- 字数统计
    language TEXT DEFAULT 'zh',    -- 语言标识
    
    -- 状态管理
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processed', 'failed')),
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引优化
CREATE INDEX idx_items_user ON items(user_id);
CREATE INDEX idx_items_created ON items(created_at DESC);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_source_type ON items(source_type);

-- ============================================
-- 3. AI 处理结果表 (ai_results)
-- ============================================
CREATE TABLE ai_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL UNIQUE,  -- 一对一关系
    user_id INTEGER NOT NULL,          -- 冗余字段，便于查询
    
    -- AI 生成内容
    summary TEXT,                      -- 摘要（100-300字）
    
    -- 分类信息（逗号分隔）
    category TEXT,                     -- 主分类："AI趋势"
    sub_category TEXT,                 -- 次分类："产品应用"
    topics TEXT,                       -- 相关主题，逗号分隔："产品,设计,增长"
    keywords TEXT,                     -- 关键词，逗号分隔："AI,GPT,自动化"
    
    -- 评分
    importance_score REAL DEFAULT 0.0 CHECK(importance_score >= 0 AND importance_score <= 1),
    sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative', NULL)),
    
    -- AI 元信息
    model_used TEXT DEFAULT 'gpt-4o-mini',
    processing_time_ms INTEGER,        -- 处理耗时（毫秒）
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- 外键约束
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引优化
CREATE INDEX idx_ai_results_item ON ai_results(item_id);
CREATE INDEX idx_ai_results_user ON ai_results(user_id);
CREATE INDEX idx_ai_results_category ON ai_results(category);
CREATE INDEX idx_ai_results_importance ON ai_results(importance_score DESC);

-- ============================================
-- 4. 标签表 (tags)
-- ============================================
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT,                     -- 'topic', 'project', 'source'
    color TEXT DEFAULT '#3b82f6',      -- 颜色（hex）
    description TEXT,                  -- 标签描述
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_tags_category ON tags(category);

-- ============================================
-- 5. 条目-标签关联表 (item_tags)
-- ============================================
CREATE TABLE item_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_item_tags_item ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag ON item_tags(tag_id);

-- ============================================
-- 6. 周报表 (weekly_reports)
-- ============================================
CREATE TABLE weekly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    
    -- 时间范围
    week_start DATE NOT NULL,          -- 2025-11-01
    week_end DATE NOT NULL,            -- 2025-11-07
    week_range TEXT,                   -- "2025.11.01–2025.11.07" (展示用)
    
    -- 报告内容
    title TEXT,                        -- "第45周知识周报"
    content TEXT,                      -- Markdown 格式的完整报告
    summary TEXT,                      -- 本周总结
    
    -- 统计数据（JSON格式）
    stats TEXT,                        -- {"total": 42, "by_category": {...}}
    
    -- 聚类结果（JSON格式）
    clusters TEXT,                     -- [{"theme": "AI趋势", "items": [...]}, ...]
    
    -- 洞察（JSON格式）
    insights TEXT,                     -- [{"title": "...", "content": "..."}, ...]
    
    -- 关键词统计（JSON格式）
    keywords_summary TEXT,             -- {"AI": 24, "产品": 18, ...}
    
    -- 包含的条目数量
    item_count INTEGER DEFAULT 0,
    
    -- 状态
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'sent')),
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    sent_at DATETIME,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引优化
CREATE INDEX idx_weekly_reports_user ON weekly_reports(user_id);
CREATE INDEX idx_weekly_reports_dates ON weekly_reports(week_start, week_end);
CREATE INDEX idx_weekly_reports_status ON weekly_reports(status);

-- ============================================
-- 7. 周报-条目关联表 (report_items)
-- ============================================
CREATE TABLE report_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    cluster_name TEXT,                 -- 该条目属于哪个聚类主题
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(report_id, item_id),
    FOREIGN KEY (report_id) REFERENCES weekly_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX idx_report_items_report ON report_items(report_id);
CREATE INDEX idx_report_items_item ON report_items(item_id);

-- ============================================
-- 8. 处理日志表 (processing_logs)
-- ============================================
CREATE TABLE processing_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    task_type TEXT NOT NULL,           -- 'summarize', 'classify', 'extract_keywords'
    status TEXT NOT NULL CHECK(status IN ('success', 'failed')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX idx_processing_logs_item ON processing_logs(item_id);
CREATE INDEX idx_processing_logs_status ON processing_logs(status);
CREATE INDEX idx_processing_logs_created ON processing_logs(created_at DESC);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================

-- users 表
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- items 表
CREATE TRIGGER update_items_timestamp 
AFTER UPDATE ON items
BEGIN
    UPDATE items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ai_results 表
CREATE TRIGGER update_ai_results_timestamp 
AFTER UPDATE ON ai_results
BEGIN
    UPDATE ai_results SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- 视图：便捷查询
-- ============================================

-- 完整的条目视图（包含 AI 结果）
CREATE VIEW v_items_full AS
SELECT 
    i.id,
    i.user_id,
    i.title,
    i.content,
    i.url,
    i.source_type,
    i.source_metadata,
    i.word_count,
    i.status,
    i.created_at,
    a.summary,
    a.category,
    a.sub_category,
    a.topics,
    a.keywords,
    a.importance_score,
    a.sentiment
FROM items i
LEFT JOIN ai_results a ON a.item_id = i.id;

-- 周报统计视图
CREATE VIEW v_weekly_reports_stats AS
SELECT 
    wr.id,
    wr.user_id,
    wr.week_range,
    wr.title,
    wr.status,
    wr.item_count,
    wr.created_at,
    COUNT(ri.item_id) as actual_item_count
FROM weekly_reports wr
LEFT JOIN report_items ri ON ri.report_id = wr.id
GROUP BY wr.id;

