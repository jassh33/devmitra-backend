import mongoose, { Schema, Document } from 'mongoose';
import { autoTranslateContent } from '../utils/translate';

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
            type: String, // stores full Cloudinary HTTPS URL
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

        // --- Translate each defaultItem name ---
        if (this.defaultItems?.length > 0 && (this.isModified('defaultItems') || this.isNew)) {
            for (const item of this.defaultItems) {
                if (item.name?.en && (!item.name.hi || !item.name.te)) {
                    const translated = await autoTranslateContent(item.name.en);
                    item.name.hi = translated.hi;
                    item.name.te = translated.te;
                }
            }
        }

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