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
        },
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/server.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;