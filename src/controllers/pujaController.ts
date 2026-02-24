import { Request, Response } from 'express';
import PujaType from '../models/PujaType';

/**
 * @swagger
 * tags:
 *   name: Pujas
 *   description: Puja management APIs
 */

/**
 * @swagger
 * /api/pujas:
 *   post:
 *     summary: Create a new Puja
 *     tags: [Pujas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - displayName
 *               - basePrice
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: "Ganesh Puja"
 *               description:
 *                 type: string
 *                 example: "Special Ganesh Puja"
 *               basePrice:
 *                 type: number
 *                 example: 2500
 *               image:
 *                 type: string
 *                 example: "/public/pujas/12345.jpg"
 *               defaultItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Coconut"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *     responses:
 *       201:
 *         description: Puja created successfully
 *       500:
 *         description: Error creating puja
 */
export const createPuja = async (req: Request, res: Response) => {
    try {
        const puja = await PujaType.create(req.body);
        res.status(201).json(puja);
    } catch (error) {
        res.status(500).json({ message: 'Error creating puja' });
    }
};

/**
 * @swagger
 * /api/pujas:
 *   get:
 *     summary: Get all active pujas
 *     tags: [Pujas]
 *     responses:
 *       200:
 *         description: List of active pujas
 *       500:
 *         description: Error fetching pujas
 */
export const getPujas = async (req: Request, res: Response) => {
    try {
        const pujas = await PujaType.find({ isActive: true });
        res.json(pujas);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pujas' });
    }
};

/**
 * @swagger
 * /api/pujas/{id}:
 *   put:
 *     summary: Update a puja
 *     tags: [Pujas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Puja updated successfully
 *       500:
 *         description: Error updating puja
 */
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

/**
 * @swagger
 * /api/pujas/{id}:
 *   delete:
 *     summary: Soft delete a puja
 *     tags: [Pujas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Puja deactivated successfully
 *       500:
 *         description: Error deleting puja
 */
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