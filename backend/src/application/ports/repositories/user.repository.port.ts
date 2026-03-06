import { User } from "@core/entities/user.entity.js";

export interface UserRepository {
  findAll(): Promise<User[]>;

  findById(id: number): Promise<User | null>;

  findByExternalId(externalId: number): Promise<User | null>;

  save(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;

  delete(id: number): Promise<void>;
}
