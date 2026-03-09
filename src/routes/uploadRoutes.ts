import express, { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import {
    uploadProfile,
    uploadPuja,
    uploadIcon,
    uploadHomeCard,
} from '../middleware/uploadMiddleware';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import User from '../models/User';

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:    process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const uploadBufferToCloudinary = (
    buffer: Buffer,
    folder: string,
    publicId?: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, public_id: publicId, resource_type: 'image', overwrite: true },
            (error, result) => {
                if (error || !result) return reject(error);
                resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Image upload APIs — all uploads go to Cloudinary and return a secure HTTPS URL
 */

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: Upload profile image for the logged-in user
 *     description: |
 *       Uploads the image to Cloudinary under `dev_mitra_uploads/profiles/<userId>`,
 *       then saves the returned `secure_url` into **User.profileImage** in MongoDB.
 *
 *       **How to call from Flutter:**
 *       ```
 *       POST /api/upload/profile
 *       Authorization: Bearer <access_token>
 *       Content-Type: multipart/form-data
 *       Body: image = <file>
 *       ```
 *
 *       The user is identified automatically from the Bearer token — no userId needed in the body.
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
 *                 description: The profile image file (PNG, JPG, WEBP — max 5 MB)
 *     responses:
 *       200:
 *         description: Profile image uploaded to Cloudinary and saved to User document in MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile image updated successfully"
 *                 imageUrl:
 *                   type: string
 *                   example: "https://res.cloudinary.com/drnbnse1z/image/upload/dev_mitra_uploads/profiles/64abc123.jpg"
 *                   description: Full Cloudinary HTTPS URL — this is also saved to User.profileImage
 *                 user:
 *                   $ref: '#/components/schemas/UserObject'
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid Bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Cloudinary upload failed or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/profile',
    protect,
    uploadProfile.single('image'),
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            const userId = req.user?.id || req.user?._id;
            if (!userId) {
                return res.status(401).json({ message: 'User not identified in token' });
            }
            const imageUrl = await uploadBufferToCloudinary(
                req.file.buffer,
                'dev_mitra_uploads/profiles',
                `${userId}`
            );
            const user = await User.findByIdAndUpdate(
                userId,
                { profileImage: imageUrl },
                { new: true }
            ).select('-otp -otpExpiry -__v');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'Profile image updated successfully', imageUrl, user });
        } catch (error: any) {
            console.error('Profile upload error:', error);
            res.status(500).json({ message: error?.message || 'Upload failed' });
        }
    }
);

/**
 * @swagger
 * /api/upload/home-card:
 *   post:
 *     summary: Upload a home card image (Admin only)
 *     description: |
 *       Uploads image to Cloudinary under `dev_mitra_uploads/home/`.
 *       Returns the Cloudinary `secure_url` — use this URL when creating a HomeCard record.
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
 *                 description: Image file (PNG, JPG, WEBP — max 5 MB)
 *     responses:
 *       200:
 *         description: Image uploaded — use the returned imageUrl in the HomeCard body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: "https://res.cloudinary.com/drnbnse1z/image/upload/dev_mitra_uploads/home/home_1234567890.jpg"
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 *       500:
 *         description: Upload failed
 */
router.post(
    '/home-card',
    protect,
    authorizeRoles('admin'),
    uploadHomeCard.single('image'),
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            const imageUrl = await uploadBufferToCloudinary(
                req.file.buffer,
                'dev_mitra_uploads/home',
                `home_${Date.now()}`
            );
            res.json({ imageUrl });
        } catch (error: any) {
            console.error('Home-card upload error:', error);
            res.status(500).json({ message: error?.message || 'Upload failed' });
        }
    }
);

/**
 * @swagger
 * /api/upload/puja:
 *   post:
 *     summary: Upload a puja image (Admin only)
 *     description: |
 *       Uploads image to Cloudinary under `dev_mitra_uploads/pujas/`.
 *       Returns the Cloudinary `secure_url` — use this URL as the `image` field when creating a Puja via `POST /api/pujas`.
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
 *                 description: Image file (PNG, JPG, WEBP — max 5 MB)
 *     responses:
 *       200:
 *         description: Image uploaded — use the returned imageUrl as the puja image field
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: "https://res.cloudinary.com/drnbnse1z/image/upload/dev_mitra_uploads/pujas/puja_1234567890.jpg"
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 *       500:
 *         description: Upload failed
 */
router.post(
    '/puja',
    protect,
    authorizeRoles('admin'),
    uploadPuja.single('image'),
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            const imageUrl = await uploadBufferToCloudinary(
                req.file.buffer,
                'dev_mitra_uploads/pujas',
                `puja_${Date.now()}`
            );
            res.json({ imageUrl });
        } catch (error: any) {
            console.error('Puja upload error:', error);
            res.status(500).json({ message: error?.message || 'Upload failed' });
        }
    }
);

/**
 * @swagger
 * /api/upload/icon:
 *   post:
 *     summary: Upload an icon image (Admin only)
 *     description: Uploads image to Cloudinary under `dev_mitra_uploads/icons/` and returns the `secure_url`.
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
 *                 description: Image file (PNG, JPG, WEBP — max 5 MB)
 *     responses:
 *       200:
 *         description: Icon uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: "https://res.cloudinary.com/drnbnse1z/image/upload/dev_mitra_uploads/icons/icon_1234567890.jpg"
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — Admin role required
 *       500:
 *         description: Upload failed
 */
router.post(
    '/icon',
    protect,
    authorizeRoles('admin'),
    uploadIcon.single('image'),
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            const imageUrl = await uploadBufferToCloudinary(
                req.file.buffer,
                'dev_mitra_uploads/icons',
                `icon_${Date.now()}`
            );
            res.json({ imageUrl });
        } catch (error: any) {
            console.error('Icon upload error:', error);
            res.status(500).json({ message: error?.message || 'Upload failed' });
        }
    }
);

export default router;