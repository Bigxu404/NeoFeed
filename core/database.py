"""
数据库操作封装
"""

import sqlite3
import json
from datetime import datetime
from typing import Optional, Dict, List
from pathlib import Path

from core.config import Config


class DatabaseManager:
    """数据库管理器"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or Config.DATABASE_PATH
        self.conn = None
        self.cursor = None
        self._connect()
    
    def _connect(self):
        """连接数据库"""
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        # 启用外键约束
        self.cursor.execute("PRAGMA foreign_keys = ON;")
    
    def close(self):
        """关闭连接"""
        if self.conn:
            self.conn.close()
    
    # ============================================
    # 用户管理（MVP 简化版，单用户）
    # ============================================
    
    def get_or_create_default_user(self) -> Dict:
        """获取或创建默认用户（MVP 单用户）"""
        self.cursor.execute("SELECT * FROM users LIMIT 1")
        user = self.cursor.fetchone()
        
        if not user:
            # 创建默认用户
            self.cursor.execute("""
                INSERT INTO users (email, preferences)
                VALUES (?, ?)
            """, ('user@neofeed.local', '{}'))
            self.conn.commit()
            return self.get_or_create_default_user()
        
        return dict(user)
    
    # ============================================
    # 信息条目管理
    # ============================================
    
    def create_item(
        self,
        user_id: int,
        content: str,
        title: str = None,
        url: str = None,
        source_type: str = 'web',
        source_metadata: Dict = None
    ) -> int:
        """创建信息条目"""
        word_count = len(content) if content else 0
        
        # 序列化 metadata
        metadata_json = json.dumps(source_metadata) if source_metadata else None
        
        self.cursor.execute("""
            INSERT INTO items 
            (user_id, title, content, url, source_type, source_metadata, word_count, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        """, (user_id, title, content, url, source_type, metadata_json, word_count))
        
        self.conn.commit()
        return self.cursor.lastrowid
    
    def get_item(self, item_id: int) -> Optional[Dict]:
        """获取信息条目"""
        self.cursor.execute("""
            SELECT * FROM items WHERE id = ?
        """, (item_id,))
        
        row = self.cursor.fetchone()
        if not row:
            return None
        
        item = dict(row)
        # 解析 JSON 字段
        if item.get('source_metadata'):
            try:
                item['source_metadata'] = json.loads(item['source_metadata'])
            except:
                pass
        
        return item
    
    def get_items(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        status: str = None
    ) -> List[Dict]:
        """获取信息列表"""
        query = """
            SELECT 
                i.*,
                a.summary,
                a.category,
                a.keywords,
                a.importance_score
            FROM items i
            LEFT JOIN ai_results a ON a.item_id = i.id
            WHERE i.user_id = ?
        """
        
        params = [user_id]
        
        if status:
            query += " AND i.status = ?"
            params.append(status)
        
        query += " ORDER BY i.created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        self.cursor.execute(query, params)
        
        items = []
        for row in self.cursor.fetchall():
            item = dict(row)
            # 解析 metadata
            if item.get('source_metadata'):
                try:
                    item['source_metadata'] = json.loads(item['source_metadata'])
                except:
                    pass
            items.append(item)
        
        return items
    
    def get_items_count(self, user_id: int, status: str = None) -> int:
        """获取条目总数"""
        query = "SELECT COUNT(*) as count FROM items WHERE user_id = ?"
        params = [user_id]
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        self.cursor.execute(query, params)
        return self.cursor.fetchone()['count']
    
    def update_item_status(self, item_id: int, status: str):
        """更新条目状态"""
        self.cursor.execute("""
            UPDATE items SET status = ? WHERE id = ?
        """, (status, item_id))
        self.conn.commit()
    
    # ============================================
    # AI 处理结果
    # ============================================
    
    def create_ai_result(
        self,
        item_id: int,
        user_id: int,
        summary: str = None,
        category: str = None,
        keywords: str = None,
        importance_score: float = 0.0,
        **kwargs
    ) -> int:
        """保存 AI 处理结果"""
        self.cursor.execute("""
            INSERT INTO ai_results
            (item_id, user_id, summary, category, keywords, importance_score,
             model_used, processing_time_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item_id, user_id, summary, category, keywords, importance_score,
            kwargs.get('model_used', 'gpt-4o-mini'),
            kwargs.get('processing_time_ms', 0)
        ))
        
        self.conn.commit()
        return self.cursor.lastrowid
    
    def get_ai_result_by_item(self, item_id: int) -> Optional[Dict]:
        """获取条目的 AI 结果"""
        self.cursor.execute("""
            SELECT * FROM ai_results WHERE item_id = ?
        """, (item_id,))
        
        row = self.cursor.fetchone()
        return dict(row) if row else None
    
    # ============================================
    # 统计查询
    # ============================================
    
    def get_user_stats(self, user_id: int, days: int = 7) -> Dict:
        """获取用户统计"""
        self.cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as processed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
            FROM items
            WHERE user_id = ?
            AND created_at >= datetime('now', '-' || ? || ' days')
        """, (user_id, days))
        
        row = self.cursor.fetchone()
        return dict(row) if row else {}


# 创建全局实例获取函数
def get_db() -> DatabaseManager:
    """获取数据库实例"""
    return DatabaseManager()

