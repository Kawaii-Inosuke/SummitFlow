import { supabase } from "./client";

/**
 * Uploads an event cover image to Supabase Storage.
 * Returns the public URL on success, null on failure.
 */
export async function uploadEventCover(file: File, eventId: string): Promise<string | null> {
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${eventId}-${Date.now()}.${fileExt}`;
  const filePath = `event-covers/${fileName}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  const { data } = supabase.storage
    .from("event-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
