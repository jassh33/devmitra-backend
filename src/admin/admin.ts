import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import uploadFeature from '@adminjs/upload';
import path from 'path';
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

const upload = uploadFeature({
    provider: new CloudinaryProvider('dev_mitra_uploads'),
    properties: {
        key: 'image',
        file: 'uploadImage',
    },
})

const adminJs = new AdminJS({
    resources: [
        /**
         * =============================
         * USER (Profile Upload)
         * =============================
         */
        {
            resource: User,
            options: {
                navigation: { name: 'User Management', icon: 'User' },
                properties: {
                    __v: { isVisible: false },
                },
            },
            features: [
                uploadFeature({
                    provider: new CloudinaryProvider('dev_mitra_uploads'),
                    properties: {
                        key: 'profileImage',  // DB field
                        file: 'uploadProfile', // virtual admin field
                    },
                    uploadPath: (record, filename) =>
                        `dev_mitra_uploads/profiles/${Date.now()}-${filename}`,
                    validation: {
                        mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
                    },
                }),
            ],
        },

        /**
         * =============================
         * PUJA TYPE (Image Upload)
         * =============================
         */
        {
            resource: PujaType,
            options: {
                navigation: { name: 'Puja Management', icon: 'Book' },
                listProperties: ['name', 'image', 'basePrice', 'isActive'],
                showProperties: ['name', 'description', 'image', 'basePrice', 'durationMinutes', 'defaultItems', 'isActive', 'createdAt'],
                editProperties: ['name', 'description', 'uploadPujaImage', 'basePrice', 'durationMinutes', 'defaultItems', 'isActive'],
                properties: {
                    __v: { isVisible: false },
                    image: { isVisible: { list: true, show: true, edit: false, filter: false } },
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

        /**
         * OTHER RESOURCES
         */
        {
            resource: VendorPuja,
            options: {
                navigation: { name: 'Vendor Management', icon: 'BookOpen' },
            },
        },
        {
            resource: VendorAdmin,
            options: {
                navigation: false,
                actions: {
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
        {
            resource: Booking,
            options: {
                navigation: { name: 'Booking Management', icon: 'Calendar' },
                properties: {
                    _id: { isVisible: { list: false, filter: false, show: true, edit: false } },
                    createdAt: { isVisible: { list: true, filter: true, show: true, edit: false } },
                    customer: { isTitle: true },
                    vendor: {
                        reference: 'VendorAdmin'
                    },
                    puja: {},
                    date: {},
                    time: {},
                    vendorFee: {},
                    totalAmount: {},
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
                listProperties: ['customer', 'vendor', 'puja', 'date', 'time', 'totalAmount', 'status', 'paymentStatus'],
                showProperties: ['_id', 'customer', 'vendor', 'puja', 'date', 'time', 'vendorFee', 'totalAmount', 'status', 'paymentStatus', 'bookingItems', 'createdAt', 'updatedAt'],
                editProperties: ['customer', 'vendor', 'puja', 'date', 'time', 'vendorFee', 'totalAmount', 'status', 'paymentStatus', 'bookingItems'],
            },
        },
        {
            resource: Availability,
            options: {
                navigation: { name: 'Vendor Management', icon: 'Clock' },
            },
        },
        {
            resource: Payment,
            options: {
                navigation: { name: 'Finance', icon: 'CreditCard' },
            },
        },
        {
            resource: HomeCard,
            options: {
                navigation: { name: 'Content Management', icon: 'Home' },

                listProperties: [
                    'title',
                    'image',
                    'cardColor',
                    'isActive',
                ],

                showProperties: [
                    'title',
                    'description',
                    'buttonText',
                    'uploadImage',
                    'cardColor',
                    'isActive',
                    'createdAt',
                ],

                editProperties: [
                    'title',
                    'description',
                    'buttonText',
                    'uploadImage',
                    'cardColor',
                    'isActive',
                ],

                properties: {
                    __v: { isVisible: false },
                },
            },

            features: [
                uploadFeature({
                    provider: new CloudinaryProvider('dev_mitra_uploads'),
                    properties: {
                        key: 'image',        // stored in DB
                        file: 'uploadImage', // virtual field for file picker
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