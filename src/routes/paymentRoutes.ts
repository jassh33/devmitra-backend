import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { processPayment, getMyPayments } from '../controllers/paymentController';

const router = express.Router();

router.post('/', protect, processPayment);
router.get('/history', protect, getMyPayments);

export default router;