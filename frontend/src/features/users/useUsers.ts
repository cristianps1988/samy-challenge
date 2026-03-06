"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types";
import {
  fetchReqResUsers,
  importUser,
  fetchSavedUsers,
  deleteSavedUser,
  fetchUserPosts,
} from "./users.api";

interface ReqResUsersResponse {
  users: Array<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export function useReqResUsers(page = 1) {
  return useQuery({
    queryKey: ["reqres-users", page],
    queryFn: () => fetchReqResUsers(page),
    staleTime: 30000,
  });
}

export function useSavedUsers(initialData?: User[]) {
  return useQuery({
    queryKey: ["saved-users"],
    queryFn: fetchSavedUsers,
    initialData,
    staleTime: 60000,
  });
}

export function useImportUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-users"] });
    },
  });
}

export function useDeleteSavedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSavedUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-users"] });
    },
  });
}

export function useUserPosts(authorId: number) {
  return useQuery({
    queryKey: ["user-posts", authorId],
    queryFn: () => fetchUserPosts(authorId),
    enabled: authorId > 0,
  });
}
