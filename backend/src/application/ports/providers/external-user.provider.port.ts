export interface ExternalUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface ExternalUserProvider {
  fetchUsers(page: number): Promise<{
    users: ExternalUser[];
    total: number;
    totalPages: number;
  }>;

  fetchById(id: number): Promise<ExternalUser | null>;

  login(email: string, password: string): Promise<{ token: string }>;
}
