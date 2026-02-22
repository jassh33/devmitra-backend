import express from 'express';
import {
    createAvailability,
    getVendorAvailability,
} from '../controllers/availabilityController';

import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Availability
 *   description: Vendor availability management
 */

/**
 * @swagger
 * /api/availability:
 *   post:
 *     summary: Create vendor availability slot (Vendor only)
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
 *               date:
 *                 type: string
 *                 example: "2025-12-20"
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "11:00"
 *     responses:
 *       201:
 *         description: Availability slot created
 */
router.post(
    '/',
    protect,
    authorizeRoles('vendor'),
    createAvailability
);

/**
 * @swagger
 * /api/availability/{vendorId}:
 *   get:
 *     summary: Get vendor availability slots (Vendor only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of available slots
 */
router.get(
    '/:vendorId',
    protect,
    authorizeRoles('vendor'),
    getVendorAvailability
);

export default router;