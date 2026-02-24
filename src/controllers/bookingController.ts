import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Availability from '../models/Availability';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management APIs
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - puja
 *               - availability
 *               - totalAmount
 *             properties:
 *               customer:
 *                 type: string
 *               vendor:
 *                 type: string
 *               puja:
 *                 type: string
 *               availability:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *               bookingItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       500:
 *         description: Error creating booking
 */
export const createBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.create(req.body);

        await Availability.findByIdAndUpdate(req.body.availability, {
            isBooked: true,
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
};

/**
 * @swagger
 * /api/bookings/customer/{customerId}:
 *   get:
 *     summary: Get bookings by customer
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customer bookings
 *       403:
 *         description: Access denied
 *       500:
 *         description: Error fetching bookings
 */
export const getCustomerBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { customerId } = req.params;

        if (req.user.id !== customerId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const bookings = await Booking.find({ customer: customerId });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};

/**
 * @swagger
 * /api/bookings/{id}/accept:
 *   patch:
 *     summary: Vendor accepts booking
 *     tags: [Bookings]
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
 *         description: Booking accepted
 *       500:
 *         description: Error accepting booking
 */
export const acceptBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'accepted' },
            { new: true }
        );

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error accepting booking' });
    }
};

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   patch:
 *     summary: Vendor rejects booking
 *     tags: [Bookings]
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
 *         description: Booking rejected
 *       500:
 *         description: Error rejecting booking
 */
export const rejectBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting booking' });
    }
};

/**
 * @swagger
 * /api/bookings/{id}/assign:
 *   patch:
 *     summary: Admin assigns vendor to booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *             properties:
 *               vendorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor assigned successfully
 *       500:
 *         description: Error assigning vendor
 */
export const assignVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                vendor: vendorId,
                status: 'requested',
            },
            { new: true }
        );

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning vendor' });
    }
};

/**
 * @swagger
 * /api/bookings/vendor/{vendorId}:
 *   get:
 *     summary: Get bookings for vendor (optional status filter)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, requested, accepted, rejected, completed, cancelled]
 *     responses:
 *       200:
 *         description: List of vendor bookings
 *       403:
 *         description: Access denied
 *       500:
 *         description: Error fetching vendor bookings
 */
export const getVendorBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId } = req.params;

        if (req.user.id !== vendorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const filter: any = { vendor: vendorId };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const bookings = await Booking.find(filter);

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendor bookings' });
    }
};