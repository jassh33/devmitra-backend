import mongoose, { Schema, Document } from 'mongoose';
import { autoTranslateContent } from '../utils/translate';

export interface ILocalizedString {
    en: string;
    hi?: string;
    te?: string;
}

import { IPujaItemsBatch } from './PujaItemsBatch';

// Removed IPujaItemRef interface since it's now handled in PujaItemsBatch

export interface IPujaType extends Document {
    name: ILocalizedString;
    description: ILocalizedString;
    basePrice: number;
    image: string;
    durationMinutes: number;
    defaultItemsBatchId?: mongoose.Types.ObjectId | any;
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

// Removed PujaItemRefSchema since it's now handled in PujaItemsBatch

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
            type: String, // stores full Cloudinary HTTPS URL
        },
        durationMinutes: {
            type: Number,
            required: true,
            default: 120,
        },
        defaultItemsBatchId: {
            type: Schema.Types.ObjectId,
            ref: 'PujaItemsBatch',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

/**
 * Pre-save hook: auto-translate name, description and defaultItems
 * from English to Hindi (hi) and Telugu (te).
 *
 * IMPORTANT: this hook must be registered BEFORE mongoose.model() is called.
 */
PujaTypeSchema.pre('save', async function (next) {
    try {
        // --- Translate name ---
        if (this.name?.en && (this.isModified('name.en') || this.isNew)) {
            if (!this.name.hi || !this.name.te) {
                const translated = await autoTranslateContent(this.name.en);
                this.name.hi = translated.hi;
                this.name.te = translated.te;
            }
        }

        // --- Translate description ---
        if (this.description?.en && (this.isModified('description.en') || this.isNew)) {
            if (!this.description.hi || !this.description.te) {
                const translated = await autoTranslateContent(this.description.en);
                this.description.hi = translated.hi;
                this.description.te = translated.te;
            }
        }

        // Removed auto-translation of item names because they are now references
        // to pre-translated PujaItems in the PujaItem collection.

        next();
    } catch (err: any) {
        console.error('PujaType pre-save translation error:', err);
        next(err);
    }
});

PujaTypeSchema.virtual('displayName').get(function () {
    return this.name?.en || '';
});

PujaTypeSchema.set('toJSON', { virtuals: true });
PujaTypeSchema.set('toObject', { virtuals: true });

// Model must be created AFTER all hooks/virtuals are registered
const PujaType = mongoose.model<IPujaType>('PujaType', PujaTypeSchema);

export default PujaType;