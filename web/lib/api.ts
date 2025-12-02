export async function saveItem(content: string) {
  const response = await fetch('/api/process-feed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save item');
  }

  return await response.json();
}
