import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadCVToCloudinary(fileBuffer: Buffer, fileName: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'modonty/applications',
        resource_type: 'raw',
        public_id: `cv_${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function uploadImageToCloudinary(fileBuffer: Buffer, fileName: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'modonty/applications/profiles',
        resource_type: 'image',
        public_id: `profile_${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteCVFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}

