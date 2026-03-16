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

// ─────────────────────────────────────────────────────────────────────────────
// Converts any {en, hi, te} object to its English string at the params level
// ─────────────────────────────────────────────────────────────────────────────
const sanitizeParams = (params: Record<string, any>): Record<string, any> => {
    const out: Record<string, any> = {};
    for (const key of Object.keys(params)) {
        const val = params[key];
        if (val !== null && val !== undefined && typeof val === 'object' && !Array.isArray(val) && 'en' in val) {
            out[key] = val.en ?? '';
        } else {
            out[key] = val;
        }
    }
    return out;
};

// Deep-sanitizes a single record JSON: params, title, and all populated sub-records
const sanitizeRecord = (record: any): any => {
    if (!record) return record;

    // Sanitize flat params
    if (record.params && typeof record.params === 'object') {
        record.params = sanitizeParams(record.params);
    }

    // Title may be an {en,hi,te} object if isTitle property wasn't resolved
    if (record.title && typeof record.title === 'object' && 'en' in record.title) {
        record.title = record.title.en ?? String(record.id ?? '');
    }

    // Populated references may also carry localized params — recurse
    if (record.populated && typeof record.populated === 'object') {
        for (const refKey of Object.keys(record.populated)) {
            if (record.populated[refKey]) {
                record.populated[refKey] = sanitizeRecord(record.populated[refKey]);
            }
        }
    }

    return record;
};

const sanitizeListResponse = async (response: any) => {
    if (Array.isArray(response.records)) {
        response.records = response.records.map(sanitizeRecord);
    }
    return response;
};

const sanitizeShowResponse = async (response: any) => {
    if (response.record) {
        response.record = sanitizeRecord(response.record);
    }
    return response;
};

// *** search is critical — it powers reference-field dropdowns ***
const sanitizeActions = {
    list:   { after: sanitizeListResponse },
    search: { after: sanitizeListResponse },   // vendor / customer / puja pickers
    show:   { after: sanitizeShowResponse },
    new:    { after: sanitizeShowResponse },
    edit:   { after: sanitizeShowResponse },
};

const HIDDEN: any = { isVisible: false };

