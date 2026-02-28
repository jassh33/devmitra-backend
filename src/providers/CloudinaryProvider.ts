import { BaseProvider } from '@adminjs/upload'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

class CloudinaryProvider extends BaseProvider {
    constructor(bucket: string) {
        super(bucket)
    }

    async upload(file: any, key: string): Promise<string> {
        try {
            const response = await cloudinary.uploader.upload(file.path, {
                folder: this.bucket,
                public_id: key,
                resource_type: 'auto',
            });

            return response.secure_url;

        } catch (error: any) {
            console.error("Cloudinary Upload Error:", error);

            // IMPORTANT: Throw readable message
            throw new Error(
                error?.message || "Cloudinary upload failed"
            );
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(key, {
                resource_type: 'auto',
            });
        } catch (error: any) {
            console.error("Cloudinary Delete Error:", error);
        }
    }

    path(key: string): string {
        return key
    }
}

export default CloudinaryProvider