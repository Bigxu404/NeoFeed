"""
网页内容抓取模块
"""

import re
import requests
from typing import Optional, Dict
from urllib.parse import urlparse

from core.config import Config


class WebFetcher:
    """网页内容抓取器"""
    
    def __init__(self):
        self.jina_api_url = "https://r.jina.ai/"
        self.timeout = 10
    
    def is_url(self, text: str) -> bool:
        """判断文本是否为 URL"""
        if not text:
            return False
        
        url_pattern = re.compile(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        )
        return bool(url_pattern.search(text))
    
    def extract_url(self, text: str) -> Optional[str]:
        """从文本中提取 URL"""
        if not text:
            return None
        
        url_pattern = re.compile(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        )
        match = url_pattern.search(text)
        return match.group(0) if match else None
    
    def fetch_with_jina(self, url: str) -> Dict[str, str]:
        """使用 Jina Reader API 抓取网页"""
        try:
            jina_url = f"{self.jina_api_url}{url}"
            
            response = requests.get(
                jina_url,
                headers={'Accept': 'application/json'},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'title': data.get('title', ''),
                    'content': data.get('content', ''),
                    'error': None
                }
            else:
                return {
                    'title': '',
                    'content': '',
                    'error': f"HTTP {response.status_code}"
                }
        
        except Exception as e:
            return {
                'title': '',
                'content': '',
                'error': str(e)
            }
    
    def fetch(self, url: str) -> Dict[str, str]:
        """抓取网页内容"""
        if not Config.ENABLE_WEB_SCRAPING:
            return {
                'title': '',
                'content': '',
                'error': 'Web scraping disabled'
            }
        
        return self.fetch_with_jina(url)
    
    def get_domain(self, url: str) -> str:
        """获取 URL 的域名"""
        try:
            parsed = urlparse(url)
            return parsed.netloc
        except:
            return ''


# 全局实例
web_fetcher = WebFetcher()

