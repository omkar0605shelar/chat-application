import { v2 as cloudinary } from 'cloudinary';
export declare const uploadToCloudinary: (fileBuffer: Buffer) => Promise<{
    url: string;
    publicId: string;
}>;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map