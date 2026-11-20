import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface SubmitFeedbackDto {
  bookId: string;
  loanId?: string;
  rating: number;
  comment?: string;
}

export interface ReviewItem {
  id: string;
  bookId: string;
  studentId: string;
  loanId: string | null;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface AdminFeedbackItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: string;
  coverImageUrl: string | null;
  studentId: string;
  studentName: string;
  studentEmail: string;
  loanId: string | null;
  rating: number;
  comment: string | null;
  isModerated: boolean;
  createdAt: string | Date;
  borrowedAt?: string | Date | null;
  returnedAt?: string | Date | null;
  book?: {
    id: string;
    title: string;
    author: string;
    coverImageUrl: string | null;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AdminFeedbackResult {
  feedbacks: AdminFeedbackItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalCount: number;
    moderatedCount: number;
    publishedCount: number;
    averageRating?: number | null;
  };
}

export async function fetchBookReviewsApi(bookId: string): Promise<ReviewItem[]> {
  const url = `${API_URL}/feedback/book/${bookId}`;
  const res = await fetch(url, { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch book reviews');
  }
  return json.data;
}

export async function fetchEligibleLoanApi(bookId: string, token: string | null) {
  if (!token) return null;
  const url = `${API_URL}/feedback/eligible?bookId=${bookId}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function submitFeedbackApi(data: SubmitFeedbackDto, token: string | null) {
  const url = `${API_URL}/feedback`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Failed to submit feedback');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export async function fetchAdminFeedbacksApi(
  params: { status?: string; search?: string; rating?: number; page?: number; limit?: number },
  token: string | null
): Promise<AdminFeedbackResult> {
  const searchParams = new URLSearchParams();
  if (params.status && params.status.toUpperCase() !== 'ALL') searchParams.append('status', params.status);
  if (params.search && params.search.trim()) searchParams.append('search', params.search.trim());
  if (params.rating) searchParams.append('rating', params.rating.toString());
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_URL}/feedback/admin?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch admin feedback');
  }
  return json.data;
}

export async function moderateFeedbackApi(id: string, isModerated: boolean, token: string | null) {
  const url = `${API_URL}/feedback/${id}/moderate`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isModerated }),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Failed to moderate feedback');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export async function deleteFeedbackApi(id: string, token: string | null) {
  const url = `${API_URL}/feedback/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Failed to delete feedback');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export function useBookReviews(bookId: string) {
  return useQuery({
    queryKey: ['feedback', 'book', bookId],
    queryFn: () => fetchBookReviewsApi(bookId),
    enabled: Boolean(bookId),
  });
}

export function useSubmitFeedback() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitFeedbackDto) => {
      const token = await getToken();
      return submitFeedbackApi(data, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useAdminFeedbacks(params: { status?: string; search?: string; rating?: number; page?: number; limit?: number }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['admin', 'feedback', params],
    queryFn: async () => {
      const token = await getToken();
      return fetchAdminFeedbacksApi(params, token);
    },
  });
}

export function useModerateFeedback() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isModerated }: { id: string; isModerated: boolean }) => {
      const token = await getToken();
      return moderateFeedbackApi(id, isModerated, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    },
  });
}

export function useDeleteFeedback() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return deleteFeedbackApi(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    },
  });
}
