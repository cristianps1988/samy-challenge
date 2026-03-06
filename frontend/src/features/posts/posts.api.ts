import { get, post, put, del } from "@/lib/api-client";
import type { Post, PostWithAuthor, PaginatedResponse } from "@/types";

interface CreatePostData {
  title: string;
  content: string;
  authorId: number;
}

interface UpdatePostData {
  title?: string;
  content?: string;
}

export async function fetchPosts(
  page = 1,
  limit = 10
): Promise<PaginatedResponse<PostWithAuthor>> {
  const response = await get<{ data: PostWithAuthor[]; meta: PaginatedResponse<PostWithAuthor>["meta"] }>(
    `/posts?page=${page}&limit=${limit}`
  );
  return {
    data: response.data,
    meta: response.meta,
  };
}

export async function fetchPost(id: number): Promise<PostWithAuthor> {
  const response = await get<{ data: PostWithAuthor }>(`/posts/${id}`);
  return response.data;
}

export async function createPost(data: CreatePostData): Promise<Post> {
  const response = await post<{ data: Post }>(`/posts`, data);
  return response.data;
}

export async function updatePost(id: number, data: UpdatePostData): Promise<Post> {
  const response = await put<{ data: Post }>(`/posts/${id}`, data);
  return response.data;
}

export async function deletePost(id: number): Promise<void> {
  await del<void>(`/posts/${id}`);
}
