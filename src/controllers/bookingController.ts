import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Availability from '../models/Availability';
import User from '../models/User';
import PujaType from '../models/PujaType';
import PujaItem from '../models/PujaItem';
import PujaItemsBatch from '../models/PujaItemsBatch';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management APIs
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking (Puja Only, Pandit Only, or Both)
 *     description: |
 *       Creates a new booking. 
 *       - **Puja Only**: Books the Puja, admin assigns Pandit later (`status: pending`).
 *       - **Pandit Only**: Books the Pandit, checks availability (`status: requested`).
 *       - **Both**: Books both, checks Pandit availability (`status: requested`).
 *       
 *       Automatically calculates total amount = puja.basePrice + vendorFee.
 *       Automatically adds default Puja items if `bookingItems` is omitted.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - time
 *             properties:
 *               vendorId:
 *                 type: string
 *                 description: Optional. The ID of the specific Pandit to book.
 *                 example: "64abc123def456"
 *               pujaId:
 *                 type: string
 *                 description: Optional. The ID of the specific Puja to perform.
 *                 example: "64xyz987def654"
 *               date:
 *                 type: string
 *                 example: "2025-12-24"
 *               time:
 *                 type: string
 *                 example: "09:00 AM - 11:00 AM"
 *               bookingItems:
 *                 type: array
 *                 description: Optional custom puja/decoration items. If omitted and pujaId is provided, defaults are used.
 *                 items:
 *                   type: object
 *                   properties:
 *                     pujaItemId:
 *                       type: string
 *                     customItemName:
 *                       type: string
 *                       description: 'If taking a new custom item from user'
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input or Pandit is already booked at that time
 *       500:
 *         description: Server error
 */
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId, pujaId, date, time, bookingItems } = req.body;
        const customerId = req.user?.id || req.user?._id;

        if (!date || !time) {
            return res.status(400).json({ message: 'Date and time are required' });
        }

        if (!vendorId && !pujaId) {
            return res.status(400).json({ message: 'Must select at least a Puja or a Pandit' });
        }

        let vendorFee = 0;
        let pujaPrice = 0;
        let finalBookingItems = bookingItems || [];

        // 1. If Puja is selected
        if (pujaId) {
            const puja = await PujaType.findById(pujaId);
            if (!puja) {
                return res.status(404).json({ message: 'Puja not found' });
            }
            pujaPrice = puja.basePrice || 0;

            // If no custom items passed, use default items
            if (!bookingItems || bookingItems.length === 0) {
                // If the PujaType has a default batch, fetch it
                if (puja.defaultItemsBatchId) {
                    const defaultBatch = await PujaItemsBatch.findById(puja.defaultItemsBatchId);
                    if (defaultBatch) {
                        finalBookingItems = defaultBatch.items.map((item: any) => ({
                            pujaItemId: item.pujaItemId,
                            quantity: item.quantity,
                            modifiedBy: 'customer'
                        }));
                    }
                }
            }
        }

        // Ensure if bookingItems are manually provided they are correctly formatted
        if (bookingItems && bookingItems.length > 0) {
            let processedBookingItems: any[] = [];
            for (const item of bookingItems) {
                if (item.pujaItemId || item.id) {
                    processedBookingItems.push({
                        pujaItemId: item.pujaItemId ?? item.id,
                        quantity: Number(item.quantity) || 1,
                        modifiedBy: "customer"
                    });
                } else if (item.customItemName) {
                    let existingItem = await PujaItem.findOne({ "name.en": { $regex: new RegExp('^' + item.customItemName.trim() + '$', "i") } });
                    if (!existingItem) {
                        existingItem = await PujaItem.create({
                            name: { en: item.customItemName.trim() },
                            isActive: true
                        });
                    }
                    processedBookingItems.push({
                        pujaItemId: existingItem._id,
                        quantity: Number(item.quantity) || 1,
                        modifiedBy: "customer"
                    });
                }
            }
            finalBookingItems = processedBookingItems;
        }

        // 2. If Vendor is selected (check availability)
        if (vendorId) {
            const vendor = await User.findById(vendorId);
            if (!vendor || vendor.role !== 'vendor') {
                return res.status(404).json({ message: 'Vendor (Pandit) not found' });
            }
            vendorFee = vendor.fee || 0;

            // Check if vendor already has a booking on this date/time that isn't cancelled/rejected
            const overlappingBooking = await Booking.findOne({
                vendor: vendorId,
                date,
                time,
                status: { $nin: ['cancelled', 'rejected'] }
            });

            if (overlappingBooking) {
                return res.status(400).json({ message: 'Pandit is already booked at this date and time' });
            }
        }

        const totalAmount = pujaPrice + vendorFee;

        // Create the Batch collection
        let pujaItemsBatchId = null;
        if (finalBookingItems.length > 0) {
            const batch = new PujaItemsBatch({ items: finalBookingItems });
            await batch.save();
            pujaItemsBatchId = batch._id;
        }

        const newBooking = await Booking.create({
            customer: customerId,
            vendor: vendorId || undefined,
            puja: pujaId || undefined,
            date,
            time,
            vendorFee,
            totalAmount,
            pujaItemsBatchId,
            status: vendorId ? 'requested' : 'pending', // If no vendor, it's pending admin assignment
            paymentStatus: 'pending'
        });

        res.status(201).json(newBooking);

    } catch (error: any) {
        console.error('Booking Error:', error);
        res.status(500).json({ message: error?.message || 'Error creating booking' });
    }
};

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get logged-in user's bookings
 *     description: Returns the booking history for the current user. If the user is a customer, returns bookings they made. If vendor, returns bookings assigned to them. Automatically populates `vendor` and `puja` details for displaying on the History screen.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Booking'
 *                   - type: object
 *                     properties:
 *                       vendor:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: object
 *                             properties:
 *                               en:
 *                                 type: string
 *                           lastName:
 *                             type: object
 *                             properties:
 *                               en:
 *                                 type: string
 *                       puja:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: object
 *                             properties:
 *                               en:
 *                                 type: string
 *       500:
 *         description: Server error
 */
