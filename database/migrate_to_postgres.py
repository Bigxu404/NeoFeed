#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SQLite to PostgreSQL 迁移脚本
用于将本地 SQLite 数据库迁移到 Supabase/PostgreSQL
"""

import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import json
from datetime import datetime


# PostgreSQL Schema（与 SQLite 对应但使用 PG 特性）
POSTGRES_SCHEMA = """
-- ============================================
-- NeoFeed 数据库 Schema (PostgreSQL/Supabase 版本)
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用 pgvector 扩展（用于向量搜索）
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    telegram_id VARCHAR(100) UNIQUE,
    telegram_username VARCHAR(100),
    
    preferences JSONB DEFAULT '{"language": "zh-CN", "report_day": "sunday", "report_time": "09:00"}'::jsonb,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- 2. 原始信息表
-- ============================================
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title TEXT,
    content TEXT NOT NULL,
    url TEXT,
    
    source_type VARCHAR(50) NOT NULL CHECK(source_type IN ('telegram', 'wechat', 'web', 'gpt', 'manual')),
    source_metadata JSONB,
    
    word_count INTEGER,
    language VARCHAR(10) DEFAULT 'zh',
    
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'processed', 'failed')),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_items_user ON items(user_id);
CREATE INDEX idx_items_created ON items(created_at DESC);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_source_type ON items(source_type);

-- 全文搜索索引
CREATE INDEX idx_items_content_search ON items USING GIN(to_tsvector('simple', content));

-- ============================================
-- 3. AI 处理结果表
-- ============================================
CREATE TABLE ai_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    summary TEXT,
    
    category VARCHAR(100),
    sub_category VARCHAR(100),
    topics TEXT[],  -- PostgreSQL 原生数组
    keywords TEXT[],  -- PostgreSQL 原生数组
    
    importance_score FLOAT CHECK(importance_score >= 0 AND importance_score <= 1),
    sentiment VARCHAR(20) CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    
    model_used VARCHAR(50) DEFAULT 'gpt-4o-mini',
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_results_item ON ai_results(item_id);
CREATE INDEX idx_ai_results_user ON ai_results(user_id);
CREATE INDEX idx_ai_results_category ON ai_results(category);
CREATE INDEX idx_ai_results_keywords ON ai_results USING GIN(keywords);
CREATE INDEX idx_ai_results_topics ON ai_results USING GIN(topics);

-- ============================================
-- 4. 向量嵌入表
-- ============================================
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    
    embedding vector(1536),  -- OpenAI embedding 维度
    
    model VARCHAR(50) DEFAULT 'text-embedding-3-small',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_embeddings_item_id ON embeddings(item_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING hnsw (embedding vector_cosine_ops);

-- ============================================
-- 5. 标签表
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    color VARCHAR(20) DEFAULT '#3b82f6',
    description TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user ON tags(user_id);

-- ============================================
-- 6. 条目-标签关联表
-- ============================================
CREATE TABLE item_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(item_id, tag_id)
);

CREATE INDEX idx_item_tags_item ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag ON item_tags(tag_id);

-- ============================================
-- 7. 周报表
-- ============================================
CREATE TABLE weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    week_range VARCHAR(50),
    
    title TEXT,
    content TEXT,
    summary TEXT,
    
    stats JSONB,
    clusters JSONB,
    insights JSONB,
    keywords_summary JSONB,
    
    item_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'sent')),
    
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE INDEX idx_weekly_reports_user ON weekly_reports(user_id);
CREATE INDEX idx_weekly_reports_dates ON weekly_reports(week_start, week_end);

-- ============================================
-- 8. 周报-条目关联表
-- ============================================
CREATE TABLE report_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES weekly_reports(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    cluster_name TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(report_id, item_id)
);

CREATE INDEX idx_report_items_report ON report_items(report_id);
CREATE INDEX idx_report_items_item ON report_items(item_id);

