import express from 'express';
import { simulatePayment } from '../controllers/paymentController';

import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment simulation APIs
 */

/**
 * @swagger
 * /api/payments/simulate:
 *   post:
 *     summary: Simulate payment for booking (Customer only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - status
 *             properties:
 *               bookingId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *     responses:
 *       201:
 *         description: Payment processed
 */
router.post(
    '/simulate',
    protect,
    authorizeRoles('customer'),
    simulatePayment
);

export default router;