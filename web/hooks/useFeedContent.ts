import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useFeedContent(id: string | null, initialSummary: string = '') {
  const [content, setContent] = useState<string | null>(initialSummary);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 如果没有 ID（如发现流内容），保持初始摘要，不进行网络请求
    if (!id) {
      setContent(initialSummary);
      setUrl(null);
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);

      // 1. 尝试从本地缓存获取
      const cacheKey = `neofeed_content_${id}`;
      const urlKey = `neofeed_url_${id}`;
      const cachedContent = localStorage.getItem(cacheKey);
      const cachedUrl = localStorage.getItem(urlKey);
      
      if (cachedContent) {
        setContent(cachedContent);
        if (cachedUrl) setUrl(cachedUrl);
        setLoading(false);
      }

      // 2. 从 API 获取
      try {
        const res = await fetch(`/api/feed/${id}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (res.status === 401) {
          toast.error('身份验证失效', {
            description: '请重新登录。',
            action: { label: '去登录', onClick: () => window.location.href = '/login' }
          });
          throw new Error('Unauthorized');
        }

        if (!res.ok) throw new Error('Failed to fetch content');
        
        const data = await res.json();
        
        if (data.content) {
          setContent(data.content);
          localStorage.setItem(cacheKey, data.content);
          
          if (data.url) {
            setUrl(data.url);
            localStorage.setItem(urlKey, data.url);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch feed content:", err);
        setError(err.message);
        if (err.message !== 'Unauthorized' && !content) {
          setContent(initialSummary);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, initialSummary]);

  return { content, url, loading, error };
}
