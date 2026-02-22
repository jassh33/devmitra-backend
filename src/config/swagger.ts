import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

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
                url: 'http://localhost:5000',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // scan routes for swagger comments
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;