const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
    fs.writeFileSync('test.svg', '<svg></svg>');
    const key = "dev_mitra_uploads/home/test-svg.svg";
    
    try {
        const response = await cloudinary.uploader.upload('test.svg', {
            public_id: key,
            resource_type: "auto",
        });
        console.log("Upload Response public_id:", response.public_id);
        console.log("Upload Response format:", response.format);
        console.log("Upload Response secure_url:", response.secure_url);
    } catch (e) {
        console.error(e);
    }
}

testUpload();
