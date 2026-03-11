import mongoose, { Schema, Document } from 'mongoose';

export interface IBatchItem {
    pujaItemId: mongoose.Types.ObjectId | any; // Any allows for populated docs
    quantity: number;
    modifiedBy: 'customer' | 'vendor' | 'admin';
}

export interface IPujaItemsBatch extends Document {
    items: IBatchItem[];
    createdAt: Date;
    updatedAt: Date;
}

const BatchItemSchema = new Schema<IBatchItem>(
    {
        pujaItemId: { type: Schema.Types.ObjectId, ref: 'PujaItem', required: true },
        quantity: { type: Number, required: true },
        modifiedBy: {
            type: String,
            enum: ['customer', 'vendor', 'admin'],
            required: true,
            default: 'admin',
        },
    },
    { _id: false }
);

const PujaItemsBatchSchema = new Schema<IPujaItemsBatch>(
    {
        items: [BatchItemSchema],
    },
    { timestamps: true }
);

const PujaItemsBatch = mongoose.model<IPujaItemsBatch>('PujaItemsBatch', PujaItemsBatchSchema);

export default PujaItemsBatch;
