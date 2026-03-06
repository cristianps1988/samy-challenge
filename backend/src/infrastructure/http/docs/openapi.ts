import { OpenAPIV3 } from 'openapi-types';

const bearerAuth: OpenAPIV3.SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
};

const UserSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    externalId: { type: 'integer', example: 3 },
    email: { type: 'string', format: 'email', example: 'emma.wong@reqres.in' },
    firstName: { type: 'string', example: 'Emma' },
    lastName: { type: 'string', example: 'Wong' },
    avatar: { type: 'string', format: 'uri', example: 'https://reqres.in/img/faces/3-image.jpg' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const ExternalUserSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 3 },
    email: { type: 'string', format: 'email', example: 'emma.wong@reqres.in' },
    firstName: { type: 'string', example: 'Emma' },
    lastName: { type: 'string', example: 'Wong' },
    avatar: { type: 'string', format: 'uri', example: 'https://reqres.in/img/faces/3-image.jpg' },
  },
};

const PostSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    title: { type: 'string', example: 'My first post' },
    content: { type: 'string', example: 'This is the content of the post.' },
    authorId: { type: 'integer', example: 1 },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const PostWithAuthorSchema: OpenAPIV3.SchemaObject = {
  allOf: [
    { $ref: '#/components/schemas/Post' },
    {
      type: 'object',
      properties: {
        author: { $ref: '#/components/schemas/User' },
      },
    },
  ],
};

const PaginationMetaSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 10 },
    total: { type: 'integer', example: 42 },
    totalPages: { type: 'integer', example: 5 },
  },
};

const ErrorResponseSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Resource not found' },
        details: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  },
};

const idPathParam: OpenAPIV3.ParameterObject = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
};

const unauthorizedResponse: OpenAPIV3.ResponseObject = {
  description: 'Unauthorized — missing or invalid JWT token',
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
  },
};

const notFoundResponse: OpenAPIV3.ResponseObject = {
  description: 'Resource not found',
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
  },
};

const badRequestResponse: OpenAPIV3.ResponseObject = {
  description: 'Validation error',
  content: {
    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
  },
};

const spec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'User & Posts Management Portal API',
    version: '1.0.0',
    description:
      'REST API for managing users (synced from ReqRes external API) and posts. Auth is JWT-based.',
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local development' },
    {
      url: 'https://ejkct87811.execute-api.us-east-1.amazonaws.com',
      description: 'Production (AWS Lambda)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth,
    },
    schemas: {
      User: UserSchema,
      ExternalUser: ExternalUserSchema,
      Post: PostSchema,
      PostWithAuthor: PostWithAuthorSchema,
      PaginationMeta: PaginationMetaSchema,
      ErrorResponse: ErrorResponseSchema,
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with ReqRes credentials',
        description:
          'Validates credentials against the ReqRes external API and returns a JWT token. Test credentials: `eve.holt@reqres.in` / `cityslicka`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'eve.holt@reqres.in',
                  },
                  password: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 20,
                    example: 'cityslicka',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        token: {
                          type: 'string',
                          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': badRequestResponse,
          '401': unauthorizedResponse,
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users from ReqRes (external)',
        description: 'Fetches paginated users directly from the ReqRes external API.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'List of external users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/ExternalUser' },
                        },
                        total: { type: 'integer', example: 12 },
                        totalPages: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': unauthorizedResponse,
        },
      },
    },
    '/api/users/external/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a single user from ReqRes (external)',
        security: [{ bearerAuth: [] }],
        parameters: [{ ...idPathParam, description: 'ReqRes user ID' }],
        responses: {
          '200': {
            description: 'External user data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ExternalUser' },
                  },
                },
              },
            },
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
    },
    '/api/users/import/{id}': {
      post: {
        tags: ['Users'],
        summary: 'Import a ReqRes user into the local database',
        description: 'Fetches the user from ReqRes by ID and saves it locally. Returns 409 if already imported.',
        security: [{ bearerAuth: [] }],
        parameters: [{ ...idPathParam, description: 'ReqRes user ID to import' }],
        responses: {
          '201': {
            description: 'User imported successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
          '409': {
            description: 'User already imported',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/users/saved': {
      get: {
        tags: ['Users'],
        summary: 'List locally saved users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of saved users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
          '401': unauthorizedResponse,
        },
      },
    },
    '/api/users/saved/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a locally saved user by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ ...idPathParam, description: 'Local user ID' }],
        responses: {
          '200': {
            description: 'Saved user data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a locally saved user',
        security: [{ bearerAuth: [] }],
        parameters: [{ ...idPathParam, description: 'Local user ID' }],
        responses: {
          '204': { description: 'User deleted successfully' },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
    },
    '/api/posts': {
      get: {
        tags: ['Posts'],
        summary: 'List posts (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated list of posts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Post' },
                    },
                    meta: { $ref: '#/components/schemas/PaginationMeta' },
                  },
                },
              },
            },
          },
          '401': unauthorizedResponse,
        },
      },
      post: {
        tags: ['Posts'],
        summary: 'Create a new post',
        description: 'The `authorId` must correspond to a locally saved user.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content', 'authorId'],
                properties: {
                  title: { type: 'string', minLength: 3, maxLength: 255, example: 'My first post' },
                  content: {
                    type: 'string',
                    minLength: 10,
                    maxLength: 10000,
                    example: 'This is the full content of my post.',
                  },
                  authorId: { type: 'integer', minimum: 1, example: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Post created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Post' },
                  },
                },
              },
            },
          },
          '400': badRequestResponse,
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
    },
    '/api/posts/{id}': {
      get: {
        tags: ['Posts'],
        summary: 'Get a post by ID (includes author)',
        security: [{ bearerAuth: [] }],
        parameters: [idPathParam],
        responses: {
          '200': {
            description: 'Post with author details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/PostWithAuthor' },
                  },
                },
              },
            },
          },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
      put: {
        tags: ['Posts'],
        summary: 'Update a post',
        description: 'At least one of `title` or `content` must be provided.',
        security: [{ bearerAuth: [] }],
        parameters: [idPathParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 3, maxLength: 255, example: 'Updated title' },
                  content: { type: 'string', minLength: 10, maxLength: 10000, example: 'Updated content.' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Post updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Post' },
                  },
                },
              },
            },
          },
          '400': badRequestResponse,
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Delete a post',
        security: [{ bearerAuth: [] }],
        parameters: [idPathParam],
        responses: {
          '204': { description: 'Post deleted successfully' },
          '401': unauthorizedResponse,
          '404': notFoundResponse,
        },
      },
    },
  },
};

export { spec };
