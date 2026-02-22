import { Request, Response } from 'express';
import Availability from '../models/Availability';
import {AuthRequest} from "../middleware/authMiddleware";

// Create availability slot
export const createAvailability = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user.id !== req.body.vendor) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const availability = await Availability.create(req.body);

        res.status(201).json(availability);
    } catch (error) {
        res.status(500).json({ message: 'Error creating availability' });
    }
};

// Get availability by vendor
export const getVendorAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId } = req.params;

        if (req.user.id !== vendorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const slots = await Availability.find({ vendor: vendorId });

        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability' });
    }
};