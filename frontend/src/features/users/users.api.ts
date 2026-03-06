import { get, post, del } from "@/lib/api-client";
import type { User, PostWithAuthor } from "@/types";

export async function fetchReqResUsers(page = 1) {
  const response = await get<{ data: { users: Array<{ id: number; email: string; firstName: string; lastName: string; avatar: string }>; total: number; totalPages: number } }>(
    `/users?page=${page}`
  );
  return {
    users: response.data.users.map((user) => ({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, avatar: user.avatar })),
    total: response.data.total,
    page,
    totalPages: response.data.totalPages,
  };
}

export async function importUser(externalId: number): Promise<User> {
  return await post<User>(`/users/import/${externalId}`);
}

export async function fetchSavedUsers(): Promise<User[]> {
  const response = await get<{ data: User[] }>("/users/saved");
  return response.data;
}

export async function fetchSavedUser(id: number): Promise<User> {
  const response = await get<{ data: User }>(`/users/saved/${id}`);
  return response.data;
}

export async function deleteSavedUser(id: number): Promise<void> {
  await del<void>(`/users/saved/${id}`);
}

export async function fetchUserPosts(authorId: number): Promise<PostWithAuthor[]> {
  const response = await get<{ data: PostWithAuthor[]; meta: { total: number } }>(
    `/posts?limit=100`
  );
  return response.data.filter((post) => post.authorId === authorId);
}
