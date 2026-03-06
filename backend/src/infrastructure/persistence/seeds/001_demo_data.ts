import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();
  await knex('posts').del();

  const users = await knex('users').insert([
    {
      external_id: 1,
      email: 'george.bluth@reqres.in',
      first_name: 'George',
      last_name: 'Bluth',
      avatar: 'https://reqres.in/img/faces/1-image.jpg',
    },
    {
      external_id: 2,
      email: 'janet.weaver@reqres.in',
      first_name: 'Janet',
      last_name: 'Weaver',
      avatar: 'https://reqres.in/img/faces/2-image.jpg',
    },
    {
      external_id: 3,
      email: 'emma.wong@reqres.in',
      first_name: 'Emma',
      last_name: 'Wong',
      avatar: 'https://reqres.in/img/faces/3-image.jpg',
    },
  ]).returning('*');

  await knex('posts').insert([
    {
      title: 'Getting Started with TypeScript',
      content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds optional static typing and class-based object-oriented programming to the language.',
      author_id: users[0].id,
    },
    {
      title: 'Understanding Clean Architecture',
      content: 'Clean Architecture is a software design philosophy that emphasizes the separation of concerns and the independence of high-level policies from low-level details.',
      author_id: users[0].id,
    },
    {
      title: 'Why I Love Node.js',
      content: 'Node.js allows developers to use JavaScript on the server-side, enabling full-stack JavaScript development. Its non-blocking I/O model makes it efficient for real-time applications.',
      author_id: users[1].id,
    },
    {
      title: 'Introduction to React Hooks',
      content: 'React Hooks are functions that let you hook into React state and lifecycle features from function components. They were introduced in React 16.8.',
      author_id: users[2].id,
    },
    {
      title: 'RESTful API Design Best Practices',
      content: 'RESTful APIs should follow principles like statelessness, cacheability, and a uniform interface. Proper use of HTTP methods and status codes is crucial.',
      author_id: users[1].id,
    },
    {
      title: 'Database Migrations Explained',
      content: 'Migrations are a way to manage changes to your database schema over time. They allow you to version control your database structure and apply changes in a consistent manner.',
      author_id: users[2].id,
    },
  ]);
}
