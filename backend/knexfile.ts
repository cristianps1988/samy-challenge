import type { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/user_posts_portal',
    migrations: {
      directory: './src/infrastructure/persistence/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/infrastructure/persistence/seeds',
      extension: 'ts',
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/infrastructure/persistence/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/infrastructure/persistence/seeds',
      extension: 'ts',
    },
  },
};

export default config;
