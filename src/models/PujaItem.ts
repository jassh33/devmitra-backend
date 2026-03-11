import mongoose, { Schema, Document } from 'mongoose';
import { autoTranslateContent } from '../utils/translate';

export interface ILocalizedString {
    en: string;
    hi?: string;
    te?: string;
}

export interface IPujaItem extends Document {
    name: ILocalizedString;
    isActive: boolean;
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

const PujaItemSchema = new Schema<IPujaItem>(
    {
        name: {
            type: LocalizedStringSchema,
            required: true,
            unique: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

PujaItemSchema.pre('save', async function (next) {
    try {
        if (this.name?.en && (this.isModified('name.en') || this.isNew)) {
            if (!this.name.hi || !this.name.te) {
                const translated = await autoTranslateContent(this.name.en);
                this.name.hi = translated.hi;
                this.name.te = translated.te;
            }
        }
        next();
    } catch (err: any) {
        console.error('PujaItem pre-save translation error:', err);
        next(err);
    }
});

const PujaItem = mongoose.model<IPujaItem>('PujaItem', PujaItemSchema);

export default PujaItem;
