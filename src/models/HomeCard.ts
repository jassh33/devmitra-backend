import mongoose, { Schema, Document } from 'mongoose';
import { autoTranslateContent } from '../utils/translate';

export interface ILocalizedString {
    en: string;
    hi?: string;
    te?: string;
}

export interface IHomeCard extends Document {
    title: ILocalizedString;
    description: ILocalizedString;
    buttonText: ILocalizedString;
    image: string;
    cardColor: string;
    isActive: boolean;
}

const LocalizedStringSchema = new Schema(
    {
        en: { type: String, required: true },
        hi: { type: String },
        te: { type: String }
    },
    { _id: false }
);

const HomeCardSchema = new Schema<IHomeCard>(
    {
        title: { type: LocalizedStringSchema, required: true },
        description: { type: LocalizedStringSchema, required: true },
        buttonText: { type: LocalizedStringSchema, required: true },
        image: { type: String },        // full Cloudinary HTTPS URL
        cardColor: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Pre-save hook must be registered BEFORE mongoose.model() is called
HomeCardSchema.pre('save', async function (next) {
    try {
        if (this.title?.en && (this.isModified('title.en') || this.isNew)) {
            if (!this.title.hi || !this.title.te) {
                const translated = await autoTranslateContent(this.title.en);
                this.title.hi = translated.hi;
                this.title.te = translated.te;
            }
        }
        if (this.description?.en && (this.isModified('description.en') || this.isNew)) {
            if (!this.description.hi || !this.description.te) {
                const translated = await autoTranslateContent(this.description.en);
                this.description.hi = translated.hi;
                this.description.te = translated.te;
            }
        }
        if (this.buttonText?.en && (this.isModified('buttonText.en') || this.isNew)) {
            if (!this.buttonText.hi || !this.buttonText.te) {
                const translated = await autoTranslateContent(this.buttonText.en);
                this.buttonText.hi = translated.hi;
                this.buttonText.te = translated.te;
            }
        }
        next();
    } catch (err: any) {
        console.error('HomeCard pre-save translation error:', err);
        next(err);
    }
});

export default mongoose.model<IHomeCard>('HomeCard', HomeCardSchema);