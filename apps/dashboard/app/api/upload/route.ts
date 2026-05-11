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
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}

