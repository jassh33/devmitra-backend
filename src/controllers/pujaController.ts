import PujaType from '../models/PujaType';
import PujaItem from '../models/PujaItem';
import PujaItemsBatch from '../models/PujaItemsBatch';

/**
 * @swagger
 * /api/pujas:
 *   post:
 *     summary: Create a new Puja (auto-translates name, description & items to hi/te)
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
 *               - name
 *               - description
 *               - basePrice
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ganesh Puja"
 *                 description: "English name — will be auto-translated to hi and te"
 *               description:
 *                 type: string
 *                 example: "Traditional Ganesh worship ceremony"
 *               basePrice:
 *                 type: number
 *                 example: 2500
 *               image:
 *                 type: string
 *                 example: "https://res.cloudinary.com/..."
 *               durationMinutes:
 *                 type: number
 *                 example: 120
 *               defaultItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pujaItemId:
 *                       type: string
 *                       example: "64abc123def456"
 *                     defaultQuantity:
 *                       type: number
 *                       example: 2
 *     responses:
 *       201:
 *         description: Puja created successfully with translations
 *       500:
 *         description: Error creating puja
 */
export const createPuja = async (req: Request, res: Response) => {
    try {
        const { name, description, basePrice, image, durationMinutes, defaultItems } = req.body;

        // Accept plain English strings and wrap them into the LocalizedString shape.
        // The pre('save') hook will then auto-translate hi and te.
        const pujaData: any = {
            name: typeof name === 'string' ? { en: name } : name,
            description: typeof description === 'string' ? { en: description } : description,
            basePrice,
            image,
        };

        if (durationMinutes !== undefined) pujaData.durationMinutes = durationMinutes;

        if (Array.isArray(defaultItems)) {
            const batchItems = defaultItems.map((item: any) => ({
                pujaItemId: item.pujaItemId ?? item.id,
                quantity: item.defaultQuantity ?? item.quantity ?? 1,
                modifiedBy: 'admin',
            }));

            const batch = new PujaItemsBatch({ items: batchItems });
            await batch.save();
            pujaData.defaultItemsBatchId = batch._id;
        }

        const puja = new PujaType(pujaData);
        await puja.save(); // triggers pre('save') → translation
        res.status(201).json(puja);
    } catch (error: any) {
        console.error('Create Puja Error:', error);
        res.status(500).json({ message: error?.message || 'Error creating puja' });
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
 *         description: List of active pujas with translations
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
 *     summary: Update a puja (re-translates if English fields changed)
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
 *       404:
 *         description: Puja not found
 *       500:
 *         description: Error updating puja
 */
export const updatePuja = async (req: Request, res: Response) => {
    try {
        const puja = await PujaType.findById(req.params.id);
        if (!puja) {
            return res.status(404).json({ message: 'Puja not found' });
        }

        const { name, description, basePrice, image, durationMinutes, defaultItems, isActive } = req.body;

        // Wrap plain English strings into LocalizedString — hook will retranslate
        if (name !== undefined) {
            puja.name = typeof name === 'string' ? { en: name } : name;
        }
        if (description !== undefined) {
            puja.description = typeof description === 'string' ? { en: description } : description;
        }
        if (basePrice !== undefined) puja.basePrice = basePrice;
        if (image !== undefined) puja.image = image;
        if (durationMinutes !== undefined) puja.durationMinutes = durationMinutes;
        if (isActive !== undefined) puja.isActive = isActive;

        if (Array.isArray(defaultItems)) {
            const batchItems = defaultItems.map((item: any) => ({
                pujaItemId: item.pujaItemId ?? item.id,
                quantity: item.defaultQuantity ?? item.quantity ?? 1,
                modifiedBy: 'admin',
            }));

            const batch = new PujaItemsBatch({ items: batchItems });
            await batch.save();
            puja.defaultItemsBatchId = batch._id;
        }

        await puja.save(); // triggers pre('save') → translation if en changed
        res.json(puja);
    } catch (error: any) {
        console.error('Update Puja Error:', error);
        res.status(500).json({ message: error?.message || 'Error updating puja' });
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
        await PujaType.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ message: 'Puja deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting puja' });
    }
};

/**
 * @swagger
 * /api/pujas/items/standard:
 *   get:
 *     summary: Get a list of standard Puja & Decoration items
 *     tags: [Pujas]
 *     responses:
 *       200:
 *         description: List of standard items
 *       500:
 *         description: Error fetching items
 */
export const getStandardItems = async (req: Request, res: Response) => {
    try {
        const items = await PujaItem.find({ isActive: true });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching standard items' });
    }
};

/**
 * @swagger
 * /api/pujas/items/standard:
 *   post:
 *     summary: Create a new standard Puja Item (auto-translates)
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Incense Sticks"
 *     responses:
 *       201:
 *         description: Item created and auto-translated
 *       500:
 *         description: Error creating item
 */
export const createPujaItem = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        const itemData: any = {
            name: typeof name === 'string' ? { en: name } : name,
        };

        const item = new PujaItem(itemData);
        await item.save(); // triggers pre('save') to auto-translate

        res.status(201).json(item);
    } catch (error: any) {
        console.error('Create PujaItem Error:', error);
        res.status(500).json({ message: error?.message || 'Error creating puja item' });
    }
};