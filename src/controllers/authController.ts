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
            return res.status(404).json({ message: 'phone number not registered' });
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

export const login = async (req: Request, res: Response) => {
    try {
        const BASE_URL =
            process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
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
                    username: user.firstName + " " + user.lastName,
                    email: user.email || "",
                    first_name: user.firstName,
                    last_name: user.lastName,
                    mobile_number: user.phone,
                    user_type: user.role,
                    is_verified: user.isApproved,
                    is_active: !user.isBlocked,
                    state: user.city || "",
                    city: user.city || "",
                    gender: user.gender || null,
                    profile_image: user.profileImage
                        ? user.profileImage
                        : null,
                },
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            type: "error",
            title: "Server Error",
            detail: error,
            instance: "/api/auth/login",
        });
    }
};