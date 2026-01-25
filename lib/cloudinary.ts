import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

import sharp from 'sharp';

import { Readable } from 'stream';

export const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                format: 'webp',
            },
            (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result.secure_url);
                reject(new Error('Unknown error during upload'));
            }
        );

        const transform = sharp()
            .resize({ width: 1920, withoutEnlargement: true })
            .toFormat('webp', { quality: 80 });

        // Convert Blob/File to stream and pipe through sharp to cloudinary
        // Validating if it's a File/Blob which has .stream()
        if (typeof file.stream === 'function') {
            // @ts-ignore
            Readable.fromWeb(file.stream()).pipe(transform).pipe(uploadStream);
        } else {
            reject(new Error("Invalid file type"));
        }
    });
};

export default cloudinary;
