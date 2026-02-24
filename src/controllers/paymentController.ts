import { Response } from 'express';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment simulation and management APIs
 */

/**
 * @swagger
 * /api/payments/simulate:
 *   post:
 *     summary: Simulate payment for a booking (Customer only)
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
 *                 example: "664af2d1234567890abc1234"
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *                 example: "success"
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Error processing payment
 */
export const simulatePayment = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const payment = await Payment.create({
            booking: bookingId,
            amount: booking.totalAmount,
            transactionId: `TXN-${Date.now()}`,
            status,
        });

        if (status === 'success') {
            booking.paymentStatus = 'paid';
            booking.status = 'completed';
        } else {
            booking.paymentStatus = 'failed';
        }

        await booking.save();

        res.status(201).json({
            message: 'Payment processed',
            payment,
            updatedBooking: booking,
        });

    } catch (error) {
        res.status(500).json({ message: 'Error processing payment' });
    }
};