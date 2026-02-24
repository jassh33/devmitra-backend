import app from './app';
import connectDB from './config/db';
import swaggerUi from 'swagger-ui-express';
//import swaggerJsdoc from 'swagger-jsdoc';
import swaggerSpec from './config/swagger';
import { Request, Response } from 'express';

const PORT = process.env.PORT || 5000;

/**
 * ---------------------------
 * Swagger Configuration
 * ---------------------------
 */
/* const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DevMitra API',
            version: '1.0.0',
            description: 'TypeScript Staging Server for DevMitra App',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Local Development Server',
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
    apis: ['src/routes/*.ts','src/controllers/*.ts'], // Only scan routes
}; */

//const specs = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'DevMitra TS Server is healthy' });
});

// Connect DB
connectDB();

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
});