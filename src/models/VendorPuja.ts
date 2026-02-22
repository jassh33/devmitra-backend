import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorPuja extends Document {
    vendor: mongoose.Types.ObjectId;
    puja: mongoose.Types.ObjectId;
    createdAt: Date;
}

const VendorPujaSchema = new Schema<IVendorPuja>(
    {
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        puja: {
            type: Schema.Types.ObjectId,
            ref: 'PujaType',
            required: true,
        },
    },
    { timestamps: true }
);

const VendorPuja = mongoose.model<IVendorPuja>(
    'VendorPuja',
    VendorPujaSchema
);

export default VendorPuja;