export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  meta: Record<string, unknown>;
}

export class ApiError extends Error {
  constructor(public code: string, message: string, public meta: Record<string, unknown> = {}) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<{ data: T; meta: Record<string, unknown> }> {
  const res = await fetch(path, {
    ...init,
    credentials: "include", // session cookie
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  const body: ApiResponse<T> = await res.json();

  if (!body.success || !res.ok) {
    throw new ApiError(body.error?.code ?? "UNKNOWN", body.error?.message ?? "Something went wrong.", body.meta);
  }

  return { data: body.data as T, meta: body.meta };
}
