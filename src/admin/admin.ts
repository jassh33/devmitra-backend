import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import uploadFeature from '@adminjs/upload';
import { v2 as cloudinary } from "cloudinary"
import CloudinaryProvider from '../providers/CloudinaryProvider'

import mongoose from 'mongoose';

import User from '../models/User';
import PujaType from '../models/PujaType';
import VendorPuja from '../models/VendorPuja';
import Availability from '../models/Availability';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import HomeCard from '../models/HomeCard';
import PujaItemsBatch from '../models/PujaItemsBatch';
import PujaItem from '../models/PujaItem';

/**
 * VendorAdmin is a filtered alias of User model scoped to vendors only.
 * It is used by Booking.vendor reference so AdminJS can pick vendors.
 */
const VendorAdmin = mongoose.models.VendorAdmin || mongoose.model('VendorAdmin', User.schema, 'users');

AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * IMPORTANT: For all models that contain LocalizedString ({en, hi, te}) sub-documents,
 * we must HIDE the ROOT property so AdminJS never tries to render the nested object directly.
 * This prevents React error #31 ("Objects are not valid as a React child").
 *
 * The pattern is:
 *   properties: {
 *     myLocalizedField: { isVisible: false },            // hide the root object
 *     'myLocalizedField.en': { label: 'My Field' },      // expose only the English string
 *   }
 */

const HIDDEN: any = { isVisible: false };

