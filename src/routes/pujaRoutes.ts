import express from 'express';
import { createPuja, getPujas, updatePuja, deletePuja } from '../controllers/pujaController';

const router = express.Router();

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
 *     description: |
 *       Creates a puja. Pass plain English strings for `name`, `description`, and item `name` —
 *       the server auto-translates them to Hindi (hi) and Telugu (te) before saving.
 *
 *       **Typical workflow:**
 *       1. `POST /api/upload/puja` → upload image → get `imageUrl`
 *       2. `POST /api/pujas` → use `imageUrl` as the `image` field
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
 *                 example: "Ganesh Puja"
 *                 description: English name — auto-translated to hi and te
 *               description:
 *                 type: string
 *                 example: "Traditional Ganesh worship ceremony with full rituals"
 *                 description: English description — auto-translated to hi and te
 *               basePrice:
 *                 type: number
 *                 example: 2500
 *               image:
 *                 type: string
 *                 example: "https://res.cloudinary.com/drnbnse1z/image/upload/..."
 *                 description: Full Cloudinary URL from POST /api/upload/puja
 *               durationMinutes:
 *                 type: number
 *                 example: 120
 *               defaultItems:
 *                 type: array
 *                 description: Items required for the puja (names auto-translated)
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Coconut"
 *                     defaultQuantity:
 *                       type: number
 *                       example: 2
 *     responses:
 *       201:
 *         description: Puja created with auto-translated name, description and item names
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PujaType'
 *       500:
 *         description: Error creating puja
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createPuja);

/**
 * @swagger
 * /api/pujas:
 *   get:
 *     summary: Get all active Pujas
 *     description: Returns all pujas where `isActive = true`. Each puja includes name, description and item names in English, Hindi and Telugu.
 *     tags: [Pujas]
 *     responses:
 *       200:
 *         description: List of active pujas with translations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PujaType'
 *       500:
 *         description: Error fetching pujas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getPujas);

/**
 * @swagger
 * /api/pujas/{id}:
 *   put:
 *     summary: Update a Puja (re-translates if English fields change)
 *     description: |
 *       Updates puja fields. If `name`, `description` or item names are changed,
 *       they will be re-translated automatically.
 *       Pass plain English strings — the server handles translation.
 *     tags: [Pujas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB _id of the puja
 *         schema:
 *           type: string
 *           example: "64abc123def456"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Lakshmi Puja"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               basePrice:
 *                 type: number
 *                 example: 3000
 *               image:
 *                 type: string
 *                 example: "https://res.cloudinary.com/..."
 *               durationMinutes:
 *                 type: number
 *                 example: 90
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Puja updated with re-translated fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PujaType'
 *       404:
 *         description: Puja not found
 *       500:
 *         description: Error updating puja
 */
router.put('/:id', updatePuja);

/**
 * @swagger
 * /api/pujas/{id}:
 *   delete:
 *     summary: Soft delete a Puja (sets isActive = false)
 *     description: Does not remove the document — sets `isActive = false` so it no longer appears in GET /api/pujas.
 *     tags: [Pujas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB _id of the puja
 *         schema:
 *           type: string
 *           example: "64abc123def456"
 *     responses:
 *       200:
 *         description: Puja deactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Puja deactivated successfully"
 *       500:
 *         description: Error deleting puja
 */
router.delete('/:id', deletePuja);

export default router;