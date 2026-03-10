import express from 'express';
import { createCustomer, getCustomers } from '../controllers/customerController';

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
 *     description: |
 *       Creates a customer user record. Plain string fields for `firstName`, `lastName`, `city` etc.
 *       are automatically translated to Hindi (hi) and Telugu (te) via Google Translate.
 *
 *       **Note:** Customers are created by the Admin. After creation, the customer logs in via OTP.
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
 *                 description: Full phone number with country code
 *               email:
 *                 type: string
 *                 example: "ramesh@example.com"
 *               city:
 *                 type: string
 *                 example: "Hyderabad"
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Telugu", "Hindi"]
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *                 description: Optional — send as plain string
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserObject'
 *       500:
 *         description: Error creating customer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *         description: List of all customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserObject'
 *       500:
 *         description: Error fetching customers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getCustomers);

export default router;