import multer from 'multer';

// Use memoryStorage so files are held in buffer — passed directly to Cloudinary
// instead of being written to disk first (no local file cleanup needed)
const memoryStorage = multer.memoryStorage();

const imageFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const uploaderOptions = {
    storage: memoryStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
};

export const uploadProfile  = multer(uploaderOptions);
export const uploadPuja     = multer(uploaderOptions);
export const uploadIcon     = multer(uploaderOptions);
export const uploadHomeCard = multer(uploaderOptions);