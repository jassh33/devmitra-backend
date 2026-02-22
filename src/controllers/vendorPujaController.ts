import { Request, Response } from 'express';
import VendorPuja from '../models/VendorPuja';

// Map vendor to puja
export const assignPujaToVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId, pujaId } = req.body;

        const mapping = await VendorPuja.create({
            vendor: vendorId,
            puja: pujaId,
        });

        res.status(201).json(mapping);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning puja to vendor' });
    }
};

// Get pujas by vendor
export const getVendorPujas = async (req: Request, res: Response) => {
    try {
        const mappings = await VendorPuja.find({
            vendor: req.params.vendorId,
        }).populate('puja');

        res.json(mappings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendor pujas' });
    }
};