import 'dotenv/config';
import app from './app';
import connectDB from './config/db';
import { Request, Response } from 'express';

const PORT = process.env.PORT || 5000;

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Server health check
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "DevMitra TS Server is healthy"
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