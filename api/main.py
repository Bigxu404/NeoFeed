"""
FastAPI 主应用
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging

from core.config import Config
from core.database import get_db
from core.fetcher import web_fetcher
from core.processor import ai_processor, process_item_async

# 配置日志
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建 FastAPI 应用
app = FastAPI(
    title="NeoFeed API",
    description="个人信息中枢 API",
    version="0.2.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# 数据模型
# ============================================

class SaveItemRequest(BaseModel):
    """保存信息请求"""
    content: str
    title: Optional[str] = None
    url: Optional[str] = None
    enable_ai: bool = False


class ItemResponse(BaseModel):
    """信息条目响应"""
    id: int
    title: Optional[str]
    content: str
    url: Optional[str]
    source_type: str
    status: str
    created_at: str
    # AI 结果
    summary: Optional[str] = None
    category: Optional[str] = None
    keywords: Optional[str] = None
    importance_score: Optional[float] = None


# ============================================
# API 端点
# ============================================

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Welcome to NeoFeed API",
        "version": "0.2.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    db = get_db()
    try:
        user = db.get_or_create_default_user()
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
    finally:
        db.close()
    
    return {
        "status": "healthy",
        "database": db_status,
        "ai_enabled": Config.ENABLE_AI_PROCESSING
    }


@app.post("/api/items", response_model=dict)
async def save_item(request: SaveItemRequest):
    """
    保存信息条目
    
    支持：
    1. 纯文本
    2. URL（自动抓取）
    3. 带标题的内容
    """
    db = get_db()
    
    try:
        # 获取默认用户（MVP 单用户）
        user = db.get_or_create_default_user()
        user_id = user['id']
        
        content = request.content.strip()
        title = request.title
        url = request.url
        source_type = 'manual'
        source_metadata = {}
        
        # 判断是否为 URL
        if web_fetcher.is_url(content):
            extracted_url = web_fetcher.extract_url(content)
            
            if Config.ENABLE_WEB_SCRAPING:
                logger.info(f"Fetching URL: {extracted_url}")
                
                fetch_result = web_fetcher.fetch(extracted_url)
                
                if fetch_result['content']:
                    content = fetch_result['content']
                    title = fetch_result['title'] or title
                    url = extracted_url
                    source_type = 'web'
                    source_metadata = {
                        'domain': web_fetcher.get_domain(extracted_url),
                        'original_url': extracted_url
                    }
                else:
                    logger.warning(f"Failed to fetch URL: {fetch_result.get('error')}")
        
        # 保存到数据库
        item_id = db.create_item(
            user_id=user_id,
            content=content,
            title=title,
            url=url,
            source_type=source_type,
            source_metadata=source_metadata
        )
        
        logger.info(f"Item saved: {item_id}")
        
        # AI 处理（异步）
        if request.enable_ai and Config.ENABLE_AI_PROCESSING:
            logger.info(f"Starting AI processing for item {item_id}")
            process_item_async(item_id, user_id)
        
        return {
            "success": True,
            "item_id": item_id,
            "message": "保存成功" + (" - AI 处理中..." if request.enable_ai else "")
        }
    
    except Exception as e:
        logger.error(f"Failed to save item: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        db.close()


@app.get("/api/items", response_model=dict)
async def get_items(
    limit: int = 20,
    offset: int = 0,
    status: Optional[str] = None
):
    """
    获取信息列表
    
    参数:
    - limit: 每页数量
    - offset: 偏移量
    - status: 筛选状态（pending/processing/processed/failed）
    """
    db = get_db()
    
    try:
        user = db.get_or_create_default_user()
        user_id = user['id']
        
        items = db.get_items(
            user_id=user_id,
            limit=limit,
            offset=offset,
            status=status
        )
        
        total = db.get_items_count(user_id, status)
        
        return {
            "success": True,
            "items": items,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    
    except Exception as e:
        logger.error(f"Failed to get items: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        db.close()


@app.get("/api/items/{item_id}", response_model=dict)
async def get_item(item_id: int):
    """获取单个条目详情"""
    db = get_db()
    
    try:
        item = db.get_item(item_id)
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # 获取 AI 结果
        ai_result = db.get_ai_result_by_item(item_id)
        
        if ai_result:
            item.update({
                'summary': ai_result.get('summary'),
                'category': ai_result.get('category'),
                'keywords': ai_result.get('keywords'),
                'importance_score': ai_result.get('importance_score')
            })
        
        return {
            "success": True,
            "item": item
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get item: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        db.close()


@app.get("/api/stats", response_model=dict)
async def get_stats(days: int = 7):
    """获取统计数据"""
    db = get_db()
    
    try:
        user = db.get_or_create_default_user()
        user_id = user['id']
        
        stats = db.get_user_stats(user_id, days)
        
        return {
            "success": True,
            "stats": stats,
            "period_days": days
        }
    
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        db.close()


@app.post("/api/items/{item_id}/process", response_model=dict)
async def process_item(item_id: int):
    """手动触发 AI 处理"""
    if not Config.ENABLE_AI_PROCESSING:
        raise HTTPException(status_code=400, detail="AI processing is disabled")
    
    db = get_db()
    
    try:
        item = db.get_item(item_id)
        
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # 更新状态
        db.update_item_status(item_id, 'processing')
        
        # 开始处理
        process_item_async(item_id, item['user_id'])
        
        return {
            "success": True,
            "message": "AI 处理已开始",
            "item_id": item_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process item: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        db.close()


# ============================================
# 启动命令
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

