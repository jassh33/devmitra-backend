import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import uploadFeature from '@adminjs/upload';
import path from 'path';

import User from '../models/User';
import PujaType from '../models/PujaType';
import VendorPuja from '../models/VendorPuja';
import Availability from '../models/Availability';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import HomeCard from '../models/HomeCard';

AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});

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
                    provider: {
                        local: {
                            bucket: path.join(__dirname, '../../public'),
                            opts: {
                                baseUrl: undefined
                            }
                        },
                    },
                    properties: {
                        key: 'profileImage',  // DB field
                        file: 'uploadProfile', // virtual admin field
                    },
                    uploadPath: (record, filename) =>
                        `profiles/${Date.now()}-${filename}`,
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
                properties: {
                    __v: { isVisible: false },
                },
            },
            features: [
                uploadFeature({
                    provider: {
                        local: {
                            bucket: path.join(__dirname, '../../public'),
                            opts: {
                                baseUrl: undefined
                            }
                        },
                    },
                    properties: {
                        key: 'image',
                        file: 'uploadPujaImage',
                    },
                    uploadPath: (record, filename) =>
                        `pujas/${Date.now()}-${filename}`,
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
            resource: Booking,
            options: {
                navigation: { name: 'Booking Management', icon: 'Calendar' },
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
                listProperties: ['title', 'buttonText', 'isActive'],
                properties: {
                    image: { type: 'string' },
                    __v: { isVisible: false },
                },
            },
        }
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