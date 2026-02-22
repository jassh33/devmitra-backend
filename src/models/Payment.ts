import mongoose, { Schema, Document } from 'mongoose';

export type PaymentResult = 'success' | 'failed';

export interface IPayment extends Document {
    booking: mongoose.Types.ObjectId;
    amount: number;
    transactionId: string;
    status: PaymentResult;
    createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
    {
        booking: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        transactionId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['success', 'failed'],
            required: true,
        },
    },
    { timestamps: true }
);

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;