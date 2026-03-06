import { cookies } from "next/headers";
import { ExternalUser, PostWithAuthor, PaginatedResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function getHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T | null> {
  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.error?.message || error.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function serverGet<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: await getHeaders(),
    cache: "no-store",
  });
  return handleResponse<T>(response);
}

export async function serverFetchPosts(
  page = 1,
  limit = 10
): Promise<PaginatedResponse<PostWithAuthor>> {
  const response = await serverGet<{ data: PostWithAuthor[]; meta: PaginatedResponse<PostWithAuthor>["meta"] }>(
    `/posts?page=${page}&limit=${limit}`
  );
  return {
    data: response?.data ?? [],
    meta: response?.meta ?? { page, limit, total: 0, totalPages: 0 },
  };
}

export async function serverFetchPost(id: number): Promise<PostWithAuthor | null> {
  const response = await serverGet<{ data: PostWithAuthor }>(`/posts/${id}`);
  return response?.data ?? null;
}

export async function serverFetchSavedUsers() {
  const response = await serverGet<{ data: Array<{ id: number; externalId: number }> }>(
    "/users/saved"
  );
  return response?.data ?? [];
}

export async function serverFetchReqResUser(id: number): Promise<ExternalUser> {
  const response = await serverGet<{ data: ExternalUser }>(`/users/external/${id}`);

  if (!response?.data) {
    throw new Error("User not found");
  }

  return response.data;
}
