import mongoose, { Schema, Document } from 'mongoose';

export interface IHomeCard extends Document {
    title: string;
    description: string;
    buttonText: string;
    image: string;
    isActive: boolean;
}

const HomeCardSchema = new Schema<IHomeCard>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        buttonText: { type: String, required: true },
        image: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IHomeCard>('HomeCard', HomeCardSchema);