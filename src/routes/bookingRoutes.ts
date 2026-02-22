import express from 'express';
import {
    createBooking,
    getCustomerBookings,
    acceptBooking,
    rejectBooking,
    assignVendor,
    getVendorBookings,
} from '../controllers/bookingController';

import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

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
 *     summary: Create a booking (Customer only)
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
 *                     modifiedBy:
 *                       type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post(
    '/',
    protect,
    authorizeRoles('customer'),
    createBooking
);

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
 */
router.get(
    '/customer/:customerId',
    protect,
    authorizeRoles('customer'),
    getCustomerBookings
);

/**
 * @swagger
 * /api/bookings/vendor/{vendorId}:
 *   get:
 *     summary: Get bookings for a vendor
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
 */
router.get(
    '/vendor/:vendorId',
    protect,
    authorizeRoles('vendor'),
    getVendorBookings
);

/**
 * @swagger
 * /api/bookings/{id}/accept:
 *   patch:
 *     summary: Vendor accept booking
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
 */
router.patch(
    '/:id/accept',
    protect,
    authorizeRoles('vendor'),
    acceptBooking
);

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   patch:
 *     summary: Vendor reject booking
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
 */
router.patch(
    '/:id/reject',
    protect,
    authorizeRoles('vendor'),
    rejectBooking
);

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
 */
router.patch(
    '/:id/assign',
    protect,
    authorizeRoles('admin'),
    assignVendor
);

export default router;