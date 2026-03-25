import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string
})

export const uploadToCloudinary = (fileBuffer: Buffer): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "chat-images",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" }
        ]
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(new Error("Failed to upload image to Cloudinary"));
        }
        if (!result) {
          return reject(new Error("Cloudinary upload returned no result"));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;