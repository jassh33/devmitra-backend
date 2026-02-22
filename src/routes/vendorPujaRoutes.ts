import express from 'express';
import {
    assignPujaToVendor,
    getVendorPujas,
} from '../controllers/vendorPujaController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: VendorPujas
 *   description: Vendor and Puja mapping APIs
 */

/**
 * @swagger
 * /api/vendor-pujas:
 *   post:
 *     summary: Assign Puja to Vendor
 *     tags: [VendorPujas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendorId:
 *                 type: string
 *               pujaId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mapping created successfully
 */
router.post('/', assignPujaToVendor);

/**
 * @swagger
 * /api/vendor-pujas/{vendorId}:
 *   get:
 *     summary: Get Pujas assigned to Vendor
 *     tags: [VendorPujas]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pujas for vendor
 */
router.get('/:vendorId', getVendorPujas);

export default router;