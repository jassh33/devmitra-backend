import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import {
    createBooking,
    getMyBookings,
    acceptBooking,
    rejectBooking,
    assignVendor,
    markBookingCompleted,
    getCompletedBookings
} from '../controllers/bookingController';

const router = express.Router();

router.post('/', protect, createBooking);

router.get('/my-bookings', protect, getMyBookings);

// Must be defined before /:id routes to avoid 'completed' being treated as an :id
router.get('/completed', protect, authorizeRoles('vendor'), getCompletedBookings);

router.patch('/:id/accept', protect, authorizeRoles('vendor'), acceptBooking);

router.patch('/:id/reject', protect, authorizeRoles('vendor'), rejectBooking);

router.patch('/:id/assign', protect, authorizeRoles('admin'), assignVendor);

router.patch('/:id/complete', protect, authorizeRoles('vendor'), markBookingCompleted);

export default router;