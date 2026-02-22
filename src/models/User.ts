import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    phone: string;
    otp?: string | null;
    otpExpiry?: Date | null;
    email?: string;
    role: UserRole;

    // Location
    city?: string;
    address?: string;
    location?: {
        lat: number;
        lng: number;
    };

    // Vendor specific
    poojariCategory?: string;
    languages?: string[];
    studyPlace?: string;
    experience?: number;
    profileImage?: string;
    isApproved: boolean;
    isBlocked: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
        },

        otp: {
            type: String,
            default: null,
        },
        otpExpiry: {
            type: Date,
            default: null,
        },

        email: {
            type: String,
            lowercase: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ['customer', 'vendor', 'admin'],
            default: 'customer',
        },

        // Location
        city: {
            type: String,
        },

        address: {
            type: String,
        },

        location: {
            lat: { type: Number },
            lng: { type: Number },
        },

        // Vendor fields
        poojariCategory: {
            type: String,
        },

        languages: [
            {
                type: String,
            },
        ],

        studyPlace: {
            type: String,
        },

        experience: {
            type: Number,
        },

        profileImage: {
            type: String,
        },

        isApproved: {
            type: Boolean,
            default: false,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model<IUser>('User', UserSchema);

UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

export default User;