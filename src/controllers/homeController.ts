import { Request, Response } from 'express';
import HomeCard from '../models/HomeCard';

export const getHomeCards = async (req: Request, res: Response) => {
    try {
        const cards = await HomeCard.find({ isActive: true });

        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching home cards' });
    }
};