"""
配置管理
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    """配置类"""
    
    # 数据库
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'database/neofeed.db')
    
    # OpenAI
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    
    # 功能开关
    ENABLE_AI_PROCESSING = os.getenv('ENABLE_AI_PROCESSING', 'false').lower() == 'true'
    ENABLE_WEB_SCRAPING = os.getenv('ENABLE_WEB_SCRAPING', 'true').lower() == 'true'
    
    # 日志
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # 项目路径
    BASE_DIR = Path(__file__).resolve().parent.parent
    
    # CORS 配置（支持多个前端端口）
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:3002').split(',')
    
    @classmethod
    def validate(cls):
        """验证配置"""
        # MVP 阶段不强制要求 OpenAI Key
        return True


# 验证配置
Config.validate()

