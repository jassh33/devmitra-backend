import express from 'express';
import {
    createAvailability,
    getVendorAvailability,
} from '../controllers/availabilityController';

import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

router.post(
    '/',
    protect,
    authorizeRoles('vendor'),
    createAvailability
);

router.get(
    '/:vendorId',
    protect,
    authorizeRoles('vendor'),
    getVendorAvailability
);

export default router;