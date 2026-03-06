import { BaseProvider } from '@adminjs/upload'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

class CloudinaryProvider extends BaseProvider {
    constructor(bucket: string) {
        super(bucket)
    }

    async upload(file: any, key: string): Promise<string> {
        try {
            const publicId = key.split('.').slice(0, -1).join('.')

            const response = await cloudinary.uploader.upload(file.path, {
                public_id: publicId,
                folder: this.bucket,
                resource_type: "image",
            })

            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path)
            }

            return response.public_id
        } catch (error: any) {
            console.error("Cloudinary Upload Error:", error)
            throw new Error(error?.message || "Cloudinary upload failed")
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(key, {
                resource_type: "image",
            })
        } catch (error) {
            console.error("Cloudinary Delete Error:", error)
        }
    }

    path(key: string): string {
        return cloudinary.url(key, {
            secure: true,
            analytics: false,
            flags: "sanitize",
        })
    }
}

export default CloudinaryProvider