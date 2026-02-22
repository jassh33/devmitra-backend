import express from 'express';
import {
    uploadProfile,
    uploadPuja,
    uploadIcon,
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
 * Upload Profile Picture (Customer or Vendor)
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

/**
 * Upload Puja Image (Admin only)
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
 * Upload Icon (Admin only)
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