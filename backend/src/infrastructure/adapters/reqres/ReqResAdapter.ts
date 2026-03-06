import { ExternalUserProvider, ExternalUser } from "@application/ports/providers/external-user.provider.port.js";
import { env } from "../../config/env.js";
import { reqresUsersResponseSchema, reqresUserResponseSchema, reqresLoginResponseSchema } from "./reqres.schemas.js";

export class ReqResAdapter implements ExternalUserProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = env.REQRES_BASE_URL;
    this.apiKey = env.REQRES_API_KEY;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  async fetchUsers(page: number): Promise<{
    users: ExternalUser[];
    total: number;
    totalPages: number;
  }> {
    const response = await fetch(`${this.baseUrl}/users?page=${page}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const rawData = await response.json();
    const data = reqresUsersResponseSchema.parse(rawData);

    const users: ExternalUser[] = data.data.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
    }));

    return {
      users,
      total: data.total,
      totalPages: data.total_pages,
    };
  }

  async fetchById(id: number): Promise<ExternalUser | null> {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    const rawData = await response.json();
    const data = reqresUserResponseSchema.parse(rawData);

    if (!data.data) {
      return null;
    }

    return {
      id: data.data.id,
      email: data.data.email,
      firstName: data.data.first_name,
      lastName: data.data.last_name,
      avatar: data.data.avatar,
    };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const rawData = await response.json();
    const data = reqresLoginResponseSchema.parse(rawData);

    return data;
  }
}
