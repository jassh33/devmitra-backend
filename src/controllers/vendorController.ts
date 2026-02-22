import { Request, Response } from 'express';
import User from '../models/User';

// Create Vendor
export const createVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await User.create({
            ...req.body,
            role: 'vendor',
        });

        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error creating vendor' });
    }
};

// Get All Vendors
export const getVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await User.find({ role: 'vendor' });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendors' });
    }
};

// Approve Vendor
export const approveVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error approving vendor' });
    }
};

// Block Vendor
export const blockVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true }
        );

        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: 'Error blocking vendor' });
    }
};