type FetcherOptions = RequestInit & {
  baseUrl?: string;
  skipAuth?: boolean;
};

type RequestInterceptor = (
  url: string,
  options: RequestInit,
) => Promise<{ url: string; options: RequestInit }> | { url: string; options: RequestInit };
type ResponseInterceptor = (response: Response, url: string) => Promise<Response> | Response;
type ErrorInterceptor = (error: Error, url: string, options: RequestInit) => Promise<never> | never;

class FetchInterceptor {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
    return this.requestInterceptors.length - 1;
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
    return this.responseInterceptors.length - 1;
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
    return this.errorInterceptors.length - 1;
  }

  removeRequestInterceptor(index: number) {
    if (index >= 0 && index < this.requestInterceptors.length) {
      this.requestInterceptors.splice(index, 1);
    }
  }

  removeResponseInterceptor(index: number) {
    if (index >= 0 && index < this.responseInterceptors.length) {
      this.responseInterceptors.splice(index, 1);
    }
  }

  removeErrorInterceptor(index: number) {
    if (index >= 0 && index < this.errorInterceptors.length) {
      this.errorInterceptors.splice(index, 1);
    }
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      // Apply request interceptors
      let finalUrl = url;
      let finalOptions = { ...options };

      for (const interceptor of this.requestInterceptors) {
        const result = await interceptor(finalUrl, finalOptions);
        finalUrl = result.url;
        finalOptions = result.options;
      }

      // Make the actual request
      let response = await fetch(finalUrl, finalOptions);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response, finalUrl);
      }

      return response;
    } catch (error) {
      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        await interceptor(error as Error, url, options);
      }
      throw error;
    }
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const fetchInterceptor = new FetchInterceptor();

// Add default request interceptor for authentication and base URL
fetchInterceptor.addRequestInterceptor((url, options) => {
  const { baseUrl = BASE_URL, skipAuth, headers, ...rest } = options as FetcherOptions;

  const token = localStorage.getItem('token');
  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  } as Record<string, string>;

  if (token && !skipAuth) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  return {
    url: baseUrl + url,
    options: {
      headers: finalHeaders,
      ...rest,
    },
  };
});

// Add default error handling interceptor
fetchInterceptor.addErrorInterceptor(async (error, url) => {
  console.error(`Request failed for ${url}:`, error);
  throw error;
});

export async function fetcher<T = unknown>(url: string, options: FetcherOptions = {}): Promise<T> {
  const res = await fetchInterceptor.fetch(url, options);

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
