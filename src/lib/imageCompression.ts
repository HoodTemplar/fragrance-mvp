/**
 * Client-side image compression for upload flow.
 * Resizes to max 1024px on the longest side and compresses to JPEG (70–75% quality)
 * so payloads stay under size limits (e.g. Vercel 4.5MB).
 */

const MAX_LONGEST_SIDE = 1024;
const JPEG_QUALITY = 0.72; // 72%, in the 70–75% range

export interface CompressedImage {
  blob: Blob;
  base64: string;
  mimeType: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      if (!base64) reject(new Error("Failed to read blob"));
      else resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Resize image so the longest side is MAX_LONGEST_SIDE, then encode as JPEG at JPEG_QUALITY.
 * Returns blob, base64, and mimeType for use in analysis and storage.
 */
export function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const scale = MAX_LONGEST_SIDE / Math.max(w, h);
      const width = Math.round(w * scale);
      const height = Math.round(h * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not compress image"));
            return;
          }
          blobToBase64(blob)
            .then((base64) =>
              resolve({
                blob,
                base64,
                mimeType: "image/jpeg",
              })
            )
            .catch(reject);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };

    img.src = url;
  });
}
