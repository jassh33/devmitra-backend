import { v2 } from '@google-cloud/translate';
import dotenv from 'dotenv';

dotenv.config();

let translate: v2.Translate | null = null;

if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    translate = new v2.Translate({
        key: process.env.GOOGLE_TRANSLATE_API_KEY
    });
}

export const translateText = async (text: string, target: string): Promise<string> => {
    if (!text || !translate) return text;
    try {
        const [translation] = await translate.translate(text, target);
        return translation;
    } catch (error) {
        console.error(`Error translating text to ${target}:`, error);
        return text;
    }
};

export const autoTranslateContent = async (text: string) => {
    if (!text) return { en: '', hi: '', te: '' };

    const [hi, te] = await Promise.all([
        translateText(text, 'hi'),
        translateText(text, 'te')
    ]);

    return {
        en: text,
        hi,
        te
    };
};
