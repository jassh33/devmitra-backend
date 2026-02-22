import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import {AuthRequest} from "../middleware/authMiddleware";

// Simulate payment
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