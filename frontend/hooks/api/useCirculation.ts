import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
export type CopyCondition = "MINT" | "GOOD" | "FAIR" | "DAMAGED";
export type CopyStatus = "AVAILABLE" | "BORROWED" | "RESERVED" | "MAINTENANCE" | "LOST";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface CheckoutParams {
  copyId: string;
  studentId: string;
  dueDays: number;
  expectedVersion?: number;
  idempotencyKey?: string;
}

export interface CheckinParams {
  copyId: string;
  condition?: CopyCondition;
  status?: CopyStatus;
  notes?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
}

export interface StudentSearchResult {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  activeLoansCount: number;
  activeReservationsCount: number;
}

export interface CopySearchResult {
  id: string;
  barcode: string;
  condition: CopyCondition;
  status: CopyStatus;
  version: number;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string | null;
  coverImageUrl: string | null;
  category: string;
  currentHolderName: string | null;
  currentHolderId: string | null;
  activeLoanId: string | null;
  dueDate: Date | null;
  borrowedAt: Date | null;
}

export async function fetchStudentsApi(query: string, token: string | null): Promise<StudentSearchResult[]> {
  const url = `${API_URL}/circulation/students?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to search students');
  }
  return json.data;
}

export async function fetchCopiesApi(query: string, token: string | null): Promise<CopySearchResult[]> {
  const url = `${API_URL}/circulation/copies?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to search copies');
  }
  return json.data.map((c: any) => ({
    ...c,
    dueDate: c.dueDate ? new Date(c.dueDate) : null,
    borrowedAt: c.borrowedAt ? new Date(c.borrowedAt) : null,
  }));
}

export async function checkoutCopyApi(data: CheckoutParams, token: string | null) {
  const url = `${API_URL}/circulation/checkout`;
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
    const err = new Error(json?.error?.message || 'Checkout failed');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export async function checkinCopyApi(data: CheckinParams, token: string | null) {
  const url = `${API_URL}/circulation/checkin`;
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
    const err = new Error(json?.error?.message || 'Checkin failed');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export function useStudentSearch(query: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['students', query],
    queryFn: async () => {
      const token = await getToken();
      return fetchStudentsApi(query, token);
    },
    enabled: Boolean(query && query.trim().length > 0),
  });
}

export function useCopySearch(query: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['copies', query],
    queryFn: async () => {
      const token = await getToken();
      return fetchCopiesApi(query, token);
    },
    enabled: Boolean(query && query.trim().length > 0),
  });
}

export function useCheckoutCopy() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckoutParams) => {
      const token = await getToken();
      return checkoutCopyApi(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useCheckinCopy() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckinParams) => {
      const token = await getToken();
      return checkinCopyApi(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
