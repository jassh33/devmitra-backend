import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user: any) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
};

const generateRefreshToken = (user: any) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: '30d' }
    );
};

const USE_STATIC_OTP = process.env.USE_STATIC_OTP === 'true';
const STATIC_OTP = process.env.STATIC_OTP || '123456';

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
 *     summary: Send OTP to user's phone number
 *     tags: [Authentication]
 *     description: |
 *       Sends an OTP to the provided phone number.
 *       In staging mode (USE_STATIC_OTP=true), a static OTP is used.
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
 *                 devOtp:
 *                   type: string
 *                   description: Present only when static OTP mode is enabled
 *       400:
 *         description: Phone number is required
 *       500:
 *         description: Error sending OTP
 */
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone is required' });
        }

        const formattedPhone =
            phone.startsWith('91') ? phone : `91${phone}`;

        const otp = USE_STATIC_OTP ? STATIC_OTP : generateOTP();

        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        let user = await User.findOne({ phone: formattedPhone });

        if (!user) {
            user = await User.create({
                phone: formattedPhone,
                firstName: 'New',
                lastName: 'User',
                role: 'customer',
            });
        }

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        /**
         * TODO:
         * Enable real SMS integration when USE_STATIC_OTP=false
         */
        if (!USE_STATIC_OTP) {
            await axios.post(
                `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/ADDON_SERVICES/SEND/TSMS`,
                {
                    From: 'DEVMIT',
                    To: formattedPhone,
                    TemplateName: 'devmitra',
                    VAR1: otp,
                    VAR2: process.env.ANDROID_APP_HASH,
                }
            );
        } else {
            console.log(`Static OTP for ${formattedPhone}: ${otp}`);
        }

        res.json({
            message: 'OTP sent successfully',
            ...(USE_STATIC_OTP && { devOtp: STATIC_OTP }),
        });

    } catch (error: any) {
        res.status(500).json({
            message: 'Error sending OTP',
            error: error?.response?.data || error.message,
        });
    }
};

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login user
 *     tags: [Authentication]
 *     description: Verifies OTP and returns JWT token on success.
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
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 *       500:
 *         description: Error verifying OTP
 */
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp } = req.body;

        const formattedPhone =
            phone.startsWith('91') ? phone : `91${phone}`;

        const user = await User.findOne({ phone: formattedPhone });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (
            user.otp !== otp ||
            !user.otpExpiry ||
            user.otpExpiry < new Date()
        ) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.otp = null as any;
        user.otpExpiry = null as any;
        await user.save();

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user,
        });

    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with phone and OTP
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
 *         description: Login successful
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { phone, otp } = req.body;

        const formattedPhone =
            phone.startsWith('91') ? phone : `91${phone}`;

        const user = await User.findOne({ phone: formattedPhone });

        if (!user) {
            return res.status(404).json({
                status: 404,
                type: "error",
                title: "User Not Found",
                detail: "User does not exist",
                instance: "/api/auth/login",
            });
        }

        if (
            user.otp !== otp ||
            !user.otpExpiry ||
            user.otpExpiry < new Date()
        ) {
            return res.status(400).json({
                status: 400,
                type: "error",
                title: "Invalid OTP",
                detail: "Invalid or expired OTP",
                instance: "/api/auth/login",
            });
        }

        user.otp = null as any;
        user.otpExpiry = null as any;
        await user.save();

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            status: 200,
            type: "success",
            title: "Login Successful",
            detail: "User authenticated successfully",
            instance: "/api/auth/login",
            tokens: {
                access: accessToken,
                refresh: refreshToken,
                user: {
                    username: user.phone,
                    email: user.email || "",
                    first_name: user.firstName,
                    last_name: user.lastName,
                    mobile_number: user.phone,
                    user_type: user.role,
                    is_verified: user.isApproved,
                    is_active: !user.isBlocked,
                    state: user.city || "",
                    city: user.city || "",
                },
            },
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            type: "error",
            title: "Server Error",
            detail: "Something went wrong",
            instance: "/api/auth/login",
        });
    }
};