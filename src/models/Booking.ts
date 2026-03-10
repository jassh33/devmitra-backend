import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus =
    | 'pending'
    | 'requested'
    | 'accepted'
    | 'rejected'
    | 'completed'
    | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

import { ILocalizedString } from './PujaType';

interface IBookingItem {
    name: ILocalizedString;
    quantity: number;
    modifiedBy: 'customer' | 'vendor' | 'admin';
}

export interface IBooking extends Document {
    customer: mongoose.Types.ObjectId;
    vendor?: mongoose.Types.ObjectId;
    puja?: mongoose.Types.ObjectId;
    availability?: mongoose.Types.ObjectId;

    date: string;
    time: string;

    bookingItems: IBookingItem[];

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

const BookingItemSchema = new Schema<IBookingItem>({
    name: { type: LocalizedStringSchema, required: true },
    quantity: { type: Number, required: true },
    modifiedBy: {
        type: String,
        enum: ['customer', 'vendor', 'admin'],
        required: true,
    },
});

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
        bookingItems: [BookingItemSchema],
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

import { autoTranslateContent } from '../utils/translate';

BookingSchema.pre('save', async function (next) {
    if (this.bookingItems && this.bookingItems.length > 0) {
        for (let item of this.bookingItems) {
            if (item.name && item.name.en && (this.isModified('bookingItems') || this.isNew)) {
               if (!item.name.hi || !item.name.te) {
                   const translated = await autoTranslateContent(item.name.en);
                   item.name.hi = translated.hi;
                   item.name.te = translated.te;
               }
            }
        }
    }
    next();
});

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;