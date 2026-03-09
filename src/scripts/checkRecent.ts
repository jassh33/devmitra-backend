import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import HomeCard from '../models/HomeCard';
import { autoTranslateContent } from '../utils/translate';

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        const cards = await HomeCard.find().sort({ createdAt: -1 }).limit(1);
        console.log('Most recent HomeCard:', JSON.stringify(cards, null, 2));
        
        // Let's also test the translate logic just in case
        console.log('Testing translate logic directly:');
        const trans = await autoTranslateContent("Test String");
        console.log('Translation output:', trans);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkDb();
