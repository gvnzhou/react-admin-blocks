type FetcherOptions = RequestInit & {
  baseUrl?: string;
  skipAuth?: boolean;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function fetcher<T = unknown>(url: string, options: FetcherOptions = {}): Promise<T> {
  const { baseUrl = BASE_URL, skipAuth, headers, ...rest } = options;

  // add a token
  const token = localStorage.getItem('token');
  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  } as Record<string, string>;
  if (token && !skipAuth) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(baseUrl + url, {
    headers: finalHeaders,
    ...rest,
  });

  // handle errors
  if (!res.ok) {
    let errorMsg = 'Request failed';
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // intentionally ignore error
    }
    throw new Error(errorMsg);
  }

  // parse JSON
  if (res.status === 204) return null as T; // No Content
  return res.json() as Promise<T>;
}
