import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import {
    createCustomer,
    getCustomers,
} from '../controllers/customerController';

const router = express.Router();

/**
 * Create Customer (Admin only)
 */
router.post(
    '/',
    protect,
    authorizeRoles('admin'),
    createCustomer
);

/**
 * Get all Customers (Admin only)
 */
router.get(
    '/',
    protect,
    authorizeRoles('admin'),
    getCustomers
);

export default router;