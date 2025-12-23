#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NeoFeed 测试数据插入脚本
用于生成示例数据进行测试
"""

import sqlite3
import json
from datetime import datetime, timedelta
import random


def insert_test_data(db_path='neofeed.db'):
    """插入测试数据"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 启用外键约束
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    print("📝 开始插入测试数据...\n")
    
    # ============================================
    # 1. 创建测试用户
    # ============================================
    print("👤 创建测试用户...")
    cursor.execute("""
        INSERT INTO users (email, telegram_id, telegram_username, preferences)
        VALUES (?, ?, ?, ?)
    """, (
        'test@neofeed.com',
        '123456789',
        'neofeed_tester',
        json.dumps({
            "language": "zh-CN",
            "report_day": "sunday",
            "report_time": "09:00",
            "categories": ["AI趋势", "产品思考", "技术分享"]
        })
    ))
    user_id = cursor.lastrowid
    print(f"   ✅ 用户创建成功 (ID: {user_id})")
    
    # ============================================
    # 2. 插入测试信息条目
    # ============================================
    print("\n📚 插入测试信息条目...")
    
    test_items = [
        {
            "title": "产品思考：如何做好用户增长",
            "content": """
# 产品思考：如何做好用户增长

用户增长是产品成功的关键。本文从三个维度探讨增长策略：

## 1. 产品价值
产品必须解决真实的用户痛点。增长的前提是产品本身有价值。

## 2. 用户体验
流畅的用户体验能够提升留存率。留存比拉新更重要。

## 3. 数据驱动
通过数据分析找到增长杠杆，进行精准优化。

总结：增长不是技巧，而是系统性工程。
            """,
            "url": "https://mp.weixin.qq.com/s/example1",
            "source_type": "wechat",
            "source_metadata": json.dumps({"公众号": "产品经理思考", "作者": "张三"}),
            "word_count": 500
        },
        {
            "title": "AI 赋能个人生产力的五个场景",
            "content": """
随着 AI 技术的发展，个人生产力工具正在经历革命性变化。

## 五个核心场景：

1. **写作辅助**：AI 帮助生成大纲、润色文字
2. **代码编程**：Copilot 提升编码效率
3. **信息检索**：语义搜索替代关键词搜索
4. **设计创作**：AI 辅助设计和配色
5. **决策支持**：数据分析和趋势预测

AI 不是替代人，而是增强人的能力。
            """,
            "url": "https://example.com/ai-productivity",
            "source_type": "web",
            "source_metadata": json.dumps({"网站": "科技博客", "分类": "AI"}),
            "word_count": 400
        },
        {
            "title": "今天和 GPT 讨论了产品设计",
            "content": """
我：如何设计一个信息管理工具？

GPT：信息管理工具的核心是降低用户的输入成本，同时提供高质量的输出。建议从以下几点入手：

1. 多渠道输入（微信、网页、API等）
2. 自动化处理（AI摘要、分类）
3. 智能推荐（基于用户兴趣）
4. 定期回顾（周报、月报）

我：很有启发，尤其是"输入成本"这个点。

GPT：是的，很多工具失败就是因为要求用户做太多手动操作。
            """,
            "url": None,
            "source_type": "gpt",
            "source_metadata": json.dumps({"会话时间": "2025-11-09 14:30"}),
            "word_count": 300
        },
        {
            "title": "关于知识管理的思考",
            "content": """
知识管理不是简单的信息收集，而是：

- 信息筛选（去除噪音）
- 结构化存储（便于检索）
- 定期回顾（形成洞察）
- 知识应用（产生价值）

工具只是手段，重要的是建立系统性的方法论。
            """,
            "url": None,
            "source_type": "manual",
            "source_metadata": None,
            "word_count": 150
        },
        {
            "title": "为什么大部分笔记工具都失败了",
            "content": """
我观察到一个现象：很多人尝试了各种笔记工具（Notion、Evernote、Obsidian），但最终都放弃了。

原因分析：

1. **输入成本高**：需要手动分类、打标签、整理格式
2. **没有产出**：只进不出，缺乏回顾机制
3. **过度设计**：功能太复杂，学习曲线陡峭

解决方案应该是：
- 让输入无摩擦（一键保存）
- 自动化处理（AI 完成重复工作）
- 周期性产出（每周生成报告）
            """,
            "url": "https://mp.weixin.qq.com/s/example2",
            "source_type": "wechat",
            "source_metadata": json.dumps({"公众号": "产品洞察", "作者": "李四"}),
            "word_count": 450
        }
    ]
    
    item_ids = []
    for item_data in test_items:
        cursor.execute("""
            INSERT INTO items (user_id, title, content, url, source_type, source_metadata, word_count, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        """, (
            user_id,
            item_data['title'],
            item_data['content'],
            item_data['url'],
            item_data['source_type'],
            item_data['source_metadata'],
            item_data['word_count']
        ))
        item_ids.append(cursor.lastrowid)
        print(f"   ✅ {item_data['title']}")
    
    # ============================================
    # 3. 插入 AI 处理结果
    # ============================================
    print("\n🤖 插入 AI 处理结果...")
    
    ai_results = [
        {
            "summary": "文章总结了用户增长的三个关键维度：产品价值、用户体验和数据驱动。强调留存比拉新更重要，增长是系统性工程而非单纯技巧。",
            "category": "产品思考",
            "sub_category": "用户增长",
            "topics": "产品,增长,数据分析",
            "keywords": "用户增长,产品价值,留存,数据驱动",
            "importance_score": 0.85,
            "sentiment": "positive"
        },
        {
            "summary": "文章介绍了AI在五个场景的应用：写作、编程、搜索、设计和决策。核心观点是AI不是替代人类，而是增强人的能力。",
            "category": "AI趋势",
            "sub_category": "生产力工具",
            "topics": "AI,生产力,工具",
            "keywords": "AI,生产力,写作,编程,Copilot",
            "importance_score": 0.78,
            "sentiment": "positive"
        },
        {
            "summary": "与GPT讨论了信息管理工具的设计要点：降低输入成本、自动化处理、智能推荐和定期回顾。核心insight是要减少用户的手动操作。",
            "category": "产品思考",
            "sub_category": "产品设计",
            "topics": "产品设计,信息管理,AI",
            "keywords": "GPT,产品设计,信息管理,自动化",
            "importance_score": 0.72,
            "sentiment": "neutral"
        },
        {
            "summary": "关于知识管理的方法论思考，强调知识管理不只是收集，而是筛选、存储、回顾和应用的完整流程。",
            "category": "知识管理",
            "sub_category": "方法论",
            "topics": "知识管理,方法论",
            "keywords": "知识管理,信息筛选,回顾,洞察",
            "importance_score": 0.65,
            "sentiment": "neutral"
        },
        {
            "summary": "分析了笔记工具失败的三个原因：输入成本高、缺乏产出机制、过度设计。提出解决方案是无摩擦输入、自动化处理和周期性产出。",
            "category": "产品思考",
            "sub_category": "工具分析",
            "topics": "笔记工具,产品分析",
            "keywords": "笔记工具,Notion,自动化,周报",
            "importance_score": 0.88,
            "sentiment": "neutral"
        }
    ]
    
    for i, result in enumerate(ai_results):
        cursor.execute("""
            INSERT INTO ai_results 
            (item_id, user_id, summary, category, sub_category, topics, keywords, 
             importance_score, sentiment, model_used, processing_time_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item_ids[i],
            user_id,
            result['summary'],
            result['category'],
            result['sub_category'],
            result['topics'],
            result['keywords'],
            result['importance_score'],
            result['sentiment'],
            'gpt-4o-mini',
            random.randint(1000, 3000)
        ))
        print(f"   ✅ AI处理完成: {test_items[i]['title'][:30]}...")
    
    # 更新 items 状态
    cursor.execute(f"""
        UPDATE items SET status = 'processed'
        WHERE id IN ({','.join(['?']*len(item_ids))})
    """, item_ids)
    
    # ============================================
    # 4. 插入标签
    # ============================================
    print("\n🏷️  创建标签...")
    
    tags_data = [
        ("AI", "topic", "#3b82f6"),
        ("产品", "topic", "#10b981"),
        ("增长", "topic", "#f59e0b"),
        ("设计", "topic", "#8b5cf6"),
        ("工具", "topic", "#ec4899"),
        ("重要", "priority", "#ef4444")
    ]
    
    tag_ids = []
    for tag_name, tag_cat, color in tags_data:
        cursor.execute("""
            INSERT INTO tags (user_id, name, category, color)
            VALUES (?, ?, ?, ?)
        """, (user_id, tag_name, tag_cat, color))
        tag_ids.append(cursor.lastrowid)
        print(f"   ✅ {tag_name} ({tag_cat})")
    
    # 给条目打标签
    cursor.execute("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)", (item_ids[0], tag_ids[1]))  # 产品
    cursor.execute("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)", (item_ids[0], tag_ids[2]))  # 增长
    cursor.execute("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)", (item_ids[1], tag_ids[0]))  # AI
    cursor.execute("INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)", (item_ids[4], tag_ids[5]))  # 重要
    
    # ============================================
    # 5. 创建周报
    # ============================================
    print("\n📅 生成测试周报...")
    
    week_start = (datetime.now() - timedelta(days=7)).date()
    week_end = datetime.now().date()
    week_range = f"{week_start.strftime('%Y.%m.%d')}–{week_end.strftime('%Y.%m.%d')}"
    
    stats = {
        "total_items": len(item_ids),
        "by_category": {
            "产品思考": 3,
            "AI趋势": 1,
            "知识管理": 1
        },
        "by_source": {
            "wechat": 2,
            "web": 1,
            "gpt": 1,
            "manual": 1
        },
        "top_keywords": ["产品", "AI", "增长", "自动化", "工具"]
    }
    
    clusters = [
        {
            "theme": "产品思考与用户增长",
            "item_count": 3,
            "keywords": ["产品", "增长", "用户"],
            "insight": "本周重点关注了产品增长策略和工具设计，特别是如何降低用户输入成本。"
        },
        {
            "theme": "AI 技术应用",
            "item_count": 2,
            "keywords": ["AI", "生产力", "自动化"],
            "insight": "AI 正在重塑个人生产力工具，自动化是关键趋势。"
        }
    ]
    
    insights = [
        {
            "title": "核心洞察",
            "content": "本周的信息收集显示，你对「降低用户输入成本」和「自动化处理」这两个主题特别感兴趣。这可能指向一个产品机会：设计一个真正无摩擦的信息管理工具。"
        },
        {
            "title": "行动建议",
            "content": "考虑将本周关于笔记工具失败原因的思考，整理成一篇系统性文章。"
        }
    ]
    
    keywords_summary = {
        "产品": 5,
        "AI": 4,
        "增长": 3,
        "自动化": 3,
        "工具": 3,
        "用户": 2,
        "设计": 2
    }
    
    report_content = f"""# 📅 NeoFeed 周报 | {week_range}

## 📊 本周数据

- 共收集 **{len(item_ids)} 条**信息
- 微信文章：2 | 网页：1 | GPT对话：1 | 手动笔记：1

---

## 🧠 主题聚类

### 1️⃣ 产品思考与用户增长 (3条)

**核心观点：**
- 增长是系统性工程，不是单纯技巧
- 留存比拉新更重要
- 很多工具失败是因为输入成本太高

**精选内容：**
> "很多人尝试了各种笔记工具，但最终都放弃了。原因是输入成本高、没有产出、过度设计。"

### 2️⃣ AI 技术应用 (2条)

**核心观点：**
- AI 不是替代人，而是增强人的能力
- 自动化是个人生产力的关键

**精选内容：**
> "信息管理工具的核心是降低用户的输入成本，同时提供高质量的输出。"

---

## 📈 高频关键词

产品 (5) | AI (4) | 增长 (3) | 自动化 (3) | 工具 (3)

---

## 💡 核心洞察

本周的信息收集显示，你对「降低用户输入成本」和「自动化处理」这两个主题特别感兴趣。这可能指向一个产品机会：设计一个真正无摩擦的信息管理工具。

---

## 🎯 下周建议

考虑将本周关于笔记工具失败原因的思考，整理成一篇系统性文章。

---

*由 NeoFeed 自动生成 | {datetime.now().strftime('%Y-%m-%d %H:%M')}*
"""
    
    cursor.execute("""
        INSERT INTO weekly_reports 
        (user_id, week_start, week_end, week_range, title, content, summary,
         stats, clusters, insights, keywords_summary, item_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        week_start,
        week_end,
        week_range,
        f"第{datetime.now().isocalendar()[1]}周知识周报",
        report_content,
        "本周重点关注产品增长和AI应用，特别是如何降低用户输入成本。",
        json.dumps(stats, ensure_ascii=False),
        json.dumps(clusters, ensure_ascii=False),
        json.dumps(insights, ensure_ascii=False),
        json.dumps(keywords_summary, ensure_ascii=False),
        len(item_ids),
        'published'
    ))
    report_id = cursor.lastrowid
    print(f"   ✅ 周报创建成功 (ID: {report_id})")
    
    # 关联条目
    for i, item_id in enumerate(item_ids):
        cluster = "产品思考与用户增长" if i in [0, 2, 4] else "AI 技术应用"
        cursor.execute("""
            INSERT INTO report_items (report_id, item_id, cluster_name)
            VALUES (?, ?, ?)
        """, (report_id, item_id, cluster))
    
    # ============================================
    # 6. 添加处理日志
    # ============================================
    print("\n📋 记录处理日志...")
    
    for item_id in item_ids:
        cursor.execute("""
            INSERT INTO processing_logs 
            (item_id, task_type, status, processing_time_ms)
            VALUES (?, ?, ?, ?)
        """, (item_id, 'summarize', 'success', random.randint(800, 2000)))
        
        cursor.execute("""
            INSERT INTO processing_logs 
            (item_id, task_type, status, processing_time_ms)
            VALUES (?, ?, ?, ?)
        """, (item_id, 'classify', 'success', random.randint(500, 1500)))
    
    print(f"   ✅ 记录了 {len(item_ids) * 2} 条处理日志")
    
    # 提交所有更改
    conn.commit()
    conn.close()
    
    print("\n" + "=" * 60)
    print("✅ 测试数据插入完成！")
    print("=" * 60)
    print(f"\n📊 数据统计:")
    print(f"   用户: 1")
    print(f"   信息条目: {len(item_ids)}")
    print(f"   AI处理结果: {len(item_ids)}")
    print(f"   标签: {len(tag_ids)}")
    print(f"   周报: 1")
    print(f"   处理日志: {len(item_ids) * 2}")


if __name__ == '__main__':
    import sys
    
    db_path = 'neofeed.db'
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    
    insert_test_data(db_path)

