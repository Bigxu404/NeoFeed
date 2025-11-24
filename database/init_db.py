#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NeoFeed 数据库初始化脚本
用于创建 SQLite 数据库和表结构
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime


def init_database(db_path='neofeed.db', schema_path='schema.sql'):
    """
    初始化数据库
    
    Args:
        db_path: 数据库文件路径
        schema_path: SQL schema 文件路径
    """
    # 确保数据库目录存在
    db_file = Path(db_path)
    db_file.parent.mkdir(parents=True, exist_ok=True)
    
    # 如果数据库已存在，询问是否覆盖
    if db_file.exists():
        response = input(f"⚠️  数据库 {db_path} 已存在，是否覆盖？(y/N): ")
        if response.lower() != 'y':
            print("❌ 操作已取消")
            return False
        os.remove(db_path)
        print(f"🗑️  已删除旧数据库")
    
    # 连接数据库（会自动创建）
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 启用外键约束（SQLite 默认关闭）
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # 读取并执行 schema
        schema_file = Path(schema_path)
        if not schema_file.exists():
            print(f"❌ Schema 文件不存在: {schema_path}")
            return False
        
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        cursor.executescript(schema_sql)
        conn.commit()
        
        # 验证表是否创建成功
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            ORDER BY name
        """)
        tables = cursor.fetchall()
        
        print(f"\n✅ 数据库初始化完成: {db_path}")
        print(f"📊 共创建 {len(tables)} 个表:")
        for table in tables:
            print(f"   - {table[0]}")
        
        # 显示数据库信息
        cursor.execute("PRAGMA page_size;")
        page_size = cursor.fetchone()[0]
        cursor.execute("PRAGMA page_count;")
        page_count = cursor.fetchone()[0]
        db_size = (page_size * page_count) / 1024  # KB
        
        print(f"\n📈 数据库大小: {db_size:.2f} KB")
        print(f"🔧 外键约束: 已启用")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ 数据库错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        return False


def verify_database(db_path='neofeed.db'):
    """验证数据库结构"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"\n🔍 验证数据库结构...")
        
        # 检查每个表的列
        tables = ['users', 'items', 'ai_results', 'tags', 'item_tags', 
                  'weekly_reports', 'report_items', 'processing_logs']
        
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table});")
            columns = cursor.fetchall()
            print(f"\n📋 {table} ({len(columns)} 列):")
            for col in columns:
                col_id, name, type_, not_null, default, pk = col
                pk_str = " [PK]" if pk else ""
                null_str = " NOT NULL" if not_null else ""
                default_str = f" DEFAULT {default}" if default else ""
                print(f"   {name:20s} {type_:15s}{pk_str}{null_str}{default_str}")
        
        # 检查索引
        cursor.execute("""
            SELECT name, tbl_name 
            FROM sqlite_master 
            WHERE type='index' AND name NOT LIKE 'sqlite_%'
            ORDER BY tbl_name, name
        """)
        indexes = cursor.fetchall()
        print(f"\n🔑 共创建 {len(indexes)} 个索引:")
        current_table = None
        for idx_name, tbl_name in indexes:
            if tbl_name != current_table:
                print(f"\n   {tbl_name}:")
                current_table = tbl_name
            print(f"      - {idx_name}")
        
        # 检查视图
        cursor.execute("""
            SELECT name 
            FROM sqlite_master 
            WHERE type='view'
            ORDER BY name
        """)
        views = cursor.fetchall()
        if views:
            print(f"\n👁️  共创建 {len(views)} 个视图:")
            for view in views:
                print(f"   - {view[0]}")
        
        # 检查触发器
        cursor.execute("""
            SELECT name, tbl_name 
            FROM sqlite_master 
            WHERE type='trigger'
            ORDER BY tbl_name, name
        """)
        triggers = cursor.fetchall()
        if triggers:
            print(f"\n⚡ 共创建 {len(triggers)} 个触发器:")
            for trigger_name, tbl_name in triggers:
                print(f"   - {trigger_name} (on {tbl_name})")
        
        conn.close()
        print(f"\n✅ 数据库结构验证通过")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ 验证失败: {e}")
        return False


if __name__ == '__main__':
    import sys
    
    # 默认路径
    db_path = 'neofeed.db'
    schema_path = 'schema.sql'
    
    # 支持命令行参数
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    if len(sys.argv) > 2:
        schema_path = sys.argv[2]
    
    print("=" * 60)
    print("🚀 NeoFeed 数据库初始化工具")
    print("=" * 60)
    
    # 初始化数据库
    if init_database(db_path, schema_path):
        # 验证结构
        verify_database(db_path)
        print("\n🎉 数据库准备就绪！")
    else:
        print("\n❌ 初始化失败")
        sys.exit(1)

