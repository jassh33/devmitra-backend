import mongoose, { Schema, Document } from 'mongoose';

export interface ILocalizedString {
    en: string;
    hi?: string;
    te?: string;
}

export interface IPujaItem {
    name: ILocalizedString;
    defaultQuantity: number;
}

export interface IPujaType extends Document {
    name: ILocalizedString;
    description: ILocalizedString;
    basePrice: number;
    image: string;
    durationMinutes: number;
    defaultItems: IPujaItem[];
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

const PujaItemSchema = new Schema<IPujaItem>({
    name: { type: LocalizedStringSchema, required: true },
    defaultQuantity: { type: Number, required: true, default: 1 },
});

const PujaTypeSchema = new Schema<IPujaType>(
    {
        name: {
            type: LocalizedStringSchema,
            required: true,
            unique: true,
        },
        description: {
            type: LocalizedStringSchema,
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

import { autoTranslateContent } from '../utils/translate';

PujaTypeSchema.pre('save', async function (next) {
    if (this.isModified('name.en') || this.isNew) {
        if (!this.name.hi || !this.name.te) {
            const translated = await autoTranslateContent(this.name.en);
            this.name = { ...this.name, hi: translated.hi, te: translated.te };
        }
    }
    if (this.isModified('description.en') || this.isNew) {
        if (!this.description.hi || !this.description.te) {
            const translated = await autoTranslateContent(this.description.en);
            this.description = { ...this.description, hi: translated.hi, te: translated.te };
        }
    }

    if (this.defaultItems && this.defaultItems.length > 0) {
        for (let item of this.defaultItems) {
            if (this.isModified('defaultItems') || this.isNew) {
               if (!item.name.hi || !item.name.te) {
                   const translated = await autoTranslateContent(item.name.en);
                   item.name = { ...item.name, hi: translated.hi, te: translated.te };
               }
            }
        }
    }
    next();
});

PujaTypeSchema.virtual('displayName').get(function () {
    return this.name?.en || '';
});

PujaTypeSchema.set('toJSON', { virtuals: true });
PujaTypeSchema.set('toObject', { virtuals: true });

export default PujaType;