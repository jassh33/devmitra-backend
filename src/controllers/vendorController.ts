import { Request, Response } from 'express';
import User from '../models/User';

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor management APIs
 */

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create a new Vendor
 *     tags: [Vendors]
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
 *         description: Vendor created successfully
 *       500:
 *         description: Error creating vendor
 */
export const createVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await User.create({
            ...req.body,
            role: 'vendor',
        });

        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vendor' });
    }
};

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendors]
 *     responses:
 *       200:
 *         description: List of vendors
 *       500:
 *         description: Error fetching vendors
 */
export const getVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await User.find({ role: 'vendor' });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendors' });
    }
};

/**
 * @swagger
 * /api/vendors/{id}/approve:
 *   patch:
 *     summary: Approve a vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor approved successfully
 *       500:
 *         description: Error approving vendor
 */
export const approveVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error approving vendor' });
    }
};

/**
 * @swagger
 * /api/vendors/{id}/block:
 *   patch:
 *     summary: Block a vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor blocked successfully
 *       500:
 *         description: Error blocking vendor
 */
export const blockVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true }
        );

        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error blocking vendor' });
    }
};