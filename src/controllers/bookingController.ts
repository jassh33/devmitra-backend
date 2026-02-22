import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Availability from '../models/Availability';
import {AuthRequest} from "../middleware/authMiddleware";

// Create Booking
export const createBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.create(req.body);

        // Mark availability slot as booked
        await Availability.findByIdAndUpdate(req.body.availability, {
            isBooked: true,
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking' });
    }
};

// Get bookings by customer
export const getCustomerBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { customerId } = req.params;

        if (req.user.id !== customerId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const bookings = await Booking.find({ customer: customerId });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};

// Vendor accept booking
export const acceptBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'accepted' },
            { new: true }
        );

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error accepting booking' });
    }
};

// Vendor reject booking
export const rejectBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {status: 'rejected'},
            {new: true}
        );

        res.json(booking);
    } catch (error) {
        res.status(500).json({message: 'Error rejecting booking'});
    }
};
    // Admin assign vendor to booking
    export const assignVendor = async (req: Request, res: Response) => {
        try {
            const { vendorId } = req.body;

            const booking = await Booking.findByIdAndUpdate(
                req.params.id,
                {
                    vendor: vendorId,
                    status: 'requested',
                },
                { new: true }
            );

            res.json(booking);
        } catch (error) {
            res.status(500).json({ message: 'Error assigning vendor' });
        }
    };
// Get bookings by vendor (with optional status filter)
export const getVendorBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { vendorId } = req.params;

        if (req.user.id !== vendorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const filter: any = { vendor: vendorId };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const bookings = await Booking.find(filter);

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vendor bookings' });
    }
};