-- ============================================
-- 9. 处理日志表
-- ============================================
CREATE TABLE processing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    
    task_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK(status IN ('success', 'failed')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_processing_logs_item ON processing_logs(item_id);
CREATE INDEX idx_processing_logs_status ON processing_logs(status);
"""


def migrate_sqlite_to_postgres(
    sqlite_path='neofeed.db',
    pg_host='localhost',
    pg_port=5432,
    pg_database='neofeed',
    pg_user='postgres',
    pg_password='',
    create_schema=True
):
    """
    将 SQLite 数据迁移到 PostgreSQL
    
    Args:
        sqlite_path: SQLite 数据库路径
        pg_host: PostgreSQL 主机
        pg_port: PostgreSQL 端口
        pg_database: PostgreSQL 数据库名
        pg_user: PostgreSQL 用户名
        pg_password: PostgreSQL 密码
        create_schema: 是否创建表结构
    """
    print("=" * 60)
    print("🔄 开始数据库迁移: SQLite → PostgreSQL")
    print("=" * 60)
    
    # 连接 SQLite
    print("\n📂 连接 SQLite 数据库...")
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()
    print("   ✅ SQLite 连接成功")
    
    # 连接 PostgreSQL
    print("\n🐘 连接 PostgreSQL 数据库...")
    try:
        pg_conn = psycopg2.connect(
            host=pg_host,
            port=pg_port,
            database=pg_database,
            user=pg_user,
            password=pg_password
        )
        pg_cursor = pg_conn.cursor()
        print("   ✅ PostgreSQL 连接成功")
    except Exception as e:
        print(f"   ❌ PostgreSQL 连接失败: {e}")
        return False
    
    # 创建表结构
    if create_schema:
        print("\n📋 创建 PostgreSQL 表结构...")
        try:
            pg_cursor.execute(POSTGRES_SCHEMA)
            pg_conn.commit()
            print("   ✅ 表结构创建成功")
        except Exception as e:
            print(f"   ⚠️  表结构创建警告: {e}")
            pg_conn.rollback()
    
    # 迁移数据
    tables_to_migrate = [
        ('users', ['email', 'telegram_id', 'telegram_username', 'preferences', 'created_at']),
        ('items', ['user_id', 'title', 'content', 'url', 'source_type', 'source_metadata', 
                   'word_count', 'language', 'status', 'created_at']),
        ('ai_results', ['item_id', 'user_id', 'summary', 'category', 'sub_category', 
                        'topics', 'keywords', 'importance_score', 'sentiment', 
                        'model_used', 'processing_time_ms', 'created_at']),
        ('tags', ['user_id', 'name', 'category', 'color', 'description', 'created_at']),
        ('item_tags', ['item_id', 'tag_id', 'created_at']),
        ('weekly_reports', ['user_id', 'week_start', 'week_end', 'week_range', 'title', 
                            'content', 'summary', 'stats', 'clusters', 'insights', 
                            'keywords_summary', 'item_count', 'status', 'created_at']),
        ('report_items', ['report_id', 'item_id', 'cluster_name', 'created_at']),
        ('processing_logs', ['item_id', 'task_type', 'status', 'error_message', 
                             'retry_count', 'processing_time_ms', 'created_at'])
    ]
    
    # ID 映射（SQLite INTEGER → PostgreSQL UUID）
    id_mappings = {}
    
    for table_name, columns in tables_to_migrate:
        print(f"\n📦 迁移表: {table_name}")
        
        # 从 SQLite 读取数据
        sqlite_cursor.execute(f"SELECT * FROM {table_name}")
        rows = sqlite_cursor.fetchall()
        
        if not rows:
            print(f"   ⚠️  表 {table_name} 为空，跳过")
            continue
        
        print(f"   读取了 {len(rows)} 条记录")
        
        # 准备插入数据
        migrated_count = 0
        for row in rows:
            try:
                # 转换数据
                values = []
                for col in columns:
                    value = row[col] if col in row.keys() else None
                    
                    # 特殊处理
                    if value is not None:
                        # JSON 字段
                        if col in ['preferences', 'source_metadata', 'stats', 'clusters', 'insights', 'keywords_summary']:
                            if isinstance(value, str):
                                value = json.loads(value) if value else None
                        
                        # 数组字段（逗号分隔 → PostgreSQL 数组）
                        elif col in ['topics', 'keywords'] and isinstance(value, str):
                            value = value.split(',') if value else []
                        
                        # ID 映射（外键）
                        elif col.endswith('_id') and col != 'telegram_id':
                            old_id = value
                            if table_name in ['items'] and col == 'user_id':
                                # 第一次遇到 user_id，需要从映射中获取
                                if 'users' in id_mappings and old_id in id_mappings['users']:
                                    value = id_mappings['users'][old_id]
                    
                    values.append(value)
                
                # 插入数据
                placeholders = ','.join(['%s'] * len(values))
                insert_query = f"INSERT INTO {table_name} ({','.join(columns)}) VALUES ({placeholders}) RETURNING id"
                pg_cursor.execute(insert_query, values)
                
                # 保存 ID 映射
                new_id = pg_cursor.fetchone()[0]
                if table_name not in id_mappings:
                    id_mappings[table_name] = {}
                id_mappings[table_name][row['id']] = new_id
                
                migrated_count += 1
                
            except Exception as e:
                print(f"   ⚠️  迁移记录失败 (ID: {row['id']}): {e}")
                continue
        
        pg_conn.commit()
        print(f"   ✅ 成功迁移 {migrated_count}/{len(rows)} 条记录")
    
    # 关闭连接
    sqlite_conn.close()
    pg_conn.close()
    
    print("\n" + "=" * 60)
    print("✅ 数据迁移完成！")
    print("=" * 60)
    print("\n💡 提示:")
    print("   - SQLite 的 INTEGER ID 已转换为 PostgreSQL 的 UUID")
    print("   - 逗号分隔的字符串已转换为 PostgreSQL 数组")
    print("   - JSON 字符串已转换为 JSONB 类型")
    print("   - 可以开始使用 pgvector 进行向量搜索了")
    
    return True


def export_schema_sql(output_path='postgres_schema.sql'):
    """导出 PostgreSQL schema 到文件"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(POSTGRES_SCHEMA)
    print(f"✅ PostgreSQL Schema 已导出到: {output_path}")


if __name__ == '__main__':
    import sys
    import os
    
    print("=" * 60)
    print("🚀 NeoFeed 数据库迁移工具")
    print("=" * 60)
    print("\n选择操作:")
    print("1. 导出 PostgreSQL Schema")
    print("2. 执行数据迁移 (SQLite → PostgreSQL)")
    print("3. 仅创建 PostgreSQL 表结构")
    
    choice = input("\n请输入选项 (1/2/3): ").strip()
    
    if choice == '1':
        export_schema_sql()
    
    elif choice == '2':
        print("\n请提供 PostgreSQL 连接信息:")
        pg_host = input("主机 (默认: localhost): ").strip() or 'localhost'
        pg_port = input("端口 (默认: 5432): ").strip() or '5432'
        pg_database = input("数据库名 (默认: neofeed): ").strip() or 'neofeed'
        pg_user = input("用户名 (默认: postgres): ").strip() or 'postgres'
        pg_password = input("密码: ").strip()
        
        sqlite_path = input("\nSQLite 数据库路径 (默认: neofeed.db): ").strip() or 'neofeed.db'
        
        if not os.path.exists(sqlite_path):
            print(f"❌ SQLite 数据库不存在: {sqlite_path}")
            sys.exit(1)
        
        migrate_sqlite_to_postgres(
            sqlite_path=sqlite_path,
            pg_host=pg_host,
            pg_port=int(pg_port),
            pg_database=pg_database,
            pg_user=pg_user,
            pg_password=pg_password,
            create_schema=True
        )
    
    elif choice == '3':
        export_schema_sql('postgres_schema.sql')
        print("\n💡 你可以手动执行这个文件来创建表结构:")
        print("   psql -U postgres -d neofeed -f postgres_schema.sql")
    
    else:
        print("❌ 无效的选项")

