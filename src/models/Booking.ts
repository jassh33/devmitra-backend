import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus =
    | 'pending'
    | 'requested'
    | 'accepted'
    | 'rejected'
    | 'completed'
    | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

interface IBookingItem {
    name: string;
    quantity: number;
    modifiedBy: 'customer' | 'vendor' | 'admin';
}

export interface IBooking extends Document {
    customer: mongoose.Types.ObjectId;
    vendor?: mongoose.Types.ObjectId;
    puja: mongoose.Types.ObjectId;
    availability: mongoose.Types.ObjectId;

    bookingItems: IBookingItem[];

    totalAmount: number;

    status: BookingStatus;
    paymentStatus: PaymentStatus;

    createdAt: Date;
    updatedAt: Date;
}

const BookingItemSchema = new Schema<IBookingItem>({
    name: { type: String, required: true },
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
            required: true,
        },
        availability: {
            type: Schema.Types.ObjectId,
            ref: 'Availability',
            required: true,
        },
        bookingItems: [BookingItemSchema],
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

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;