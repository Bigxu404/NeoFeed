#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NeoFeed 数据库查询测试脚本
用于验证 CRUD 操作和常用查询
"""

import sqlite3
import json
from datetime import datetime, timedelta


def connect_db(db_path='neofeed.db'):
    """连接数据库"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # 使用字典式访问
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    return conn, cursor


def print_separator(title):
    """打印分隔符"""
    print("\n" + "=" * 60)
    print(f"🔍 {title}")
    print("=" * 60)


def test_basic_queries(db_path='neofeed.db'):
    """测试基础查询"""
    conn, cursor = connect_db(db_path)
    
    # ============================================
    # 1. 查询所有用户
    # ============================================
    print_separator("查询所有用户")
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    for user in users:
        print(f"ID: {user['id']}")
        print(f"Email: {user['email']}")
        print(f"Telegram: @{user['telegram_username']} ({user['telegram_id']})")
        print(f"创建时间: {user['created_at']}")
    
    # ============================================
    # 2. 查询最近的信息（带AI结果）
    # ============================================
    print_separator("最近的信息条目（带AI处理结果）")
    cursor.execute("""
        SELECT 
            i.id,
            i.title,
            i.source_type,
            i.word_count,
            i.created_at,
            a.summary,
            a.category,
            a.keywords,
            a.importance_score
        FROM items i
        LEFT JOIN ai_results a ON a.item_id = i.id
        ORDER BY i.created_at DESC
        LIMIT 5
    """)
    
    items = cursor.fetchall()
    for item in items:
        print(f"\n📄 [{item['source_type']}] {item['title']}")
        print(f"   分类: {item['category']}")
        print(f"   关键词: {item['keywords']}")
        print(f"   重要性: {item['importance_score']:.2f}")
        print(f"   摘要: {item['summary'][:60]}...")
    
    # ============================================
    # 3. 按分类统计
    # ============================================
    print_separator("按分类统计信息数量")
    cursor.execute("""
        SELECT 
            a.category,
            COUNT(*) as count,
            AVG(a.importance_score) as avg_importance
        FROM ai_results a
        GROUP BY a.category
        ORDER BY count DESC
    """)
    
    stats = cursor.fetchall()
    for stat in stats:
        print(f"   {stat['category']:20s} | 数量: {stat['count']:2d} | 平均重要性: {stat['avg_importance']:.2f}")
    
    # ============================================
    # 4. 搜索关键词
    # ============================================
    print_separator("搜索包含 'AI' 关键词的信息")
    cursor.execute("""
        SELECT 
            i.title,
            a.keywords,
            a.category
        FROM items i
        JOIN ai_results a ON a.item_id = i.id
        WHERE a.keywords LIKE '%AI%'
    """)
    
    results = cursor.fetchall()
    for result in results:
        print(f"   📌 {result['title']}")
        print(f"      分类: {result['category']} | 关键词: {result['keywords']}")
    
    # ============================================
    # 5. 查看标签使用情况
    # ============================================
    print_separator("标签使用统计")
    cursor.execute("""
        SELECT 
            t.name,
            t.color,
            COUNT(it.item_id) as usage_count
        FROM tags t
        LEFT JOIN item_tags it ON it.tag_id = t.id
        GROUP BY t.id
        ORDER BY usage_count DESC
    """)
    
    tags = cursor.fetchall()
    for tag in tags:
        print(f"   🏷️  {tag['name']:15s} ({tag['color']}) | 使用次数: {tag['usage_count']}")
    
    # ============================================
    # 6. 查看周报详情
    # ============================================
    print_separator("最新周报")
    cursor.execute("""
        SELECT 
            id,
            title,
            week_range,
            item_count,
            status,
            created_at
        FROM weekly_reports
        ORDER BY created_at DESC
        LIMIT 1
    """)
    
    report = cursor.fetchone()
    if report:
        print(f"标题: {report['title']}")
        print(f"时间范围: {report['week_range']}")
        print(f"包含条目: {report['item_count']} 条")
        print(f"状态: {report['status']}")
        print(f"生成时间: {report['created_at']}")
        
        # 查看周报包含的条目
        cursor.execute("""
            SELECT 
                i.title,
                ri.cluster_name
            FROM report_items ri
            JOIN items i ON i.id = ri.item_id
            WHERE ri.report_id = ?
        """, (report['id'],))
        
        report_items = cursor.fetchall()
        print(f"\n包含的条目:")
        current_cluster = None
        for item in report_items:
            if item['cluster_name'] != current_cluster:
                print(f"\n   【{item['cluster_name']}】")
                current_cluster = item['cluster_name']
            print(f"      - {item['title']}")
    
    # ============================================
    # 7. 处理日志统计
    # ============================================
    print_separator("AI 处理统计")
    cursor.execute("""
        SELECT 
            task_type,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
            AVG(processing_time_ms) as avg_time
        FROM processing_logs
        GROUP BY task_type
    """)
    
    logs = cursor.fetchall()
    for log in logs:
        success_rate = (log['success'] / log['total'] * 100) if log['total'] > 0 else 0
        print(f"   {log['task_type']:15s} | 总数: {log['total']:2d} | 成功率: {success_rate:.0f}% | 平均耗时: {log['avg_time']:.0f}ms")
    
    # ============================================
    # 8. 使用视图查询
    # ============================================
    print_separator("使用视图查询完整信息")
    cursor.execute("""
        SELECT 
            title,
            source_type,
            category,
            importance_score
        FROM v_items_full
        ORDER BY importance_score DESC
        LIMIT 3
    """)
    
    items = cursor.fetchall()
    print("\n📊 重要性排名前3:")
    for i, item in enumerate(items, 1):
        print(f"   {i}. [{item['source_type']}] {item['title']}")
        print(f"      分类: {item['category']} | 评分: {item['importance_score']:.2f}")
    
    conn.close()


