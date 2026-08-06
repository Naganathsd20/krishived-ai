import { v2 as cloudinary } from "cloudinary";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Server-side helper to upload a buffer or base64 image data to Cloudinary.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string = "krishived-crop-diseases"
): Promise<CloudinaryUploadResult> {
  // Ensure Cloudinary SDK is configured with runtime environment variables
  cloudinary.config({
    cloud_name:
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      "krishived",
    api_key: process.env.CLOUDINARY_API_KEY || "123456789012345",
    api_secret: process.env.CLOUDINARY_API_SECRET || "abcdefghijklmnopqrstuvwxyz12345",
    secure: true,
  });

  try {
    if (typeof fileBuffer === "string") {
      const result = await cloudinary.uploader.upload(fileBuffer, {
        folder,
        resource_type: "image",
      });

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error || new Error("Failed to upload image stream to Cloudinary")
            );
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to upload image to Cloudinary"
    );
  }
}

export default cloudinary;
