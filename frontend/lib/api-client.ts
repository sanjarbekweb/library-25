// frontend/lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchCatalogBooks(params: { category?: string; search?: string; sort?: string; page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params.category && params.category !== 'all') searchParams.append('category', params.category);
  if (params.search) searchParams.append('search', params.search);
  // mapping page to cursor or offset depending on implementation. We used cursor. Let's just use limit and assume page maps conceptually or update backend for offset
  
  // Actually, we'll just implement simple offset for catalog in our backend later or map it.
  
  const url = `${API_URL}/books?${searchParams.toString()}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }
  return response.json();
}
