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
                folder: this.bucket,        // ✅ Let Cloudinary handle folder
                public_id: key,             // ✅ Keep key clean (home/xxx.svg)
                resource_type: "auto",      // ✅ Works for image + svg + pdf
            })

            // optional: remove temp file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path)
            }

            return `${this.bucket}/${response.public_id}`; // will now include folder automatically

        } catch (error: any) {
            console.error("Cloudinary Upload Error:", error)
            throw new Error(error?.message || "Cloudinary upload failed")
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(key, {
                resource_type: "auto",
            })
        } catch (error) {
            console.error("Cloudinary Delete Error:", error)
        }
    }

    path(key: string): string {
        return cloudinary.url(key, {
            secure: true,
            analytics: false,
        })
    }
}

export default CloudinaryProvider