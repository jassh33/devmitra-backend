import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import {
    createVendor,
    getVendors,
    approveVendor,
    blockVendor,
} from '../controllers/vendorController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor management APIs
 */

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create a Vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *               poojariCategory:
 *                 type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               studyPlace:
 *                 type: string
 *               experience:
 *                 type: number
 *               profileImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendor created successfully
 */
router.post(
    '/',
    protect,
    authorizeRoles('admin'),
    createVendor
);

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all Vendors (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendors
 */
router.get(
    '/',
    protect,
    authorizeRoles('admin'),
    getVendors
);

/**
 * @swagger
 * /api/vendors/{id}/approve:
 *   patch:
 *     summary: Approve a Vendor (Admin only)
 *     tags: [Vendors]
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
 *         description: Vendor approved
 */
router.patch(
    '/:id/approve',
    protect,
    authorizeRoles('admin'),
    approveVendor
);

/**
 * @swagger
 * /api/vendors/{id}/block:
 *   patch:
 *     summary: Block a Vendor (Admin only)
 *     tags: [Vendors]
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
 *         description: Vendor blocked
 */
router.patch(
    '/:id/block',
    protect,
    authorizeRoles('admin'),
    blockVendor
);

export default router;