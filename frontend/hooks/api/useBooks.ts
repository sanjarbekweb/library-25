import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function useBooks(params?: { search?: string; category?: string; cursor?: string; limit?: number }) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['books', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.cursor) searchParams.append('cursor', params.cursor);
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const url = `${API_URL}/books?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
          // Public endpoint might not need token, but add it if available
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      return response.json();
    }
  });
}

export function useCreateBook() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Failed to create book');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    }
  });
}

export function useAddCopy() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, ...data }: { bookId: string; barcode?: string; condition?: string }) => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/books/${bookId}/copies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || 'Failed to add copy');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    }
  });
}
