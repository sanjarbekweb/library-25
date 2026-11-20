import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type HistoryAction =
  | 'CHECKOUT'
  | 'CHECKIN'
  | 'STATUS_CHANGE'
  | 'CONDITION_CHANGE'
  | 'RESERVED'
  | 'HOLD_RELEASED'
  | 'RETIRED'
  | 'DAMAGED'
  | 'MAINTENANCE'
  | 'INITIAL_CATALOGED';

export type CopyCondition = 'MINT' | 'GOOD' | 'FAIR' | 'DAMAGED';
export type CopyStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'MAINTENANCE' | 'LOST';
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export interface BookHistoryItem {
  id: string;
  bookCopyId: string;
  action: HistoryAction;
  actorId: string | null;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  previousState: string | null;
  newState: string | null;
  notes: string | null;
  createdAt: string | Date;
}

export interface CopyTraceabilityDetail {
  id: string;
  barcode: string;
  condition: CopyCondition;
  status: CopyStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    category: string;
    coverImageUrl: string | null;
  };
  currentHolder: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  activeLoan: {
    id: string;
    borrowedAt: string | Date;
    dueDate: string | Date;
    assistantName: string;
  } | null;
  history: BookHistoryItem[];
}

export interface StudentLoanItem {
  id: string;
  loanId: string;
  copyId: string;
  copyBarcode: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl: string | null;
  category: string;
  condition: CopyCondition;
  borrowedAt: string | Date;
  dueDate: string | Date;
  returnedAt: string | Date | null;
  status: LoanStatus;
  assistantName: string;
  daysRemaining: number;
  isOverdue: boolean;
  daysOverdue: number;
  feedback?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

export interface StudentLoansOverview {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  stats: {
    activeLoansCount: number;
    overdueLoansCount: number;
    returnedLoansCount: number;
    totalLoansCount: number;
  };
  activeLoans: StudentLoanItem[];
  historicalLoans: StudentLoanItem[];
}

export async function fetchMyLoansApi(token: string | null): Promise<StudentLoansOverview> {
  const url = `${API_URL}/history/my-loans`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch personal loan history');
  }
  return json.data;
}

export async function fetchCopyTraceabilityApi(
  barcode: string,
  token: string | null
): Promise<CopyTraceabilityDetail> {
  const url = `${API_URL}/history/traceability/${encodeURIComponent(barcode)}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || `Failed to fetch copy traceability for barcode ${barcode}`);
  }
  return json.data;
}

export async function fetchCopyHistoryApi(
  copyId: string,
  token: string | null
): Promise<BookHistoryItem[]> {
  const url = `${API_URL}/history/copy/${encodeURIComponent(copyId)}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch copy history');
  }
  return json.data;
}

export async function fetchAllAuditLogsApi(
  filter: { copyId?: string; actorId?: string; action?: string; limit?: number },
  token: string | null
): Promise<BookHistoryItem[]> {
  const searchParams = new URLSearchParams();
  if (filter.copyId) searchParams.append('copyId', filter.copyId);
  if (filter.actorId) searchParams.append('actorId', filter.actorId);
  if (filter.action) searchParams.append('action', filter.action);
  if (filter.limit) searchParams.append('limit', filter.limit.toString());

  const url = `${API_URL}/history/audits?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch audit logs');
  }
  return json.data;
}

export function useMyLoans() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['history', 'my-loans'],
    queryFn: async () => {
      const token = await getToken();
      return fetchMyLoansApi(token);
    },
  });
}

export function useCopyTraceability(barcode: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['history', 'traceability', barcode],
    queryFn: async () => {
      const token = await getToken();
      return fetchCopyTraceabilityApi(barcode, token);
    },
    enabled: Boolean(barcode && barcode.trim()),
  });
}

export function useCopyHistory(copyId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['history', 'copy', copyId],
    queryFn: async () => {
      const token = await getToken();
      return fetchCopyHistoryApi(copyId, token);
    },
    enabled: Boolean(copyId),
  });
}

export function useAuditLogs(filter: { copyId?: string; actorId?: string; action?: string; limit?: number } = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['history', 'audits', filter],
    queryFn: async () => {
      const token = await getToken();
      return fetchAllAuditLogsApi(filter, token);
    },
  });
}
