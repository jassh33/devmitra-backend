import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import {
    createCustomer,
    getCustomers,
} from '../controllers/customerController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management APIs
 */

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new Customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Ramesh"
 *               lastName:
 *                 type: string
 *                 example: "Sharma"
 *               phone:
 *                 type: string
 *                 example: "919876543210"
 *               city:
 *                 type: string
 *                 example: "Hyderabad"
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Telugu", "Hindi"]
 *               profileImage:
 *                 type: string
 *                 example: "/public/profiles/12345.jpg"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       500:
 *         description: Error creating customer
 */
router.post('/', createCustomer);

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all Customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: List of customers
 *       500:
 *         description: Error fetching customers
 */
router.get('/', getCustomers);

export default router;