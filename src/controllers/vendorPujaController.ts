import { Request, Response } from 'express';
import VendorPuja from '../models/VendorPuja';

/**
 * @swagger
 * tags:
 *   name: VendorPuja
 *   description: Assign and manage pujas for vendors
 */

/**
 * @swagger
 * /api/vendor-pujas:
 *   post:
 *     summary: Assign a puja to a vendor (Admin only)
 *     tags: [VendorPuja]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *               - pujaId
 *             properties:
 *               vendorId:
 *                 type: string
 *                 example: "65f123abc456def7890"
 *               pujaId:
 *                 type: string
 *                 example: "65f999abc456def1111"
 *     responses:
 *       201:
 *         description: Puja assigned to vendor successfully
 *       500:
 *         description: Error assigning puja to vendor
 */
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

/**
 * @swagger
 * /api/vendor-pujas/{vendorId}:
 *   get:
 *     summary: Get all pujas assigned to a vendor
 *     tags: [VendorPuja]
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pujas assigned to vendor
 *       500:
 *         description: Error fetching vendor pujas
 */
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