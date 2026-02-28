import { Request, Response } from 'express';
import User from '../models/User';

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new Customer
 *     tags: [Customers]
 */

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new Customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
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
 *               poojariCategory:
 *                 type: string
 *                 example: "Vedic Pandit"
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Telugu", "Hindi"]
 *               studyPlace:
 *                 type: string
 *                 example: "Tirupati"
 *               experience:
 *                 type: number
 *                 example: 10
 *               profileImage:
 *                 type: string
 *                 example: "/public/profiles/12345.jpg"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       500:
 *         description: Error creating customer
 */
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await User.create({
            ...req.body,
            role: 'customer',
            isApproved: true,   // usually customers auto approved
            isBlocked: false,
        });

        res.status(201).json(customer);
    } catch (error: any) {
        console.error("Create Customer Error:", error);

        res.status(500).json({
            message: error?.message || "Server error",
            stack: error?.stack,
        });
    }
};

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: List of customers
 *       500:
 *         description: Error fetching customers
 */
export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await User.find({ role: 'customer' });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers' });
    }
};