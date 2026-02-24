import express from 'express';

import {
    createPuja,
    getPujas,
    updatePuja,
    deletePuja,
} from '../controllers/pujaController';

const router = express.Router();

/**
 * @@swagger
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - basePrice
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               image:
 *                 type: string
 *               durationMinutes:
 *                 type: number
 *               defaultItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     defaultQuantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Puja created successfully
 */
router.post('/', createPuja);

/**
 * @swagger
 * /api/pujas:
 *   get:
 *     summary: Get all active Pujas
 *     tags: [Pujas]
 *     responses:
 *       200:
 *         description: List of active pujas
 */
router.get('/', getPujas);

/**
 * @swagger
 * /api/pujas/{id}:
 *   put:
 *     summary: Update a Puja
 *     tags: [Pujas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Puja updated successfully
 */
router.put('/:id', updatePuja);

/**
 * @swagger
 * /api/pujas/{id}:
 *   delete:
 *     summary: Soft delete a Puja
 *     tags: [Pujas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Puja deactivated successfully
 */
router.delete('/:id', deletePuja);

export default router;