/**
 * SUPABASE STORAGE UTILITIES
 *
 * Handles file uploads to Supabase Storage for:
 * - Help article images
 * - Other media assets
 */

import { supabase } from "@/integrations/supabase/client";

const HELP_ARTICLES_BUCKET = "help-articles";

/**
 * Upload an image file to Supabase storage
 * @param file - The file to upload
 * @param folder - Optional subfolder within the bucket
 * @returns The public URL of the uploaded image, or null on failure
 */
export async function uploadImage(
  file: File,
  folder: string = "images"
): Promise<string | null> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `${folder}/${timestamp}-${randomId}.${extension}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(HELP_ARTICLES_BUCKET)
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(HELP_ARTICLES_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Upload failed:", err);
    return null;
  }
}

/**
 * Validate that a file is an allowed image type
 */
export function isValidImageFile(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return allowedTypes.includes(file.type);
}

/**
 * Get max file size in bytes (5MB)
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * Validate file size
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE;
}
