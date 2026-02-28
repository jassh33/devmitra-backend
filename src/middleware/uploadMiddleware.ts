import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createUploader = (folder: string) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = path.join('public', folder);

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix =
                Date.now() + '-' + Math.round(Math.random() * 1e9);

            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    });

    const fileFilter = (req: any, file: any, cb: any) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed!'), false);
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 },
    });
};

export const uploadProfile = createUploader('profiles');
export const uploadPuja = createUploader('pujas');
export const uploadIcon = createUploader('icons');
export const uploadHomeCard = createUploader('home');