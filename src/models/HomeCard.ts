import mongoose, { Schema, Document } from 'mongoose';

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
        image: { type: String },
        cardColor: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

import { autoTranslateContent } from '../utils/translate';

HomeCardSchema.pre('save', async function (next) {
    if (this.isModified('title.en') || this.isNew) {
        if (!this.title.hi || !this.title.te) {
            const translated = await autoTranslateContent(this.title.en);
            this.title = { ...this.title, hi: translated.hi, te: translated.te };
        }
    }
    if (this.isModified('description.en') || this.isNew) {
        if (!this.description.hi || !this.description.te) {
            const translated = await autoTranslateContent(this.description.en);
            this.description = { ...this.description, hi: translated.hi, te: translated.te };
        }
    }
    if (this.isModified('buttonText.en') || this.isNew) {
        if (!this.buttonText.hi || !this.buttonText.te) {
            const translated = await autoTranslateContent(this.buttonText.en);
            this.buttonText = { ...this.buttonText, hi: translated.hi, te: translated.te };
        }
    }
    next();
});

export default mongoose.model<IHomeCard>('HomeCard', HomeCardSchema);