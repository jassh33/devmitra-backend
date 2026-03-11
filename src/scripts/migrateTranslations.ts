import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { autoTranslateContent } from '../utils/translate';
import User from '../models/User';
import PujaType from '../models/PujaType';
import HomeCard from '../models/HomeCard';
import Booking from '../models/Booking';

dotenv.config();

const translateIfNeeded = async (field: any): Promise<any> => {
    // If it's a plain string from old DB
    if (typeof field === 'string') {
        return await autoTranslateContent(field);
    }
    // If it's an object casted by Mongoose but lacking translations
    if (field && typeof field === 'object' && field.en) {
        if (!field.hi || !field.te) {
            const translated = await autoTranslateContent(field.en);
            return {
                en: field.en,
                hi: translated.hi || field.en,
                te: translated.te || field.en,
            };
        }
        return false; // Already translated
    }
    return false;
};

const migrate = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected!');

        if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
            console.error('ERROR: GOOGLE_TRANSLATE_API_KEY is missing in your .env file!');
            process.exit(1);
        }

        console.log('Migrating HomeCards...');
        const cards = await HomeCard.find();
        let cardsUpdated = 0;
        for (const card of cards) {
            const tempCard = card as any;
            let updated = false;
            
            const transTitle = await translateIfNeeded(tempCard.title);
            if (transTitle) { card.title = transTitle; updated = true; }
            
            const transDesc = await translateIfNeeded(tempCard.description);
            if (transDesc) { card.description = transDesc; updated = true; }
            
            const transBtn = await translateIfNeeded(tempCard.buttonText);
            if (transBtn) { card.buttonText = transBtn; updated = true; }

            if (updated) {
                await card.save();
                cardsUpdated++;
                console.log(`✓ Migrated HomeCard: ${card.title?.en || 'Untitled'}`);
            }
        }
        console.log(`Total HomeCards updated: ${cardsUpdated}`);

        console.log('Migrating PujaTypes...');
        const pujas = await PujaType.find();
        let pujasUpdated = 0;
        for (const puja of pujas) {
            const tempPuja = puja as any;
            let updated = false;
            
            const transName = await translateIfNeeded(tempPuja.name);
            if (transName) { puja.name = transName; updated = true; }
            
            const transDesc = await translateIfNeeded(tempPuja.description);
            if (transDesc) { puja.description = transDesc; updated = true; }
            
            // NOTE: Batch items migration handled separately or skipped 
            // since they are isolated collections now

            if (updated) {
                await puja.save();
                pujasUpdated++;
                console.log(`✓ Migrated PujaType: ${puja.name?.en || 'Unnamed'}`);
            }
        }
        console.log(`Total PujaTypes updated: ${pujasUpdated}`);

        console.log('Migrating Users...');
        const users = await User.find();
        let usersUpdated = 0;
        for (const user of users) {
            const tempUser = user as any;
            let updated = false;
            
            const transFirst = await translateIfNeeded(tempUser.firstName);
            if (transFirst) { user.firstName = transFirst; updated = true; }
            
            const transLast = await translateIfNeeded(tempUser.lastName);
            if (transLast) { user.lastName = transLast; updated = true; }
            
            const transCity = await translateIfNeeded(tempUser.city);
            if (transCity) { user.city = transCity; updated = true; }
            
            const transAddr = await translateIfNeeded(tempUser.address);
            if (transAddr) { user.address = transAddr; updated = true; }
            
            const transCat = await translateIfNeeded(tempUser.poojariCategory);
            if (transCat) { user.poojariCategory = transCat; updated = true; }
            
            const transStudy = await translateIfNeeded(tempUser.studyPlace);
            if (transStudy) { user.studyPlace = transStudy; updated = true; }

            if (updated) {
                await user.save();
                usersUpdated++;
                console.log(`✓ Migrated User: ${user.firstName?.en || tempUser.firstName}`);
            }
        }
        console.log(`Total Users updated: ${usersUpdated}`);

        console.log('Migrating Bookings...');
        const bookings = await Booking.find();
        let bookingsUpdated = 0;
        for (const booking of bookings) {
            let updated = false;
            // NOTE: Booking items batch migration handled separately or skipped 
            // since they are isolated collections now
            if (updated) {
                await booking.save();
                bookingsUpdated++;
                console.log(`✓ Migrated Booking ID: ${booking._id}`);
            }
        }
        console.log(`Total Bookings updated: ${bookingsUpdated}`);

        console.log('\n✅ All existing database documents migrated seamlessly!');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
