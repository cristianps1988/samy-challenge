"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPosts, fetchPost, createPost, updatePost, deletePost } from "./posts.api";
import type { PaginatedResponse, Post, PostWithAuthor } from "@/types";

interface CreatePostData {
  title: string;
  content: string;
  authorId: number;
}

interface UpdatePostData {
  title?: string;
  content?: string;
}

export function usePosts(page = 1, limit = 10, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["posts", page, limit],
    queryFn: () => fetchPosts(page, limit),
    enabled: options?.enabled ?? true,
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
    enabled: id > 0,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => createPost(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts", Number(variables.authorId)] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostData }) => updatePost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });
}
