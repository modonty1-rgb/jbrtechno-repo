import { NextRequest, NextResponse } from 'next/server';
import { uploadCVToCloudinary, uploadImageToCloudinary } from '@/lib/cloudinary';
import { validateFile, validateImage } from '@/lib/validations/application';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or undefined (for CV)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let result;

    if (type === 'image') {
      // Validate and upload image
      const validation = validateImage(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      result = await uploadImageToCloudinary(buffer, file.name);
    } else {
      // Validate and upload CV
      const validation = validateFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      result = await uploadCVToCloudinary(buffer, file.name);
    }

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload file. Please try again.';
    
    if (error instanceof Error) {
      // Check for Cloudinary-specific errors
      if (error.message.includes('Invalid API Key') || error.message.includes('401')) {
        errorMessage = 'Upload service configuration error. Please contact support.';
      } else if (error.message.includes('File size') || error.message.includes('too large')) {
        errorMessage = 'File is too large. Please try a smaller file.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try again with a smaller file.';
      } else if (error.message) {
        // Use the error message if it's informative
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

