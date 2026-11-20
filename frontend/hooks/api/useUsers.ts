import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { UserRole } from '@prisma/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface AdminUserQueryParams {
  query?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminUserItem {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: {
    loans: number;
    reservations: number;
    assistedLoans: number;
  };
}

export interface AdminUsersResult {
  users: AdminUserItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalCount: number;
    studentCount: number;
    assistantCount: number;
    adminCount: number;
    inactiveCount: number;
  };
}

export async function fetchAdminUsersApi(
  params: AdminUserQueryParams,
  token: string | null
): Promise<AdminUsersResult> {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.append('query', params.query);
  if (params.role && params.role !== 'ALL') searchParams.append('role', params.role);
  if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_URL}/users?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch users');
  }
  return json.data;
}

export async function fetchCurrentUserApi(token: string | null) {
  const url = `${API_URL}/users/me`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Failed to fetch current user');
  }
  return json.data;
}

export async function updateUserRoleApi(
  targetUserId: string,
  role: UserRole,
  token: string | null,
  idempotencyKey?: string
) {
  const url = `${API_URL}/users/${targetUserId}/role`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ role, idempotencyKey }),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Failed to update user role');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export async function toggleUserStatusApi(
  targetUserId: string,
  isActive: boolean,
  token: string | null,
  idempotencyKey?: string
) {
  const url = `${API_URL}/users/${targetUserId}/status`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ isActive, idempotencyKey }),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Failed to update user status');
    (err as any).code = json?.error?.code;
    throw err;
  }
  return json;
}

export function useAdminUsers(params: AdminUserQueryParams) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const token = await getToken();
      return fetchAdminUsersApi(params, token);
    },
  });
}

export function useCurrentUser() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const token = await getToken();
      return fetchCurrentUserApi(token);
    },
  });
}

export function useUpdateUserRole() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      role,
      idempotencyKey,
    }: {
      targetUserId: string;
      role: UserRole;
      idempotencyKey?: string;
    }) => {
      const token = await getToken();
      return updateUserRoleApi(targetUserId, role, token, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useToggleUserStatus() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      isActive,
      idempotencyKey,
    }: {
      targetUserId: string;
      isActive: boolean;
      idempotencyKey?: string;
    }) => {
      const token = await getToken();
      return toggleUserStatusApi(targetUserId, isActive, token, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
