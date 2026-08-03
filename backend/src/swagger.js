const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bengkel Mouse API',
      version: '1.0.0',
      description: 'API documentation for Bengkel Mouse — Mouse repair service management system.',
      contact: {
        name: 'Bengkel Mouse Dev',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local Development',
      },
      {
        url: 'https://dev-api-bengkelmouse.duaenam.id/api',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-here' },
            name: { type: 'string', example: 'Nathan Chandra' },
            email: { type: 'string', example: 'nathan@example.com' },
            phone: { type: 'string', example: '08123456789', nullable: true },
            address: { type: 'string', example: 'Jl. Merdeka No. 1', nullable: true },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
            avatarUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Stock: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-here' },
            name: { type: 'string', example: 'Switch Omron 10M' },
            category: { type: 'string', example: 'Switch' },
            quantity: { type: 'integer', example: 50 },
            price: { type: 'number', example: 15000 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-here' },
            userId: { type: 'string' },
            mouseName: { type: 'string', example: 'Logitech G102' },
            issue: { type: 'string', example: 'Double Clicking' },
            details: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['PENDING', 'CHECKING', 'WAITING_PAYMENT', 'PAYMENT_REVIEW', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'CANCELLED'],
              example: 'PENDING',
            },
            paymentStatus: { type: 'string', enum: ['UNPAID', 'PAID'], example: 'UNPAID' },
            paymentProofUrl: { type: 'string', nullable: true },
            totalAmount: { type: 'number', nullable: true, example: 50000 },
            uniqueCode: { type: 'integer', nullable: true, example: 123 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BookingPart: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bookingId: { type: 'string' },
            stockId: { type: 'string' },
            quantity: { type: 'integer', example: 2 },
            priceEach: { type: 'number', example: 15000 },
            createdAt: { type: 'string', format: 'date-time' },
            stock: { $ref: '#/components/schemas/Stock' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message here' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Stocks', description: 'Inventory / spare parts management' },
      { name: 'Bookings', description: 'Service booking management' },
      { name: 'Booking Parts', description: 'Spare parts used in a booking' },
    ],
  },
  apis: ['./src/docs/*.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
