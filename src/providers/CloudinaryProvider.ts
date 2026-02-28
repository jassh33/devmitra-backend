import { BaseProvider } from '@adminjs/upload'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

class CloudinaryProvider extends BaseProvider {
    constructor(bucket: string) {
        super(bucket)
    }

    async upload(file: any, key: string): Promise<string> {
        try {
            const publicId = `${this.bucket}/${key}`;

            const response = await cloudinary.uploader.upload(file.path, {
                public_id: publicId,
                resource_type: "image",   // 👈 force image for SVG
            });

            return response.public_id;

        } catch (error: any) {
            console.error("Cloudinary Upload Error:", error);
            throw new Error(error?.message || "Cloudinary upload failed");
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(key, {
                resource_type: 'auto',
            });
        } catch (error) {
            console.error("Cloudinary Delete Error:", error);
        }
    }

    // 🔥 THIS IS THE IMPORTANT PART
    path(key: string): string {
        return cloudinary.url(key, {
            secure: true,
        });
    }
}

export default CloudinaryProvider