export const getMyBookings = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const role = req.user?.role;

        const query = role === 'vendor' ? { vendor: userId } : { customer: userId };

        const bookings = await Booking.find(query)
            .populate('vendor', 'firstName lastName profileImage phone city fee')
            .populate('puja', 'name image durationMinutes basePrice')
            .populate('customer', 'firstName lastName phone city')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error: any) {
        console.error('Get Bookings Error:', error);
        res.status(500).json({ message: error?.message || 'Error fetching bookings' });
    }
};

/**
 * @swagger
 * /api/bookings/{id}/accept:
 *   patch:
 *     summary: Vendor accepts booking
 *     tags: [Bookings]
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
 *         description: Booking accepted
 *       500:
 *         description: Error accepting booking
 */
export const acceptBooking = async (req: AuthRequest, res: Response) => {
    try {
        // Only the assigned vendor should be able to accept
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, vendor: req.user?.id },
            { status: 'accepted' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not assigned to you' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error accepting booking' });
    }
};

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   patch:
 *     summary: Vendor rejects booking
 *     tags: [Bookings]
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
 *         description: Booking rejected
 *       500:
 *         description: Error rejecting booking
 */
export const rejectBooking = async (req: AuthRequest, res: Response) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, vendor: req.user?.id },
            { status: 'rejected' },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not assigned to you' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting booking' });
    }
};

/**
 * @swagger
 * /api/bookings/{id}/assign:
 *   patch:
 *     summary: Admin assigns vendor to a pending booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *             properties:
 *               vendorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor assigned successfully
 *       500:
 *         description: Error assigning vendor
 */
export const assignVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.body;

        const vendor = await User.findById(vendorId);
        if(!vendor || vendor.role !== 'vendor') {
             return res.status(404).json({ message: 'Vendor not found' });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                vendor: vendorId,
                vendorFee: vendor.fee || 0, // Update fee on assignment
                status: 'requested',
            },
            { new: true }
        );

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning vendor' });
    }
};