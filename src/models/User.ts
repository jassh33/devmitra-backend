import mongoose, { Schema, Document } from 'mongoose';
import { autoTranslateContent } from '../utils/translate';

export type UserRole = 'customer' | 'vendor' | 'admin';

import { ILocalizedString } from './PujaType';

export interface IUser extends Document {
    firstName: ILocalizedString;
    lastName: ILocalizedString;
    phone: string;
    otp?: string | null;
    otpExpiry?: Date | null;
    email?: string;
    role: UserRole;

    // Location
    city?: ILocalizedString;
    address?: ILocalizedString;
    location?: {
        lat: number;
        lng: number;
    };

    // Vendor specific
    poojariCategory?: ILocalizedString;
    languages?: string[];
    studyPlace?: ILocalizedString;
    experience?: number;
    profileImage?: string;
    isApproved: boolean;
    isBlocked: boolean;

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

const UserSchema = new Schema<IUser>(
    {
        firstName: { type: LocalizedStringSchema, required: true },
        lastName: { type: LocalizedStringSchema, required: true },
        phone: { type: String, required: true, unique: true },
        otp: { type: String, default: null },
        otpExpiry: { type: Date, default: null },
        email: { type: String, lowercase: true, trim: true },
        role: {
            type: String,
            enum: ['customer', 'vendor', 'admin'],
            default: 'customer',
        },
        city: { type: LocalizedStringSchema },
        address: { type: LocalizedStringSchema },
        location: {
            lat: { type: Number },
            lng: { type: Number },
        },
        poojariCategory: { type: LocalizedStringSchema },
        languages: [{ type: String }],
        studyPlace: { type: LocalizedStringSchema },
        experience: { type: Number },
        profileImage: { type: String },
        isApproved: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Pre-save hook MUST be registered before mongoose.model() is called
UserSchema.pre('save', async function (next) {
    try {
        if (this.firstName?.en && (this.isModified('firstName.en') || this.isNew)) {
            if (!this.firstName.hi || !this.firstName.te) {
                const translated = await autoTranslateContent(this.firstName.en);
                this.firstName.hi = translated.hi;
                this.firstName.te = translated.te;
            }
        }
        if (this.lastName?.en && (this.isModified('lastName.en') || this.isNew)) {
            if (!this.lastName.hi || !this.lastName.te) {
                const translated = await autoTranslateContent(this.lastName.en);
                this.lastName.hi = translated.hi;
                this.lastName.te = translated.te;
            }
        }
        if (this.city?.en && (this.isModified('city.en') || this.isNew)) {
            if (!this.city.hi || !this.city.te) {
                const translated = await autoTranslateContent(this.city.en);
                this.city.hi = translated.hi;
                this.city.te = translated.te;
            }
        }
        if (this.address?.en && (this.isModified('address.en') || this.isNew)) {
            if (!this.address.hi || !this.address.te) {
                const translated = await autoTranslateContent(this.address.en);
                this.address.hi = translated.hi;
                this.address.te = translated.te;
            }
        }
        if (this.poojariCategory?.en && (this.isModified('poojariCategory.en') || this.isNew)) {
            if (!this.poojariCategory.hi || !this.poojariCategory.te) {
                const translated = await autoTranslateContent(this.poojariCategory.en);
                this.poojariCategory.hi = translated.hi;
                this.poojariCategory.te = translated.te;
            }
        }
        if (this.studyPlace?.en && (this.isModified('studyPlace.en') || this.isNew)) {
            if (!this.studyPlace.hi || !this.studyPlace.te) {
                const translated = await autoTranslateContent(this.studyPlace.en);
                this.studyPlace.hi = translated.hi;
                this.studyPlace.te = translated.te;
            }
        }
        next();
    } catch (err: any) {
        console.error('User pre-save translation error:', err);
        next(err);
    }
});

UserSchema.virtual('fullName').get(function () {
    return `${this.firstName?.en || ''} ${this.lastName?.en || ''}`.trim();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Model created AFTER all hooks and virtuals are registered
const User = mongoose.model<IUser>('User', UserSchema);

export default User;