def test_crud_operations(db_path='neofeed.db'):
    """测试 CRUD 操作"""
    conn, cursor = connect_db(db_path)
    
    print_separator("测试 CRUD 操作")
    
    # ============================================
    # CREATE: 插入新信息
    # ============================================
    print("\n➕ CREATE: 插入新信息...")
    cursor.execute("""
        INSERT INTO items (user_id, title, content, source_type, word_count, status)
        VALUES (1, '测试条目', '这是一条测试内容', 'manual', 10, 'pending')
    """)
    new_item_id = cursor.lastrowid
    print(f"   ✅ 插入成功，ID: {new_item_id}")
    
    # ============================================
    # READ: 读取刚插入的信息
    # ============================================
    print("\n📖 READ: 读取刚插入的信息...")
    cursor.execute("SELECT * FROM items WHERE id = ?", (new_item_id,))
    item = cursor.fetchone()
    print(f"   标题: {item['title']}")
    print(f"   内容: {item['content']}")
    print(f"   状态: {item['status']}")
    
    # ============================================
    # UPDATE: 更新信息
    # ============================================
    print("\n✏️  UPDATE: 更新信息...")
    cursor.execute("""
        UPDATE items 
        SET title = '测试条目（已更新）', status = 'processed'
        WHERE id = ?
    """, (new_item_id,))
    print(f"   ✅ 更新成功，影响行数: {cursor.rowcount}")
    
    # 验证更新
    cursor.execute("SELECT title, status FROM items WHERE id = ?", (new_item_id,))
    updated_item = cursor.fetchone()
    print(f"   新标题: {updated_item['title']}")
    print(f"   新状态: {updated_item['status']}")
    
    # ============================================
    # DELETE: 删除信息
    # ============================================
    print("\n🗑️  DELETE: 删除测试信息...")
    cursor.execute("DELETE FROM items WHERE id = ?", (new_item_id,))
    print(f"   ✅ 删除成功，影响行数: {cursor.rowcount}")
    
    # 验证删除
    cursor.execute("SELECT COUNT(*) as count FROM items WHERE id = ?", (new_item_id,))
    count = cursor.fetchone()['count']
    print(f"   验证: 记录数 = {count} (应该为0)")
    
    conn.commit()
    conn.close()


def test_advanced_queries(db_path='neofeed.db'):
    """测试高级查询"""
    conn, cursor = connect_db(db_path)
    
    print_separator("高级查询测试")
    
    # ============================================
    # 1. 时间范围查询（最近7天）
    # ============================================
    print("\n📅 最近7天的信息:")
    cursor.execute("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
        FROM items
        WHERE created_at >= datetime('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    """)
    
    daily_stats = cursor.fetchall()
    for stat in daily_stats:
        print(f"   {stat['date']}: {stat['count']} 条")
    
    # ============================================
    # 2. 多条件搜索
    # ============================================
    print("\n🔎 多条件搜索: 产品相关 + 重要性>0.7 + 微信来源")
    cursor.execute("""
        SELECT 
            i.title,
            a.importance_score,
            a.category
        FROM items i
        JOIN ai_results a ON a.item_id = i.id
        WHERE i.source_type = 'wechat'
          AND a.importance_score > 0.7
          AND (a.keywords LIKE '%产品%' OR a.category LIKE '%产品%')
    """)
    
    results = cursor.fetchall()
    for result in results:
        print(f"   📄 {result['title']}")
        print(f"      评分: {result['importance_score']:.2f} | 分类: {result['category']}")
    
    # ============================================
    # 3. 聚合统计
    # ============================================
    print("\n📊 综合统计:")
    cursor.execute("""
        SELECT 
            COUNT(DISTINCT i.id) as total_items,
            COUNT(DISTINCT i.user_id) as total_users,
            COUNT(DISTINCT a.category) as total_categories,
            AVG(i.word_count) as avg_words,
            MAX(a.importance_score) as max_importance
        FROM items i
        LEFT JOIN ai_results a ON a.item_id = i.id
    """)
    
    stats = cursor.fetchone()
    print(f"   总条目数: {stats['total_items']}")
    print(f"   用户数: {stats['total_users']}")
    print(f"   分类数: {stats['total_categories']}")
    print(f"   平均字数: {stats['avg_words']:.0f}")
    print(f"   最高评分: {stats['max_importance']:.2f}")
    
    # ============================================
    # 4. 子查询：找出重要性高于平均值的条目
    # ============================================
    print("\n⭐ 重要性高于平均值的条目:")
    cursor.execute("""
        SELECT 
            i.title,
            a.importance_score,
            (SELECT AVG(importance_score) FROM ai_results) as avg_score
        FROM items i
        JOIN ai_results a ON a.item_id = i.id
        WHERE a.importance_score > (SELECT AVG(importance_score) FROM ai_results)
        ORDER BY a.importance_score DESC
    """)
    
    results = cursor.fetchall()
    avg_score = results[0]['avg_score'] if results else 0
    print(f"   平均重要性: {avg_score:.2f}\n")
    for result in results:
        print(f"   📌 {result['title']}")
        print(f"      评分: {result['importance_score']:.2f} (高于平均 {result['importance_score'] - avg_score:.2f})")
    
    conn.close()


if __name__ == '__main__':
    import sys
    
    db_path = 'neofeed.db'
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    
    print("=" * 60)
    print("🧪 NeoFeed 数据库查询测试")
    print("=" * 60)
    
    # 运行测试
    test_basic_queries(db_path)
    test_crud_operations(db_path)
    test_advanced_queries(db_path)
    
    print("\n" + "=" * 60)
    print("✅ 所有测试完成！")
    print("=" * 60)

