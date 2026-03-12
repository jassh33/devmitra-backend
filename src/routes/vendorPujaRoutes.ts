import express from 'express';
import {
    assignPujaToVendor,
    getVendorPujas,
} from '../controllers/vendorPujaController';

const router = express.Router();

router.post('/', assignPujaToVendor);

router.get('/:vendorId', getVendorPujas);

export default router;