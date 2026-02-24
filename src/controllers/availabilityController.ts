import { Response } from 'express';
import Availability from '../models/Availability';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Availability
 *   description: Vendor availability management APIs
 */

/**
 * @swagger
 * /api/availability:
 *   post:
 *     summary: Create availability slot (Vendor only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendor
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               vendor:
 *                 type: string
 *                 example: "664af2d1234567890abc1234"
 *               date:
 *                 type: string
 *                 example: "2026-03-10"
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "11:00"
 *     responses:
 *       201:
 *         description: Availability slot created successfully
 *       403:
 *         description: Access denied
 *       500:
 *         description: Error creating availability
 */
export const createAvailability = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.id !== req.body.vendor) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const availability = await Availability.create(req.body);

        res.status(201).json(availability);
    } catch (error) {
        res.status(500).json({ message: 'Error creating availability' });
    }
};

/**
 * @swagger
 * /api/availability/{vendorId}:
 *   get:
 *     summary: Get availability slots by vendor (Vendor only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: List of availability slots
 *       403:
 *         description: Access denied
 *       500:
 *         description: Error fetching availability
 */
export const getVendorAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId } = req.params;

        if (req.user.id !== vendorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const slots = await Availability.find({ vendor: vendorId });

        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability' });
    }
};