const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

let cachedToken: string | null = null;

function getToken(): string | null {
  if (cachedToken !== null) {
    return cachedToken;
  }

  if (typeof document === "undefined") {
    return null;
  }

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  cachedToken = token ?? null;
  return cachedToken;
}

export function clearTokenCache(): void {
  cachedToken = null;
}

if (typeof window !== "undefined") {
  (window as unknown as { clearTokenCache?: () => void }).clearTokenCache = clearTokenCache;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    if (response.status === 401) {
      clearTokenCache();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }
    throw new Error(error.error?.message || error.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function getHeaders(): HeadersInit {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse<T>(response);
}

export async function post<T>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function put<T>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}

export async function del<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse<T>(response);
}
