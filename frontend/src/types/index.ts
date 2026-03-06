export interface User {
  id: number;
  externalId: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithAuthor extends Post {
  author: User;
}

export interface ApiError {
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
