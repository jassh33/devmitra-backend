import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { createVendor, getVendors, approveVendor, blockVendor } from '../controllers/vendorController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor management APIs (Admin only)
 */

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create a Vendor (Admin only)
 *     description: |
 *       Creates a new vendor user. Plain string fields are auto-translated to hi/te.
 *       After creation, the vendor logs in via OTP using this phone number.
 *       New vendors are **not approved by default** — an Admin must call `PATCH /api/vendors/{id}/approve`.
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
 *                 example: "Suresh"
 *               lastName:
 *                 type: string
 *                 example: "Iyer"
 *               phone:
 *                 type: string
 *                 example: "919876543210"
 *                 description: Full number with country code
 *               email:
 *                 type: string
 *                 example: "suresh@example.com"
 *               city:
 *                 type: string
 *                 example: "Hyderabad"
 *               poojariCategory:
 *                 type: string
 *                 example: "Vedic Pandit"
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Telugu", "Sanskrit"]
 *               studyPlace:
 *                 type: string
 *                 example: "Tirupati"
 *               experience:
 *                 type: number
 *                 example: 10
 *               fee:
 *                 type: number
 *                 example: 500
 *                 description: Vendor fee in INR (optional)
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *                 description: Optional — send as plain string
 *     responses:
 *       201:
 *         description: Vendor created (not yet approved)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserObject'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin only
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', protect, authorizeRoles('admin'), createVendor);

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
 *         description: List of all vendors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserObject'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin only
 */
router.get('/', protect, authorizeRoles('admin','customer'), getVendors);

/**
 * @swagger
 * /api/vendors/{id}/approve:
 *   patch:
 *     summary: Approve a Vendor (Admin only)
 *     description: Sets `isApproved = true` on the vendor's User document, allowing them to accept bookings.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB _id of the vendor User
 *         schema:
 *           type: string
 *           example: "64abc123def456"
 *     responses:
 *       200:
 *         description: Vendor approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserObject'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin only
 *       404:
 *         description: Vendor not found
 */
router.patch('/:id/approve', protect, authorizeRoles('admin'), approveVendor);

/**
 * @swagger
 * /api/vendors/{id}/block:
 *   patch:
 *     summary: Block a Vendor (Admin only)
 *     description: Sets `isBlocked = true` on the vendor's User document, preventing them from logging in.
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB _id of the vendor User
 *         schema:
 *           type: string
 *           example: "64abc123def456"
 *     responses:
 *       200:
 *         description: Vendor blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserObject'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin only
 *       404:
 *         description: Vendor not found
 */
router.patch('/:id/block', protect, authorizeRoles('admin'), blockVendor);

export default router;