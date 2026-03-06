const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'drnbnse1z',
    api_key: 'fake',
    api_secret: 'fake',
});

const key = "dev_mitra_uploads/home/test.svg";

console.log("Without sanitize:", cloudinary.url(key, { secure: true, analytics: false }));
console.log("With sanitize:", cloudinary.url(key, { secure: true, analytics: false, flags: 'sanitize' }));