const adminJs = new AdminJS({
    resources: [

        // USER
        {
            resource: User,
            options: {
                navigation: { name: 'User Management', icon: 'User' },
                listProperties: ['phone', 'email', 'role', 'isApproved', 'createdAt'],
                showProperties: ['phone', 'email', 'role', 'firstName.en', 'lastName.en', 'city.en', 'address.en', 'poojariCategory.en', 'studyPlace.en', 'gender.en', 'experience', 'fee', 'isApproved', 'isBlocked', 'profileImage', 'createdAt'],
                editProperties: ['firstName.en', 'lastName.en', 'email', 'phone', 'role', 'city.en', 'address.en', 'poojariCategory.en', 'studyPlace.en', 'gender.en', 'experience', 'fee', 'isApproved', 'isBlocked', 'uploadProfile'],
                filterProperties: ['phone', 'email', 'role', 'isApproved', 'isBlocked'],
                properties: {
                    firstName: HIDDEN, lastName: HIDDEN, city: HIDDEN,
                    address: HIDDEN, poojariCategory: HIDDEN, studyPlace: HIDDEN,
                    gender: HIDDEN, languages: HIDDEN, __v: HIDDEN,
                    otp: HIDDEN, otpExpiry: HIDDEN,
                    phone: { isTitle: true, label: 'Phone' },
                    'firstName.en': { label: 'First Name' },
                    'lastName.en': { label: 'Last Name' },
                    'city.en': { label: 'City' },
                    'address.en': { label: 'Address' },
                    'poojariCategory.en': { label: 'Poojari Category' },
                    'studyPlace.en': { label: 'Study Place' },
                    'gender.en': { label: 'Gender' },
                },
                actions: sanitizeActions,
            },
            features: [
                uploadFeature({
                    provider: new CloudinaryProvider('dev_mitra_uploads'),
                    properties: { key: 'profileImage', file: 'uploadProfile' },
                    uploadPath: (record, filename) => `dev_mitra_uploads/profiles/${Date.now()}-${filename}`,
                    validation: { mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'] },
                }),
            ],
        },

        // VENDOR ADMIN (alias of User filtered to vendors — used by Booking.vendor reference)
        {
            resource: VendorAdmin,
            options: {
                navigation: { name: 'Vendor Management', icon: 'UserCheck' },
                listProperties: ['phone', 'email', 'isApproved'],
                showProperties: ['phone', 'email', 'firstName.en', 'lastName.en', 'city.en', 'address.en', 'poojariCategory.en', 'experience', 'fee', 'isApproved', 'createdAt'],
                editProperties: ['firstName.en', 'lastName.en', 'email', 'phone', 'city.en', 'address.en', 'poojariCategory.en', 'experience', 'fee', 'isApproved'],
                filterProperties: ['phone', 'email', 'isApproved'],
                properties: {
                    firstName: HIDDEN, lastName: HIDDEN, city: HIDDEN,
                    address: HIDDEN, poojariCategory: HIDDEN, studyPlace: HIDDEN,
                    gender: HIDDEN, languages: HIDDEN, __v: HIDDEN,
                    otp: HIDDEN, otpExpiry: HIDDEN, role: HIDDEN, isBlocked: HIDDEN,
                    phone: { isTitle: true, label: 'Phone' },
                    'firstName.en': { label: 'First Name' },
                    'lastName.en': { label: 'Last Name' },
                    'city.en': { label: 'City' },
                    'address.en': { label: 'Address' },
                    'poojariCategory.en': { label: 'Poojari Category' },
                },
                actions: {
                    ...sanitizeActions,
                    list: {
                        after: sanitizeListResponse,
                        before: async (request: any) => {
                            request.query = request.query || {};
                            request.query['filters.role'] = 'vendor';
                            return request;
                        },
                    },
                    search: {
                        after: sanitizeListResponse,
                        before: async (request: any) => {
                            request.query = request.query || {};
                            request.query['filters.role'] = 'vendor';
                            return request;
                        },
                    },
                },
            },
        },

        // PUJA TYPE
        {
            resource: PujaType,
            options: {
                navigation: { name: 'Puja Management', icon: 'Book' },
                listProperties: ['name.en', 'image', 'basePrice', 'isActive'],
                showProperties: ['name.en', 'description.en', 'image', 'basePrice', 'durationMinutes', 'defaultItemsBatchId', 'isActive', 'createdAt'],
                editProperties: ['name.en', 'description.en', 'uploadPujaImage', 'basePrice', 'durationMinutes', 'isActive'],
                filterProperties: ['isActive', 'basePrice'],
                properties: {
                    name: HIDDEN, description: HIDDEN, __v: HIDDEN,
                    image: { isVisible: { list: true, show: true, edit: false, filter: false } },
                    'name.en': { label: 'Name', isRequired: true, isTitle: true },
                    'description.en': { label: 'Description', isRequired: true },
                },
                actions: sanitizeActions,
            },
            features: [
                uploadFeature({
                    provider: new CloudinaryProvider('dev_mitra_uploads'),
                    properties: { key: 'image', file: 'uploadPujaImage' },
                    uploadPath: (record, filename) => `dev_mitra_uploads/pujas/${Date.now()}-${filename}`,
                    validation: { mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'] },
                }),
            ],
        },

        // PUJA ITEM
        {
            resource: PujaItem,
            options: {
                navigation: { name: 'Puja Management', icon: 'Box' },
                listProperties: ['name.en', 'isActive', 'createdAt'],
                showProperties: ['name.en', 'isActive', 'createdAt'],
                editProperties: ['name.en', 'isActive'],
                filterProperties: ['isActive'],
                properties: {
                    name: HIDDEN, __v: HIDDEN,
                    'name.en': { label: 'Name', isRequired: true, isTitle: true },
                },
                actions: sanitizeActions,
            },
        },

        // PUJA ITEMS BATCH
        {
            resource: PujaItemsBatch,
            options: {
                navigation: { name: 'Puja Management', icon: 'Archive' },
                listProperties: ['_id', 'createdAt'],
                showProperties: ['_id', 'items.pujaItemId', 'items.quantity', 'items.modifiedBy', 'createdAt'],
                editProperties: ['items.pujaItemId', 'items.quantity', 'items.modifiedBy'],
                filterProperties: ['createdAt'],
                properties: {
                    __v: HIDDEN,
                    _id: { isTitle: true, label: 'Batch ID' },
                    'items.pujaItemId': { reference: 'PujaItem', label: 'Puja Item' },
                    'items.quantity': { label: 'Quantity' },
                    'items.modifiedBy': { label: 'Modified By' },
                },
                actions: sanitizeActions,
            },
        },

        // VENDOR PUJA
        {
            resource: VendorPuja,
            options: {
                navigation: { name: 'Vendor Management', icon: 'BookOpen' },
                actions: sanitizeActions,
            },
        },

        // BOOKING
        {
            resource: Booking,
            options: {
                navigation: { name: 'Booking Management', icon: 'Calendar' },
                listProperties: ['customer', 'vendor', 'puja', 'date', 'time', 'totalAmount', 'status', 'paymentStatus', 'createdAt'],
                showProperties: ['_id', 'customer', 'vendor', 'puja', 'date', 'time', 'vendorFee', 'totalAmount', 'status', 'paymentStatus', 'pujaItemsBatchId', 'createdAt', 'updatedAt'],
                editProperties: ['customer', 'vendor', 'puja', 'date', 'time', 'vendorFee', 'totalAmount', 'status', 'paymentStatus'],
                filterProperties: ['status', 'paymentStatus', 'date'],
                properties: {
                    __v: HIDDEN,
                    _id: { isVisible: { list: false, filter: false, show: true, edit: false } },
                    createdAt: { isVisible: { list: true, filter: true, show: true, edit: false }, isTitle: true },
                    updatedAt: { isVisible: { list: false, filter: false, show: true, edit: false } },
                    customer: { reference: 'User' },
                    vendor: { reference: 'VendorAdmin' },
                    puja: { reference: 'PujaType' },
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
                actions: sanitizeActions,
            },
        },

        // AVAILABILITY
        {
            resource: Availability,
            options: {
                navigation: { name: 'Vendor Management', icon: 'Clock' },
                properties: { date: { isTitle: true } },
                actions: sanitizeActions,
            },
        },

        // PAYMENT
        {
            resource: Payment,
            options: {
                navigation: { name: 'Finance', icon: 'CreditCard' },
                properties: { transactionId: { isTitle: true } },
                actions: sanitizeActions,
            },
        },

        // HOME CARD
        {
            resource: HomeCard,
            options: {
                navigation: { name: 'Content Management', icon: 'Home' },
                listProperties: ['title.en', 'image', 'cardColor', 'isActive'],
                showProperties: ['title.en', 'description.en', 'buttonText.en', 'image', 'cardColor', 'isActive', 'createdAt'],
                editProperties: ['title.en', 'description.en', 'buttonText.en', 'uploadImage', 'cardColor', 'isActive'],
                filterProperties: ['isActive', 'cardColor'],
                properties: {
                    title: HIDDEN, description: HIDDEN, buttonText: HIDDEN, __v: HIDDEN,
                    image: { isVisible: { list: true, show: true, edit: false, filter: false } },
                    'title.en': { label: 'Title', isTitle: true },
                    'description.en': { label: 'Description' },
                    'buttonText.en': { label: 'Button Text' },
                },
                actions: sanitizeActions,
            },
            features: [
                uploadFeature({
                    provider: new CloudinaryProvider('dev_mitra_uploads'),
                    properties: { key: 'image', file: 'uploadImage' },
                    uploadPath: (record, filename) => `dev_mitra_uploads/home/${Date.now()}-${filename}`,
                    validation: { mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'] },
                }),
            ],
        },

    ],

    rootPath: '/admin',
    branding: { companyName: 'DevMitra Admin' },
});

export const buildAdminRouter = () => {
    return AdminJSExpress.buildAuthenticatedRouter(
        adminJs,
        {
            authenticate: async (email, password) => {
                const admin = await User.findOne({ email, role: 'admin' });
                if (!admin) return null;
                if (password === process.env.ADMIN_PASSWORD) return admin;
                return null;
            },
            cookieName: 'devmitra-admin',
            cookiePassword: 'supersecretcookie',
        },
        null,
        { resave: false, saveUninitialized: true, secret: 'supersecret' }
    );
};

export default adminJs;