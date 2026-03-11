import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus =
    | 'pending'
    | 'requested'
    | 'accepted'
    | 'rejected'
    | 'completed'
    | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

import { IPujaItem } from './PujaItem';

import { IPujaItemsBatch } from './PujaItemsBatch';

// Removed IBookingItem interface since it's now handled in PujaItemsBatch

export interface IBooking extends Document {
    customer: mongoose.Types.ObjectId;
    vendor?: mongoose.Types.ObjectId;
    puja?: mongoose.Types.ObjectId;
    availability?: mongoose.Types.ObjectId;

    date: string;
    time: string;

    pujaItemsBatchId?: mongoose.Types.ObjectId | any;

    vendorFee: number;
    totalAmount: number;

    status: BookingStatus;
    paymentStatus: PaymentStatus;

    createdAt: Date;
    updatedAt: Date;
}

const LocalizedStringSchema = new Schema(
    {
        en: { type: String, required: true },
        hi: { type: String },
        te: { type: String }
    },
    { _id: false }
);

// Removed BookingItemSchema since it's now handled in PujaItemsBatch

const BookingSchema = new Schema<IBooking>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        puja: {
            type: Schema.Types.ObjectId,
            ref: 'PujaType',
        },
        availability: {
            type: Schema.Types.ObjectId,
            ref: 'Availability',
        },
        date: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        pujaItemsBatchId: {
            type: Schema.Types.ObjectId,
            ref: 'PujaItemsBatch',
        },
        vendorFee: {
            type: Number,
            required: true,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [
                'pending',
                'requested',
                'accepted',
                'rejected',
                'completed',
                'cancelled',
            ],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

BookingSchema.pre('save', async function (next) {
    // Items now reference the PujaItem collection which inherently
    // handles translations on creation/update. No need to translate names here.
    next();
});

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;