"""
AI 处理模块
"""

import time
import logging
from typing import Dict
import openai

from core.config import Config
from core.database import get_db

logger = logging.getLogger(__name__)

# 配置 OpenAI
if Config.OPENAI_API_KEY:
    openai.api_key = Config.OPENAI_API_KEY


class AIProcessor:
    """AI 处理器"""
    
    def __init__(self):
        self.model = Config.OPENAI_MODEL
    
    def generate_summary(self, content: str) -> str:
        """生成摘要"""
        if not Config.OPENAI_API_KEY:
            return ""
        
        prompt = f"""
请用3句话概括以下内容的核心要点：

{content[:3000]}

要求：
1. 第一句话：整体概括
2. 第二句话：关键观点
3. 第三句话：启发或结论

只返回摘要内容。
"""
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的内容摘要助手。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            logger.error(f"Failed to generate summary: {e}")
            return ""
    
    def classify_content(self, content: str) -> str:
        """内容分类"""
        if not Config.OPENAI_API_KEY:
            return "未分类"
        
        categories = [
            "AI趋势", "产品思考", "技术分享", "设计", 
            "创业", "个人成长", "知识管理", "工作方法", "其他"
        ]
        
        prompt = f"""
请将以下内容分类到这些主题之一：
{', '.join(categories)}

内容：
{content[:2000]}

只返回一个分类名称。
"""
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的内容分类助手。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=20
            )
            
            category = response.choices[0].message.content.strip()
            return category if category in categories else "其他"
        
        except Exception as e:
            logger.error(f"Failed to classify content: {e}")
            return "其他"
    
    def extract_keywords(self, content: str) -> str:
        """提取关键词"""
        if not Config.OPENAI_API_KEY:
            return ""
        
        prompt = f"""
从以下内容中提取5-8个关键词：

{content[:2000]}

只返回关键词，用逗号分隔。

示例格式：AI,产品设计,用户体验,增长,数据分析
"""
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的关键词提取助手。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=100
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            logger.error(f"Failed to extract keywords: {e}")
            return ""
    
    def process_item(self, item_id: int) -> Dict:
        """处理单个条目"""
        start_time = time.time()
        
        db = get_db()
        
        try:
            item = db.get_item(item_id)
            
            if not item or not item['content']:
                return {'success': False, 'error': 'Invalid item'}
            
            content = item['content']
            
            # 生成摘要
            summary = self.generate_summary(content)
            
            # 分类
            category = self.classify_content(content)
            
            # 提取关键词
            keywords = self.extract_keywords(content)
            
            # 计算重要性（简化版）
            importance_score = 0.5
            if len(content) > 1000:
                importance_score += 0.2
            
            # 保存结果
            processing_time = int((time.time() - start_time) * 1000)
            
            db.create_ai_result(
                item_id=item_id,
                user_id=item['user_id'],
                summary=summary,
                category=category,
                keywords=keywords,
                importance_score=importance_score,
                model_used=self.model,
                processing_time_ms=processing_time
            )
            
            # 更新条目状态
            db.update_item_status(item_id, 'processed')
            
            logger.info(f"Successfully processed item {item_id}")
            
            return {
                'success': True,
                'item_id': item_id,
                'summary': summary,
                'category': category,
                'keywords': keywords
            }
        
        except Exception as e:
            logger.error(f"Failed to process item {item_id}: {e}")
            db.update_item_status(item_id, 'failed')
            
            return {
                'success': False,
                'item_id': item_id,
                'error': str(e)
            }
        
        finally:
            db.close()


# 全局实例
ai_processor = AIProcessor()


def process_item_async(item_id: int, user_id: int):
    """异步处理条目（简化版）"""
    import threading
    
    def _process():
        try:
            result = ai_processor.process_item(item_id)
            logger.info(f"Async processing result: {result}")
        except Exception as e:
            logger.error(f"Async processing error: {e}")
    
    thread = threading.Thread(target=_process)
    thread.daemon = True
    thread.start()
    
    logger.info(f"Started async processing for item {item_id}")

