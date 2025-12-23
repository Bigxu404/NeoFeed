import { useState, useEffect } from 'react';

export function useFeedContent(id: string | null, initialSummary: string = '') {
  const [content, setContent] = useState<string | null>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setContent(null);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);

      // 1. Try Cache
      const cacheKey = `neofeed_content_${id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        console.log(`⚡️ [Cache] Hit for ${id}`);
        setContent(cached);
        setLoading(false);
        return;
      }

      // 2. Fetch API
      try {
        console.log(`🌐 [Network] Fetching full content for ${id}...`);
        const res = await fetch(`/api/feed/${id}`);
        if (!res.ok) throw new Error('Failed to fetch content');
        
        const data = await res.json();
        
        if (data.content) {
          setContent(data.content);
          localStorage.setItem(cacheKey, data.content);
        } else {
            // Fallback if no content returned
           setContent(initialSummary || "No detailed content available.");
        }

      } catch (err: any) {
        console.error("Failed to fetch feed content", err);
        setError(err.message);
        setContent(initialSummary); // Revert to summary on error
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, initialSummary]);

  return { content, loading, error };
}

