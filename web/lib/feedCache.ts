export async function fetchFeedContent(id: string): Promise<string | null> {
  if (!id) return null;

  // 1. Try Cache (LocalStorage)
  const cacheKey = `neofeed_content_${id}`;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log(`⚡️ [Cache] Hit for ${id}`);
      return cached;
    }
  }

  // 2. Fetch API
  try {
    console.log(`🌐 [Network] Fetching full content for ${id}...`);
    const res = await fetch(`/api/feed/${id}`);
    if (!res.ok) throw new Error('Failed to fetch content');
    
    const { content } = await res.json();
    
    // 3. Save to Cache
    if (content && typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, content);
    }
    return content;
  } catch (e) {
    console.error("Failed to fetch feed content", e);
    return null;
  }
}

