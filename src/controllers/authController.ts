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

/**
 * SEND OTP
 */
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { phone, appHash } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone is required' });
        }

        // Ensure Indian country code
        const formattedPhone =
            phone.startsWith('91') ? phone : `91${phone}`;

        const otp = generateOTP();
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

        const response = await axios.post(
            `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/ADDON_SERVICES/SEND/TSMS`,
            {
                From: "DEVMIT",
                To: formattedPhone,
                TemplateName: "devmitra",
                VAR1: otp,
                VAR2: process.env.ANDROID_APP_HASH,
            }
        );

        console.log("2Factor Response:", response.data);

        res.json({ message: 'OTP sent successfully' });

    } catch (error: any) {
        console.error(
            "2Factor Error:",
            error?.response?.data || error.message
        );

        res.status(500).json({
            message: 'Error sending OTP',
            error: error?.response?.data || error.message,
        });
    }
};
/**
 * VERIFY OTP
 */
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp } = req.body;

        const user = await User.findOne({ phone });

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

        user.otp = null;
        user.otpExpiry = null;
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