const adminJs = new AdminJS({
    resources: [

        // =============================================
        // USER
        // =============================================
        {
            resource: User,
            options: {
                navigation: { name: 'User Management', icon: 'User' },
                listProperties: ['firstName.en', 'lastName.en', 'phone', 'email', 'role', 'isApproved', 'createdAt'],
                showProperties: ['firstName.en', 'lastName.en', 'email', 'phone', 'role', 'city.en', 'address.en', 'poojariCategory.en', 'studyPlace.en', 'gender.en', 'experience', 'fee', 'isApproved', 'isBlocked', 'profileImage', 'createdAt'],
                editProperties: ['firstName.en', 'lastName.en', 'email', 'phone', 'role', 'city.en', 'address.en', 'poojariCategory.en', 'studyPlace.en', 'gender.en', 'experience', 'fee', 'isApproved', 'isBlocked', 'uploadProfile'],
                filterProperties: ['phone', 'email', 'role', 'isApproved', 'isBlocked'],
                properties: {
                    // Hide root localized objects
                    firstName: HIDDEN,
                    lastName: HIDDEN,
                    city: HIDDEN,
                    address: HIDDEN,
                    poojariCategory: HIDDEN,
                    studyPlace: HIDDEN,
                    gender: HIDDEN,
                    languages: HIDDEN,
                    // Hide internal fields
                    __v: HIDDEN,
                    otp: HIDDEN,
                    otpExpiry: HIDDEN,
                    // Label the English sub-fields
                    'firstName.en': { label: 'First Name' },
                    'lastName.en': { label: 'Last Name' },
                    'city.en': { label: 'City' },
                    'address.en': { label: 'Address' },
                    'poojariCategory.en': { label: 'Poojari Category' },
                    'studyPlace.en': { label: 'Study Place' },
                    'gender.en': { label: 'Gender' },
                },
            },
            features: [
                uploadFeature({
                    provider: new CloudinaryProvider('dev_mitra_uploads'),
                    properties: {
                        key: 'profileImage',
                        file: 'uploadProfile',
                    },
                    uploadPath: (record, filename) =>
                        `dev_mitra_uploads/profiles/${Date.now()}-${filename}`,
                    validation: {
                        mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
                    },
                }),
            ],
        },

        // =============================================
        // VENDOR ADMIN (alias of User, vendors only)
        // Kept hidden from nav but registered so Booking can reference it
        // =============================================
        {
            resource: VendorAdmin,
            options: {
                navigation: { name: 'Vendor Management', icon: 'UserCheck' },
                listProperties: ['firstName.en', 'lastName.en', 'phone', 'email', 'isApproved'],
                showProperties: ['firstName.en', 'lastName.en', 'email', 'phone', 'city.en', 'address.en', 'poojariCategory.en', 'experience', 'fee', 'isApproved', 'createdAt'],
                editProperties: ['firstName.en', 'lastName.en', 'email', 'phone', 'city.en', 'address.en', 'poojariCategory.en', 'experience', 'fee', 'isApproved'],
                filterProperties: ['phone', 'email', 'isApproved'],
                properties: {
                    // Hide root localized objects
                    firstName: HIDDEN,
                    lastName: HIDDEN,
                    city: HIDDEN,
                    address: HIDDEN,
                    poojariCategory: HIDDEN,
                    studyPlace: HIDDEN,
                    gender: HIDDEN,
                    languages: HIDDEN,
                    // Hide internal fields
                    __v: HIDDEN,
                    otp: HIDDEN,
                    otpExpiry: HIDDEN,
                    role: HIDDEN,
                    isBlocked: HIDDEN,
                    // Label the English sub-fields
                    'firstName.en': { label: 'First Name' },
                    'lastName.en': { label: 'Last Name' },
                    'city.en': { label: 'City' },
                    'address.en': { label: 'Address' },
                    'poojariCategory.en': { label: 'Poojari Category' },
                },
                actions: {
                    list: {
                        before: async (request: any) => {
                            request.query = request.query || {};
                            if (!request.query['filters.role']) {
                                request.query['filters.role'] = 'vendor';
                            }
                            return request;
                        }
                    },
                    search: {
                        before: async (request: any) => {
                            request.query = request.query || {};
                            request.query['filters.role'] = 'vendor';
                            return request;
                        }
                    }
                }
            }
        },

        // =============================================
        // PUJA TYPE
        // =============================================
        {
            resource: PujaType,
            options: {
                navigation: { name: 'Puja Management', icon: 'Book' },
                listProperties: ['name.en', 'image', 'basePrice', 'isActive'],
                showProperties: ['name.en', 'description.en', 'image', 'basePrice', 'durationMinutes', 'defaultItemsBatchId', 'isActive', 'createdAt'],
                editProperties: ['name.en', 'description.en', 'uploadPujaImage', 'basePrice', 'durationMinutes', 'isActive'],
                filterProperties: ['isActive', 'basePrice'],
                properties: {
                    // Hide root localized objects
                    name: HIDDEN,
                    description: HIDDEN,
                    // Hide internal
                    __v: HIDDEN,
                    image: { isVisible: { list: true, show: true, edit: false, filter: false } },
                    // Label the English sub-fields
                    'name.en': { label: 'Name (English)', isRequired: true },
                    'description.en': { label: 'Description (English)', isRequired: true },
                },
            },
            features: [
                uploadFeature({
                    provider: new CloudinaryProvider('dev_mitra_uploads'),
                    properties: {
                        key: 'image',
                        file: 'uploadPujaImage',
                    },
                    uploadPath: (record, filename) =>
                        `dev_mitra_uploads/pujas/${Date.now()}-${filename}`,
                    validation: {
                        mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
                    },
                }),
            ],
        },

        // =============================================
        // PUJA ITEM
        // =============================================
        {
            resource: PujaItem,
            options: {
                navigation: { name: 'Puja Management', icon: 'Box' },
                listProperties: ['name.en', 'isActive', 'createdAt'],
                showProperties: ['name.en', 'name.hi', 'name.te', 'isActive', 'createdAt'],
                editProperties: ['name.en', 'isActive'],
                filterProperties: ['isActive'],
                properties: {
                    // Hide root localized object
                    name: HIDDEN,
                    __v: HIDDEN,
                    // Label the English sub-field
                    'name.en': { label: 'Name (English)', isRequired: true },
                    'name.hi': { label: 'Name (Hindi)' },
                    'name.te': { label: 'Name (Telugu)' },
                },
            },
        },

        // =============================================
        // PUJA ITEMS BATCH
        // =============================================
        {
            resource: PujaItemsBatch,
            options: {
                navigation: { name: 'Puja Management', icon: 'Archive' },
                listProperties: ['_id', 'createdAt'],
                showProperties: ['_id', 'items.pujaItemId', 'items.quantity', 'items.modifiedBy', 'createdAt', 'updatedAt'],
                editProperties: ['items.pujaItemId', 'items.quantity', 'items.modifiedBy'],
                filterProperties: ['createdAt'],
                properties: {
                    __v: HIDDEN,
                    // Map the reference correctly so AdminJS shows item picker not raw object
                    'items.pujaItemId': {
                        reference: 'PujaItem',
                        label: 'Puja Item',
                    },
                    'items.quantity': { label: 'Quantity' },
                    'items.modifiedBy': { label: 'Modified By' },
                },
            },
        },

        // =============================================
        // VENDOR PUJA (assignments)
        // =============================================
        {
            resource: VendorPuja,
            options: {
                navigation: { name: 'Vendor Management', icon: 'BookOpen' },
            },
        },

        // =============================================
        // BOOKING
        // =============================================
        {
            resource: Booking,
            options: {
                navigation: { name: 'Booking Management', icon: 'Calendar' },
                listProperties: ['customer', 'vendor', 'puja', 'date', 'time', 'totalAmount', 'status', 'paymentStatus', 'createdAt'],
                showProperties: ['_id', 'customer', 'vendor', 'puja', 'date', 'time', 'vendorFee', 'totalAmount', 'status', 'paymentStatus', 'pujaItemsBatchId', 'availability', 'createdAt', 'updatedAt'],
                editProperties: ['customer', 'vendor', 'puja', 'date', 'time', 'vendorFee', 'totalAmount', 'status', 'paymentStatus'],
                filterProperties: ['status', 'paymentStatus', 'date'],
                properties: {
                    __v: HIDDEN,
                    _id: { isVisible: { list: false, filter: false, show: true, edit: false } },
                    createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    updatedAt: { isVisible: { list: false, filter: false, show: true, edit: false } },
                    customer: {
                        reference: 'User',
                    },
                    vendor: {
                        reference: 'VendorAdmin',
                    },
                    puja: {
                        reference: 'PujaType',
                    },
                    status: {
                        availableValues: [
                            { value: 'pending', label: 'Pending' },
                            { value: 'requested', label: 'Requested' },
                            { value: 'accepted', label: 'Accepted' },
                            { value: 'rejected', label: 'Rejected' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ],
                    },
                    paymentStatus: {
                        availableValues: [
                            { value: 'pending', label: 'Pending' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'failed', label: 'Failed' },
                        ],
                    },
                },
            },
        },

        // =============================================
        // AVAILABILITY
        // =============================================
        {
            resource: Availability,
            options: {
                navigation: { name: 'Vendor Management', icon: 'Clock' },
            },
        },

        // =============================================
        // PAYMENT
        // =============================================
        {
            resource: Payment,
            options: {
                navigation: { name: 'Finance', icon: 'CreditCard' },
            },
        },

        // =============================================
        // HOME CARD
        // =============================================
        {
            resource: HomeCard,
            options: {
                navigation: { name: 'Content Management', icon: 'Home' },
                listProperties: ['title.en', 'image', 'cardColor', 'isActive'],
                showProperties: ['title.en', 'description.en', 'buttonText.en', 'image', 'cardColor', 'isActive', 'createdAt'],
                editProperties: ['title.en', 'description.en', 'buttonText.en', 'uploadImage', 'cardColor', 'isActive'],
                filterProperties: ['isActive', 'cardColor'],
                properties: {
                    // Hide root localized objects
                    title: HIDDEN,
                    description: HIDDEN,
                    buttonText: HIDDEN,
                    __v: HIDDEN,
                    image: { isVisible: { list: true, show: true, edit: false, filter: false } },
                    // Label the English sub-fields
                    'title.en': { label: 'Title' },
                    'description.en': { label: 'Description' },
                    'buttonText.en': { label: 'Button Text' },
                },
            },
            features: [
                uploadFeature({
                    provider: new CloudinaryProvider('dev_mitra_uploads'),
                    properties: {
                        key: 'image',
                        file: 'uploadImage',
                    },
                    uploadPath: (record, filename) =>
                        `dev_mitra_uploads/home/${Date.now()}-${filename}`,
                    validation: {
                        mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
                    },
                }),
            ],
        },

    ],

    rootPath: '/admin',

    branding: {
        companyName: 'DevMitra Admin',
    },
});

export const buildAdminRouter = () => {
    return AdminJSExpress.buildAuthenticatedRouter(
        adminJs,
        {
            authenticate: async (email, password) => {
                const admin = await User.findOne({
                    email,
                    role: 'admin',
                });

                if (!admin) return null;

                if (password === process.env.ADMIN_PASSWORD) {
                    return admin;
                }

                return null;
            },
            cookieName: 'devmitra-admin',
            cookiePassword: 'supersecretcookie',
        },
        null,
        {
            resave: false,
            saveUninitialized: true,
            secret: 'supersecret',
        }
    );
};

export default adminJs;