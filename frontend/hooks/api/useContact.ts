import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type ContactCategory =
  | 'FEEDBACK'
  | 'FEATURE_REQUEST'
  | 'BUG_REPORT'
  | 'GENERAL_INQUIRY';

export interface ContactFormInput {
  name?: string;
  emailOrHandle: string;
  category?: ContactCategory;
  message: string;
  honeypot?: string;
}

export async function submitContactApi(
  data: ContactFormInput,
  token?: string | null
): Promise<{ success: boolean; messageId?: number }> {
  const url = `${API_URL}/contact`;
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
    throw new Error(json?.error?.message || 'Failed to submit contact message');
  }

  return json.data;
}

export function useSubmitContact() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (data: ContactFormInput) => {
      const token = await getToken();
      return submitContactApi(data, token);
    },
  });
}
