import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration (Keys from .env.local)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Koi file upload nahi hui' }, { status: 400 });
    }

    // File ko buffer (binary data) mein convert kar rahe hain taake Cloudinary par stream ho sake
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary par direct upload stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'peninsula_commercial' }, // Cloudinary mein is naam ka folder ban jayega
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Jab upload successful ho jaye, to Cloudinary ka secure URL return karo
    return NextResponse.json({ success: true, url: uploadResult.secure_url }, { status: 200 });
    
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}