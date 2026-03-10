import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dev Mitra API',
            version: '1.0.0',
            description: 'Dev Mitra Backend API Documentation',
        },
        servers: [
            {
                url: '/',
                description: 'Current Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                LocalizedString: {
                    type: 'object',
                    properties: {
                        en: { type: 'string', example: 'Hello' },
                        hi: { type: 'string', example: 'नमस्ते' },
                        te: { type: 'string', example: 'హలో' },
                    },
                    required: ['en'],
                },
                UserObject: {
                    type: 'object',
                    properties: {
                        _id:            { type: 'string', example: '64abc123...' },
                        firstName:      { $ref: '#/components/schemas/LocalizedString' },
                        lastName:       { $ref: '#/components/schemas/LocalizedString' },
                        phone:          { type: 'string', example: '919876543210' },
                        email:          { type: 'string', example: 'user@example.com' },
                        role:           { type: 'string', enum: ['customer', 'vendor', 'admin'] },
                        city:           { $ref: '#/components/schemas/LocalizedString' },
                        profileImage:   { type: 'string', example: 'https://res.cloudinary.com/...' },
                        gender:         { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                        isApproved:     { type: 'boolean' },
                        isBlocked:      { type: 'boolean' },
                        experience:     { type: 'number', example: 5 },
                        fee:            { type: 'number', example: 500, description: 'Vendor fee in INR (optional)' },
                        languages:      { type: 'array', items: { type: 'string' } },
                        poojariCategory:{ $ref: '#/components/schemas/LocalizedString' },
                        studyPlace:     { $ref: '#/components/schemas/LocalizedString' },
                        createdAt:      { type: 'string', format: 'date-time' },
                        updatedAt:      { type: 'string', format: 'date-time' },
                    },
                },
                PujaItem: {
                    type: 'object',
                    properties: {
                        name:            { $ref: '#/components/schemas/LocalizedString' },
                        defaultQuantity: { type: 'number', example: 2 },
                    },
                },
                PujaType: {
                    type: 'object',
                    properties: {
                        _id:             { type: 'string' },
                        name:            { $ref: '#/components/schemas/LocalizedString' },
                        description:     { $ref: '#/components/schemas/LocalizedString' },
                        basePrice:       { type: 'number', example: 2500 },
                        image:           { type: 'string', example: 'https://res.cloudinary.com/...' },
                        durationMinutes: { type: 'number', example: 120 },
                        defaultItems:    { type: 'array', items: { $ref: '#/components/schemas/PujaItem' } },
                        isActive:        { type: 'boolean' },
                        createdAt:       { type: 'string', format: 'date-time' },
                    },
                },
                BookingItem: {
                    type: 'object',
                    properties: {
                        name:       { type: 'string', example: 'Coconut' },
                        quantity:   { type: 'number', example: 2 },
                        modifiedBy: { type: 'string', enum: ['customer', 'vendor'], example: 'customer' },
                    },
                },
                Booking: {
                    type: 'object',
                    properties: {
                        _id:          { type: 'string' },
                        customer:     { type: 'string', description: 'User _id' },
                        vendor:       { type: 'string', description: 'User _id' },
                        puja:         { type: 'string', description: 'PujaType _id' },
                        availability: { type: 'string', description: 'Availability _id' },
                        totalAmount:  { type: 'number', example: 2500 },
                        status:       { type: 'string', enum: ['pending', 'requested', 'accepted', 'rejected', 'completed', 'cancelled'] },
                        bookingItems: { type: 'array', items: { $ref: '#/components/schemas/BookingItem' } },
                        createdAt:    { type: 'string', format: 'date-time' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Something went wrong' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/server.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;