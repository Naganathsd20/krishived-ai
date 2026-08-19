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

export interface UploadSignatureResponse {
  success: boolean;
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  error?: string;
}

/**
 * Fetch a server-signed Cloudinary authorization token.
 * CLOUDINARY_API_SECRET is kept strictly on the server.
 */
export async function fetchUploadSignature(): Promise<UploadSignatureResponse> {
  const res = await fetch("/api/upload", {
    method: "GET",
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to obtain upload authorization signature.");
  }

  return data;
}

/**
 * Reusable client-side upload utility to send images to Cloudinary via server-signed uploads
 * with server-side authentication, file validation, real-time progress callbacks, and fallback support.
 */
export async function uploadImageWithProgress({
  file,
  onProgress,
}: UploadOptions): Promise<UploadResponse> {
  // 1. Validate File Format
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error("Invalid file format. Please select a JPG, JPEG, PNG, or WEBP image.");
  }

  // 2. Validate Maximum Size (10MB)
  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error("File size exceeds 10MB limit. Please upload a smaller image.");
  }

  // 3. Request server-signed authorization token
  let sig: UploadSignatureResponse | null = null;
  try {
    sig = await fetchUploadSignature();
  } catch (sigErr) {
    console.warn("Could not fetch Cloudinary upload signature, using server upload endpoint fallback:", sigErr);
  }

  // 4. If signature exists, attempt direct server-signed upload to Cloudinary CDN
  if (sig && sig.signature && sig.cloudName && sig.apiKey) {
    try {
      return await new Promise<UploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sig.apiKey);
        formData.append("timestamp", sig.timestamp.toString());
        formData.append("signature", sig.signature);
        formData.append("folder", sig.folder || "krishived-crop-diseases");

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
              if (response.secure_url) {
                resolve({
                  success: true,
                  secure_url: response.secure_url,
                  public_id: response.public_id,
                  bytes: response.bytes,
                });
                return;
              }
            } catch {
              // Ignore parse error and reject to trigger server upload fallback
            }
          }
          reject(new Error(`Signed Cloudinary upload returned HTTP ${xhr.status}`));
        };

        xhr.onerror = () => {
          reject(new Error("Network error during Cloudinary signed upload"));
        };

        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, true);
        xhr.send(formData);
      });
    } catch (directErr) {
      console.warn("Direct signed Cloudinary upload failed. Falling back to server upload proxy:", directErr);
    }
  }

  // 5. Fallback: Upload through authenticated server route /api/upload
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.withCredentials = true;

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
