import express from 'express';
import {
    uploadProfile,
    uploadPuja,
    uploadIcon, uploadHomeCard,
} from '../middleware/uploadMiddleware';

import { protect } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Image upload APIs
 */

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: Upload profile image (Customer or Vendor)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded
 */
router.post(
    '/profile',
    protect,
    uploadProfile.single('image'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            imageUrl: `/public/profiles/${req.file.filename}`,
        });
    }
);

router.post(
    '/home-card',
    protect,
    authorizeRoles('admin'),
    uploadHomeCard.single('image'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            imageUrl: `/public/home/${req.file.filename}`,
        });
    }
);

/**
 * @swagger
 * /api/upload/puja:
 *   post:
 *     summary: Upload puja image (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Puja image uploaded successfully
 *       400:
 *         description: No file uploaded
 *       403:
 *         description: Access denied
 */
router.post(
    '/puja',
    protect,
    authorizeRoles('admin'),
    uploadPuja.single('image'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            imageUrl: `/public/pujas/${req.file.filename}`,
        });
    }
);

/**
 * @swagger
 * /api/upload/icon:
 *   post:
 *     summary: Upload icon image (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Icon uploaded successfully
 *       400:
 *         description: No file uploaded
 *       403:
 *         description: Access denied
 */
router.post(
    '/icon',
    protect,
    authorizeRoles('admin'),
    uploadIcon.single('image'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        res.json({
            imageUrl: `/public/icons/${req.file.filename}`,
        });
    }
);

export default router;