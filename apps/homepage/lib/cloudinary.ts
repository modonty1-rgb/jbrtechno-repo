import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.JBRTECHNO_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.JBRTECHNO_CLOUDINARY_API_KEY,
  api_secret: process.env.JBRTECHNO_CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadCVToCloudinary(fileBuffer: Buffer, fileName: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    const sanitizedFileName = fileName
      .replace(/\.[^/.]+$/, '')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    const publicIdBase = `cv_${Date.now()}_${sanitizedFileName}`;
    const publicId = ext ? `${publicIdBase}.${ext}` : publicIdBase;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'modonty/applications',
        resource_type: 'raw',
        public_id: publicId,
      },
      (error, result) => {
        if (error) {
          // Provide user-friendly error messages
          let errorMessage = 'Failed to upload file. Please try again.';
          if (error.message) {
            if (error.message.includes('File size too large') || error.message.includes('413')) {
              errorMessage = 'File is too large. Maximum file size is 5MB.';
            } else if (error.message.includes('public_id') && error.message.includes('whitespace')) {
              errorMessage = 'Invalid file name. Please rename the file and try again.';
            } else if (error.message.includes('Invalid') || error.message.includes('401') || error.message.includes('403')) {
              errorMessage = 'Upload service error. Please contact support if this persists.';
            } else {
              errorMessage = error.message;
            }
          }
          reject(new Error(errorMessage));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result returned from upload service'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function uploadImageToCloudinary(fileBuffer: Buffer, fileName: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // Sanitize filename: remove extension, trim whitespace, replace spaces/special chars with underscores
    const sanitizedFileName = fileName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .trim() // Remove leading/trailing whitespace
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with underscore
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'modonty/applications/profiles',
        resource_type: 'image',
        public_id: `profile_${Date.now()}_${sanitizedFileName}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          // Provide user-friendly error messages
          let errorMessage = 'Failed to upload image. Please try again.';
          if (error.message) {
            if (error.message.includes('File size too large') || error.message.includes('413')) {
              errorMessage = 'Image is too large. Maximum image size is 2MB.';
            } else if (error.message.includes('public_id') && error.message.includes('whitespace')) {
              errorMessage = 'Invalid file name. Please rename the image and try again.';
            } else if (error.message.includes('Invalid') || error.message.includes('401') || error.message.includes('403')) {
              errorMessage = 'Upload service error. Please contact support if this persists.';
            } else if (error.message.includes('format') || error.message.includes('invalid image')) {
              errorMessage = 'Invalid image format. Please upload a JPG, PNG, or WebP image.';
            } else {
              errorMessage = error.message;
            }
          }
          reject(new Error(errorMessage));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed: No result returned from upload service'));
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

