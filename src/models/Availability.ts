import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailability extends Document {
    vendor: mongoose.Types.ObjectId;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    isBooked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AvailabilitySchema = new Schema<IAvailability>(
    {
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        isBooked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Availability = mongoose.model<IAvailability>(
    'Availability',
    AvailabilitySchema
);

export default Availability;