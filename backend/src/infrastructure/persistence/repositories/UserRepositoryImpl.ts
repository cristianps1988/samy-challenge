import type { Knex } from 'knex';
import { UserRepository } from '@application/ports/repositories/user.repository.port.js';
import { User } from '@core/entities/user.entity.js';

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly knex: Knex) {}

  async findAll(): Promise<User[]> {
    const users = await this.knex('users')
      .select('*')
      .orderBy('created_at', 'desc');

    return users.map(this.toDomain);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.knex('users')
      .where({ id })
      .first();

    return user ? this.toDomain(user) : null;
  }

  async findByExternalId(externalId: number): Promise<User | null> {
    const user = await this.knex('users')
      .where({ external_id: externalId })
      .first();

    return user ? this.toDomain(user) : null;
  }

  async save(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await this.knex('users')
      .insert({
        external_id: data.externalId,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        avatar: data.avatar,
      })
      .returning('*');

    return this.toDomain(user);
  }

  async delete(id: number): Promise<void> {
    await this.knex('users')
      .where({ id })
      .del();
  }

  private toDomain(knexUser: any): User {
    return {
      id: knexUser.id,
      externalId: knexUser.external_id,
      email: knexUser.email,
      firstName: knexUser.first_name,
      lastName: knexUser.last_name,
      avatar: knexUser.avatar,
      createdAt: knexUser.created_at,
      updatedAt: knexUser.updated_at,
    };
  }
}
