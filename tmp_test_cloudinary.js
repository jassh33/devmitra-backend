const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
    const key = "dev_mitra_uploads/home/test-svg.svg";
    const path = cloudinary.url(key, { secure: true, analytics: false });
    console.log("Generated URL (straight key):", path);
    // Let's also see what happens when the extension is stripped
    const strippedKey = key.replace(/\.svg$/, '');
    const strippedPath = cloudinary.url(strippedKey, { secure: true, analytics: false });
    console.log("Generated URL (stripped key):", strippedPath);

    // Let's do the user's version
    const userVersion = cloudinary.url(strippedKey, { secure: true, analytics: false, flags: 'sanitize', format: 'svg' });
    console.log("Generated URL (user version):", userVersion);
}

test();
