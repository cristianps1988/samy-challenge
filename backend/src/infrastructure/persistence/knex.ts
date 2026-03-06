import knex, { type Knex } from 'knex';

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/user_posts_portal',
};

export const knexInstance = knex(knexConfig);
