import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { autoTranslateContent } from '../utils/translate';
import User from '../models/User';
import PujaType from '../models/PujaType';
import HomeCard from '../models/HomeCard';
import Booking from '../models/Booking';

dotenv.config();

const migrate = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // ensure DB is passed from env
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected!');

        if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
            console.error('ERROR: GOOGLE_TRANSLATE_API_KEY is missing in your .env file!');
            console.error('The translation functionality requires the Google Cloud Translate API Key.');
            process.exit(1);
        }

        console.log('Migrating HomeCards...');
        const cards = await HomeCard.find();
        for (const card of cards) {
            const tempCard = card as any;
            let updated = false;
            // Legacy data is usually a string from the DB before our schema changes
            if (typeof tempCard.title === 'string') {
                card.title = await autoTranslateContent(tempCard.title) as any;
                updated = true;
            }
            if (typeof tempCard.description === 'string') {
                card.description = await autoTranslateContent(tempCard.description) as any;
                updated = true;
            }
            if (typeof tempCard.buttonText === 'string') {
                card.buttonText = await autoTranslateContent(tempCard.buttonText) as any;
                updated = true;
            }
            if (updated) {
                await card.save();
                console.log(`✓ Migrated HomeCard: ${card.title?.en || 'Untitled'}`);
            }
        }

        console.log('Migrating PujaTypes...');
        const pujas = await PujaType.find();
        for (const puja of pujas) {
            const tempPuja = puja as any;
            let updated = false;
            if (typeof tempPuja.name === 'string') {
                puja.name = await autoTranslateContent(tempPuja.name) as any;
                updated = true;
            }
            if (typeof tempPuja.description === 'string') {
                puja.description = await autoTranslateContent(tempPuja.description) as any;
                updated = true;
            }
            
            if (puja.defaultItems && puja.defaultItems.length > 0) {
                for (let i = 0; i < puja.defaultItems.length; i++) {
                    const tempItem = puja.defaultItems[i] as any;
                    if (typeof tempItem.name === 'string') {
                        puja.defaultItems[i].name = await autoTranslateContent(tempItem.name) as any;
                        updated = true;
                    }
                }
            }

            if (updated) {
                await puja.save();
                console.log(`✓ Migrated PujaType: ${puja.name?.en || 'Unnamed'}`);
            }
        }

        console.log('Migrating Users...');
        const users = await User.find();
        for (const user of users) {
            const tempUser = user as any;
            let updated = false;
            if (typeof tempUser.firstName === 'string') {
                user.firstName = await autoTranslateContent(tempUser.firstName) as any;
                updated = true;
            }
            if (typeof tempUser.lastName === 'string') {
                user.lastName = await autoTranslateContent(tempUser.lastName) as any;
                updated = true;
            }
            if (tempUser.city && typeof tempUser.city === 'string') {
                user.city = await autoTranslateContent(tempUser.city) as any;
                updated = true;
            }
            if (tempUser.address && typeof tempUser.address === 'string') {
                user.address = await autoTranslateContent(tempUser.address) as any;
                updated = true;
            }
            if (tempUser.poojariCategory && typeof tempUser.poojariCategory === 'string') {
                user.poojariCategory = await autoTranslateContent(tempUser.poojariCategory) as any;
                updated = true;
            }
            if (tempUser.studyPlace && typeof tempUser.studyPlace === 'string') {
                user.studyPlace = await autoTranslateContent(tempUser.studyPlace) as any;
                updated = true;
            }

            if (updated) {
                await user.save();
                console.log(`✓ Migrated User: ${user.firstName?.en || tempUser.firstName}`);
            }
        }

        console.log('Migrating Bookings...');
        const bookings = await Booking.find();
        for (const booking of bookings) {
            let updated = false;
            if (booking.bookingItems && booking.bookingItems.length > 0) {
                for (let i = 0; i < booking.bookingItems.length; i++) {
                    const tempItem = booking.bookingItems[i] as any;
                    if (typeof tempItem.name === 'string') {
                        booking.bookingItems[i].name = await autoTranslateContent(tempItem.name) as any;
                        updated = true;
                    }
                }
            }
            if (updated) {
                await booking.save();
                console.log(`✓ Migrated Booking ID: ${booking._id}`);
            }
        }

        console.log('\n✅ All existing database documents migrated seamlessly!');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
