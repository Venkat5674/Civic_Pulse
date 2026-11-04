const swaggerJsDoc = {
  openapi: '3.0.0',
  info: {
    title: 'CivicPulse Platform REST API Specification',
    version: '1.0.0',
    description:
      'Production-grade RESTful API documentation for CivicPulse: Municipal Issue Reporting, Priority Scoring Engine, Duplicate Detection, Real-time Socket.IO Dispatches, and City Administration Portal.',
    contact: {
      name: 'CivicPulse Engineering Team',
      email: 'engineering@civicpulse.org',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token obtained from POST /api/auth/login or /api/auth/register',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-12345' },
          name: { type: 'string', example: 'Jane Citizen' },
          email: { type: 'string', example: 'citizen@civicpulse.org' },
          role: { type: 'string', enum: ['CITIZEN', 'ADMIN', 'GUEST'], example: 'CITIZEN' },
          avatarUrl: { type: 'string', example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Issue: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'iss-98765' },
          userId: { type: 'string' },
          userName: { type: 'string', example: 'Jane Citizen' },
          categoryId: { type: 'string', example: 'cat-1' },
          categoryName: { type: 'string', example: 'Roads & Potholes' },
          title: { type: 'string', example: 'Deep pothole on Main St' },
          description: { type: 'string', example: 'Hazardous pothole causing tire damage' },
          status: { type: 'string', enum: ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'], example: 'OPEN' },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
          priorityScore: { type: 'integer', example: 78 },
          latitude: { type: 'number', example: 40.7128 },
          longitude: { type: 'number', example: -74.006 },
          address: { type: 'string', example: '5th Ave & Main St' },
          confirmationsCount: { type: 'integer', example: 12 },
          userConfirmed: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          issueId: { type: 'string' },
          userId: { type: 'string' },
          userName: { type: 'string' },
          body: { type: 'string', example: 'Municipal crew dispatched to repair this.' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success message' },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        tags: ['System'],
        responses: {
          200: { description: 'Server operational status' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Citizen' },
                  email: { type: 'string', example: 'jane@example.com' },
                  password: { type: 'string', example: 'password123' },
                  role: { type: 'string', enum: ['CITIZEN', 'ADMIN'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully with JWT token' },
          400: { description: 'Validation error or account exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user and obtain JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'citizen@civicpulse.org' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh access JWT token',
        tags: ['Authentication'],
        responses: {
          200: { description: 'Token refreshed successfully' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        summary: 'Request password reset instructions',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', example: 'citizen@civicpulse.org' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Instructions dispatched' } },
      },
    },
    '/auth/reset-password': {
      post: {
        summary: 'Reset account password with token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string', example: 'reset-token-123' },
                  newPassword: { type: 'string', example: 'newPassword123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password reset successfully' } },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        tags: ['Authentication'],
        responses: { 200: { description: 'Current user profile' } },
      },
    },
    '/issues': {
      get: {
        summary: 'List civic issue reports with pagination, filtering & sorting',
        tags: ['Issues'],
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'status', schema: { type: 'string' } },
          { in: 'query', name: 'severity', schema: { type: 'string' } },
          { in: 'query', name: 'sort', schema: { type: 'string', enum: ['newest', 'priority', 'confirmations'] } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Paginated list of issues' } },
      },
      post: {
        summary: 'Submit a new civic issue report',
        tags: ['Issues'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'categoryId', 'latitude', 'longitude'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  categoryId: { type: 'string' },
                  severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  address: { type: 'string' },
                  images: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Issue report submitted successfully' } },
      },
    },
    '/issues/nearby': {
      get: {
        summary: 'Find nearby civic issues within geospatial radius',
        tags: ['Issues'],
        parameters: [
          { in: 'query', name: 'lat', required: true, schema: { type: 'number' } },
          { in: 'query', name: 'lng', required: true, schema: { type: 'number' } },
          { in: 'query', name: 'radiusKm', schema: { type: 'number', default: 2.0 } },
        ],
        responses: { 200: { description: 'List of nearby issues' } },
      },
    },
    '/issues/{id}': {
      get: {
        summary: 'Get issue report details by ID',
        tags: ['Issues'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Detailed issue record' }, 404: { description: 'Not found' } },
      },
      patch: {
        summary: 'Update issue report fields',
        tags: ['Issues'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated issue record' } },
      },
      delete: {
        summary: 'Delete issue report',
        tags: ['Issues'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Issue report deleted' } },
      },
    },
    '/issues/{id}/confirm': {
      post: {
        summary: 'Confirm / Upvote a civic issue',
        tags: ['Confirmations'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Issue confirmed, priority score updated' } },
      },
      delete: {
        summary: 'Remove confirmation / upvote',
        tags: ['Confirmations'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Confirmation removed' } },
      },
    },
    '/comments/{id}': {
      get: {
        summary: 'Get single comment details',
        tags: ['Comments'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Comment object' } },
      },
      patch: {
        summary: 'Update comment body',
        tags: ['Comments'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated comment' } },
      },
      delete: {
        summary: 'Delete comment',
        tags: ['Comments'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Comment deleted' } },
      },
    },
    '/upload': {
      post: {
        summary: 'Upload photo evidence to Cloudinary',
        tags: ['Uploads'],
        responses: { 201: { description: 'Image uploaded successfully' } },
      },
    },
    '/notifications': {
      get: {
        summary: 'Get user notifications',
        tags: ['Notifications'],
        responses: { 200: { description: 'User notification list' } },
      },
    },
    '/admin/dashboard': {
      get: {
        summary: 'Get admin dashboard statistics & priority queue',
        tags: ['Admin Portal'],
        responses: { 200: { description: 'Dashboard stats' } },
      },
    },
    '/admin/analytics': {
      get: {
        summary: 'Get detailed admin analytics & SLA metrics',
        tags: ['Admin Portal'],
        responses: { 200: { description: 'Analytics breakdown' } },
      },
    },
    '/admin/categories': {
      get: {
        summary: 'List categories',
        tags: ['Admin Categories'],
        responses: { 200: { description: 'Category list' } },
      },
      post: {
        summary: 'Create category',
        tags: ['Admin Categories'],
        responses: { 201: { description: 'Category created' } },
      },
    },
    '/admin/categories/{id}': {
      patch: {
        summary: 'Update category details',
        tags: ['Admin Categories'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category updated' } },
      },
      delete: {
        summary: 'Deactivate or delete category',
        tags: ['Admin Categories'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category deleted/deactivated' } },
      },
    },
  },
};

module.exports = swaggerJsDoc;
