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
            const response = await cloudinary.uploader.upload(file.path, {
                public_id: key,
                resource_type: 'auto',
                overwrite: true,
            })

            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path)
            }

            // Return the full secure HTTPS URL so AdminJS stores it directly
            // in the DB key field (e.g. `image`). This way image = full URL,
            // not just the public_id – no extra resolution step needed.
            return response.secure_url
        } catch (error: any) {
            console.error('Cloudinary Upload Error:', error)
            throw new Error(error?.message || 'Cloudinary upload failed')
        }
    }

    async delete(key: string): Promise<void> {
        try {
            // key may now be a full URL; extract the public_id for deletion
            let publicId = key
            if (key.startsWith('http')) {
                // e.g. https://res.cloudinary.com/cloud/image/upload/v123/dev_mitra_uploads/pujas/xxx.jpg
                const parts = key.split('/')
                const uploadIdx = parts.indexOf('upload')
                if (uploadIdx !== -1) {
                    // Skip the version segment (v123) if present
                    const afterUpload = parts.slice(uploadIdx + 1)
                    if (afterUpload[0]?.startsWith('v')) afterUpload.shift()
                    // Remove file extension
                    publicId = afterUpload.join('/').replace(/\.[^/.]+$/, '')
                }
            }

            await cloudinary.uploader.destroy(publicId, {
                resource_type: 'image',
            })
        } catch (error) {
            console.error('Cloudinary Delete Error:', error)
        }
    }

    // path() is called by AdminJS to show the image preview in the UI.
    // Since `key` is now the full URL, return it as-is.
    path(key: string): string {
        if (!key) return ''
        if (key.startsWith('http')) return key
        // Fallback: build URL from public_id (legacy keys)
        return cloudinary.url(key, {
            secure: true,
            analytics: false,
        })
    }
}

export default CloudinaryProvider