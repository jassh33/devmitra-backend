import { BaseProvider } from '@adminjs/upload'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

class CloudinaryProvider extends BaseProvider {
    constructor(bucket: string) {
        super(bucket)
    }

    async upload(file: any, key: string): Promise<string> {
        const response = await cloudinary.uploader.upload(file.path, {
            folder: this.bucket,
            public_id: key,
            resource_type: 'auto',
        })

        // remove temp file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
        }

        return response.secure_url
    }

    async delete(key: string): Promise<void> {
        await cloudinary.uploader.destroy(key, {
            resource_type: 'auto',
        })
    }

    path(key: string): string {
        return key
    }
}

export default CloudinaryProvider