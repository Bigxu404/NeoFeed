const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Item {
  id: number;
  content: string;
  created_at: string;
  summary?: string;
  tags?: string[];
  category?: string;
}

export async function saveItem(data: { content: string; enable_ai: boolean }) {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to save item');
  }
  return response.json();
}

export async function getItems(skip = 0, limit = 10): Promise<Item[]> {
  const response = await fetch(`${API_BASE_URL}/items?skip=${skip}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
}

export async function getItem(id: number): Promise<Item> {
  const response = await fetch(`${API_BASE_URL}/items/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch item');
  }
  return response.json();
}

export async function getStats() {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
}
