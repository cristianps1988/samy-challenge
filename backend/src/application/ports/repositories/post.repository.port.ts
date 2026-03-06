import { Post, PostWithAuthor } from "@core/entities/post.entity.js";

export interface PostRepository {
  findAll(options: { page: number; limit: number }): Promise<PostWithAuthor[]>;

  findById(id: number): Promise<PostWithAuthor | null>;

  create(data: { title: string; content: string; authorId: number }): Promise<Post>;

  update(id: number, data: Partial<{ title: string; content: string }>): Promise<Post>;

  delete(id: number): Promise<void>;

  count(): Promise<number>;
}
