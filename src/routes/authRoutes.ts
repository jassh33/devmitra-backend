import express from 'express';
import { sendOtp, verifyOtp, login } from '../controllers/authController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: OTP based authentication APIs
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Step 1 — Send OTP to user's phone number
 *     description: |
 *       Sends a 6-digit OTP to the given phone number via SMS.
 *
 *       **Staging mode** (`USE_STATIC_OTP=true`): OTP is always `123456` and is returned in `devOtp`.
 *       No SMS is sent in staging.
 *
 *       **Phone format:** send just the 10-digit number (e.g. `9876543210`).
 *       The server automatically prepends the country code `91`.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: 10-digit mobile number (without country code)
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 devOtp:
 *                   type: string
 *                   example: "123456"
 *                   description: "Only present in staging mode — use this OTP to verify"
 *       400:
 *         description: Phone number is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Phone number not registered — user must be created first by Admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error sending OTP (SMS gateway error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-otp', sendOtp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Step 2 (legacy) — Verify OTP and get a single JWT token
 *     description: |
 *       Verifies the OTP and returns a **single access token**.
 *       Use `/api/auth/login` instead to get both access + refresh tokens
 *       (recommended for Flutter apps).
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified — returns single JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   description: JWT access token — valid for 7 days
 *                 user:
 *                   $ref: '#/components/schemas/UserObject'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-otp', verifyOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Step 2 (recommended) — Verify OTP and get access + refresh tokens
 *     description: |
 *       Verifies the OTP and returns both an **access token** (7 days) and a **refresh token** (30 days),
 *       along with full user profile info.
 *
 *       **Flutter flow:**
 *       1. `POST /api/auth/send-otp` → receive OTP (devOtp in staging)
 *       2. `POST /api/auth/login`    → receive `tokens.access` and `tokens.refresh`
 *       3. Use `Authorization: Bearer <tokens.access>` on all subsequent requests
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: 10-digit mobile number (without country code)
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: OTP received via SMS (or `123456` in staging mode)
 *     responses:
 *       200:
 *         description: Login successful — save access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 type:
 *                   type: string
 *                   example: "success"
 *                 title:
 *                   type: string
 *                   example: "Login Successful"
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       description: JWT access token — expires in 7 days
 *                     refresh:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                       description: JWT refresh token — expires in 30 days
 *                     user:
 *                       type: object
 *                       properties:
 *                         username:       { type: string, example: "Ramesh Sharma" }
 *                         email:          { type: string, example: "ramesh@example.com" }
 *                         first_name:     { type: string, example: "Ramesh" }
 *                         last_name:      { type: string, example: "Sharma" }
 *                         mobile_number:  { type: string, example: "919876543210" }
 *                         user_type:      { type: string, enum: [customer, vendor, admin] }
 *                         is_verified:    { type: boolean }
 *                         is_active:      { type: boolean }
 *                         city:           { type: string }
 *                         gender:         { type: string, enum: [male, female, other, null] }
 *                         profile_image:  { type: string, example: "https://res.cloudinary.com/..." }
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

export default router;