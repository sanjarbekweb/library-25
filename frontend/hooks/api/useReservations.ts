import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface CreateReservationDto {
  bookId: string;
  copyId?: string;
  holdDays?: number;
  holdUntilDate?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
}

export interface CancelReservationDto {
  reservationId: string;
  expectedVersion?: number;
  idempotencyKey?: string;
}

export interface StudentReservationItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl: string | null;
  category: string;
  copyBarcode: string | null;
  status: "PENDING" | "FULFILLED" | "CANCELLED" | "EXPIRED";
  expiresAt: string | Date;
  createdAt: string | Date;
}

export async function fetchMyReservationsApi(token: string | null): Promise<StudentReservationItem[]> {
  const url = `${API_URL}/reservations/my`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch student reservations');
  }
  return json.data;
}

export async function fetchReservationForBookApi(bookId: string, token: string | null) {
  if (!token) return null;
  const url = `${API_URL}/reservations/book/${bookId}`;
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

export async function requestReservationApi(data: CreateReservationDto, token: string | null) {
  const url = `${API_URL}/reservations`;
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
    const err = new Error(json?.error?.message || 'Reservation failed');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export async function cancelReservationApi(data: CancelReservationDto, token: string | null) {
  const url = `${API_URL}/reservations/${data.reservationId}/cancel`;
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
    const err = new Error(json?.error?.message || 'Cancellation failed');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export function useMyReservations() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['reservations', 'my'],
    queryFn: async () => {
      const token = await getToken();
      return fetchMyReservationsApi(token);
    },
  });
}

export function useRequestReservation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReservationDto) => {
      const token = await getToken();
      return requestReservationApi(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useCancelReservation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CancelReservationDto) => {
      const token = await getToken();
      return cancelReservationApi(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
