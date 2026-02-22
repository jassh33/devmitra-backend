import mongoose, { Schema, Document } from 'mongoose';

export interface IPujaItem {
    name: string;
    defaultQuantity: number;
}

export interface IPujaType extends Document {
    name: string;
    description: string;
    basePrice: number;
    image: string;
    durationMinutes: number;
    defaultItems: IPujaItem[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PujaItemSchema = new Schema<IPujaItem>({
    name: { type: String, required: true },
    defaultQuantity: { type: Number, required: true, default: 1 },
});

const PujaTypeSchema = new Schema<IPujaType>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        basePrice: {
            type: Number,
            required: true,
        },
        image: {
            type: String, // stores image URL path
            required: true,
        },
        durationMinutes: {
            type: Number,
            required: true,
            default: 120,
        },
        defaultItems: [PujaItemSchema],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const PujaType = mongoose.model<IPujaType>('PujaType', PujaTypeSchema);

PujaTypeSchema.virtual('displayName').get(function () {
    return this.name;
});

PujaTypeSchema.set('toJSON', { virtuals: true });
PujaTypeSchema.set('toObject', { virtuals: true });

export default PujaType;