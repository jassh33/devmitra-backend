import { Request, Response } from 'express';
import User from '../models/User';



export const createCustomer = async (req: Request, res: Response) => {
    try {
        const customer = await User.create({
            ...req.body,
            role: 'customer',
            isApproved: true,
            isBlocked: false,
        });

        res.status(201).json(customer);
    } catch (error: any) {
        console.error("Create Customer Error:", error);

        res.status(500).json({
            message: error?.message || "Server error",
            stack: error?.stack,
        });
    }
};

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await User.find({ role: 'customer' });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers' });
    }
};