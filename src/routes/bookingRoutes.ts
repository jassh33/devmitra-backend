import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import {
    createBooking,
    getMyBookings,
    acceptBooking,
    rejectBooking,
    assignVendor
} from '../controllers/bookingController';

const router = express.Router();

router.post('/', protect, createBooking);

router.get('/my-bookings', protect, getMyBookings);

router.patch('/:id/accept', protect, authorizeRoles('vendor'), acceptBooking);

router.patch('/:id/reject', protect, authorizeRoles('vendor'), rejectBooking);

router.patch('/:id/assign', protect, authorizeRoles('admin'), assignVendor);

export default router;