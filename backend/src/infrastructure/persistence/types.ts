export interface KnexUser {
  id: number;
  external_id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface KnexPost {
  id: number;
  title: string;
  content: string;
  author_id: number;
  created_at: Date;
  updated_at: Date;
}
