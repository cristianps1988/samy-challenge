import type { Knex } from 'knex';
import { PostRepository } from '@application/ports/repositories/post.repository.port.js';
import { Post, PostWithAuthor } from '@core/entities/post.entity.js';

export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly knex: Knex) {}

  async findAll(options: { page: number; limit: number }): Promise<PostWithAuthor[]> {
    const posts = await this.buildPostWithAuthorQuery()
      .orderBy('posts.created_at', 'desc')
      .offset((options.page - 1) * options.limit)
      .limit(options.limit);

    return posts.map(this.toDomainWithAuthor);
  }

  async findById(id: number): Promise<PostWithAuthor | null> {
    const post = await this.buildPostWithAuthorQuery()
      .where('posts.id', id)
      .first();

    if (!post) {
      return null;
    }

    return this.toDomainWithAuthor(post);
  }

  private buildPostWithAuthorQuery() {
    return this.knex('posts')
      .join('users', 'posts.author_id', 'users.id')
      .select({
        ...this.postFields,
        ...this.authorFields,
      });
  }

  private postFields = {
    id: 'posts.id',
    title: 'posts.title',
    content: 'posts.content',
    authorId: 'posts.author_id',
    createdAt: 'posts.created_at',
    updatedAt: 'posts.updated_at',
  };

  private authorFields = {
    authorId: 'users.id',
    authorExternalId: 'users.external_id',
    authorEmail: 'users.email',
    authorFirstName: 'users.first_name',
    authorLastName: 'users.last_name',
    authorAvatar: 'users.avatar',
    authorCreatedAt: 'users.created_at',
    authorUpdatedAt: 'users.updated_at',
  };

  async create(data: { title: string; content: string; authorId: number }): Promise<Post> {
    const [post] = await this.knex('posts')
      .insert({
        title: data.title,
        content: data.content,
        author_id: data.authorId,
      })
      .returning('*');

    return this.toDomain(post);
  }

  async update(id: number, data: Partial<{ title: string; content: string }>): Promise<Post> {
    const [post] = await this.knex('posts')
      .where({ id })
      .update({
        title: data.title,
        content: data.content,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.toDomain(post);
  }

  async delete(id: number): Promise<void> {
    await this.knex('posts')
      .where({ id })
      .del();
  }

  async count(): Promise<number> {
    const [{ count }] = await this.knex('posts')
      .count('* as count');

    return Number(count);
  }

  private toDomain(knexPost: any): Post {
    return {
      id: knexPost.id,
      title: knexPost.title,
      content: knexPost.content,
      authorId: knexPost.author_id,
      createdAt: knexPost.created_at,
      updatedAt: knexPost.updated_at,
    };
  }

  private toDomainWithAuthor(knexPost: any): PostWithAuthor {
    return {
      id: knexPost.id,
      title: knexPost.title,
      content: knexPost.content,
      authorId: knexPost.authorId,
      createdAt: knexPost.createdAt,
      updatedAt: knexPost.updatedAt,
      author: {
        id: knexPost.authorId,
        externalId: knexPost.authorExternalId,
        email: knexPost.authorEmail,
        firstName: knexPost.authorFirstName,
        lastName: knexPost.authorLastName,
        avatar: knexPost.authorAvatar,
        createdAt: knexPost.authorCreatedAt,
        updatedAt: knexPost.authorUpdatedAt,
      },
    };
  }
}
