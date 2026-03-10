import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management APIs
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a mockup payment
 *     description: Creates a payment record for a specific booking and updates the booking's `paymentStatus` to 'paid'.
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
 *               - transactionId
 *             properties:
 *               bookingId:
 *                 type: string
 *               transactionId:
 *                 type: string
 *                 example: "1121662345"
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
export const processPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { bookingId, transactionId } = req.body;
        const customerId = req.user?.id || req.user?._id;

        const booking = await Booking.findOne({ _id: bookingId, customer: customerId });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not yours' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Booking is already paid' });
        }

        const payment = await Payment.create({
            booking: booking._id,
            amount: booking.totalAmount, // pull from booking
            transactionId: transactionId || `TXN_${Date.now()}`,
            status: 'success'
        });

        // Update booking status
        booking.paymentStatus = 'paid';
        await booking.save();

        res.status(201).json({
            message: 'Payment successful',
            payment
        });
    } catch (error: any) {
        console.error('Payment Error:', error);
        res.status(500).json({ message: error?.message || 'Error processing payment' });
    }
};

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get logged-in user's payment history
 *     description: Fetch your payment history. It populates the `booking` object so you can display the `puja`, `date`, and `time` of the associated booking.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments with populated booking nested data
 *       500:
 *         description: Server error
 */
export const getMyPayments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;

        // Find all bookings belonging to this customer
        const bookings = await Booking.find({ customer: userId }).select('_id');
        const bookingIds = bookings.map(b => b._id);

        const payments = await Payment.find({ booking: { $in: bookingIds } })
            .populate({
                path: 'booking',
                select: 'date time puja vendor vendorFee totalAmount status',
                populate: [
                    { path: 'puja', select: 'name image' },
                    { path: 'vendor', select: 'firstName lastName profileImage' }
                ]
            })
            .sort({ createdAt: -1 });

        res.status(200).json(payments);
    } catch (error: any) {
        console.error('Payment History Error:', error);
        res.status(500).json({ message: error?.message || 'Error fetching payment history' });
    }
};