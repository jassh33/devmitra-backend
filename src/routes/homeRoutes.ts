import express from 'express';
import { getHomeCards } from '../controllers/homeController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Home screen APIs
 */

/**
 * @swagger
 * /api/home/cards:
 *   get:
 *     summary: Get home screen cards
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: List of active home cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *       500:
 *         description: Error fetching home cards
 */
router.get('/cards', getHomeCards);

export default router;