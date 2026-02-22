import { Request, Response } from 'express';
import PujaType from '../models/PujaType';

// Create Puja
export const createPuja = async (req: Request, res: Response) => {
    try {
        const puja = await PujaType.create(req.body);
        res.status(201).json(puja);
    } catch (error) {
        res.status(500).json({ message: 'Error creating puja' });
    }
};

// Get All Active Pujas
export const getPujas = async (req: Request, res: Response) => {
    try {
        const pujas = await PujaType.find({ isActive: true });
        res.json(pujas);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pujas' });
    }
};

// Update Puja
export const updatePuja = async (req: Request, res: Response) => {
    try {
        const puja = await PujaType.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(puja);
    } catch (error) {
        res.status(500).json({ message: 'Error updating puja' });
    }
};

// Soft Delete Puja
export const deletePuja = async (req: Request, res: Response) => {
    try {
        await PujaType.findByIdAndUpdate(req.params.id, {
            isActive: false,
        });
        res.json({ message: 'Puja deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting puja' });
    }
};