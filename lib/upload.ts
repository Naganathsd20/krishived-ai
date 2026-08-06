export interface UploadOptions {
  file: File;
  onProgress?: (progressPercent: number) => void;
}

export interface UploadResponse {
  success: boolean;
  secure_url: string;
  public_id?: string;
  bytes?: number;
  error?: string;
}

/**
 * Reusable client-side upload utility to send images to /api/upload (Cloudinary)
 * with file validation and real-time progress callbacks.
 */
export async function uploadImageWithProgress({
  file,
  onProgress,
}: UploadOptions): Promise<UploadResponse> {
  // 1. Validate File Format
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file format. Please select a JPG, JPEG, or PNG image.");
  }

  // 2. Validate Maximum Size (10MB)
  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error("File size exceeds 10MB limit. Please upload a smaller image.");
  }

  // 3. Upload with XMLHttpRequest for precise progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.secure_url) {
            resolve({
              success: true,
              secure_url: response.secure_url,
              public_id: response.public_id,
              bytes: response.bytes,
            });
          } else {
            reject(new Error(response.error || "Upload to Cloudinary failed."));
          }
        } catch {
          reject(new Error("Invalid JSON response from upload server."));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error || `Upload failed with HTTP status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with HTTP status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(
        new Error("Network error encountered during upload. Please check your connection.")
      );
    };

    xhr.open("POST", "/api/upload", true);
    xhr.send(formData);
  });
}
