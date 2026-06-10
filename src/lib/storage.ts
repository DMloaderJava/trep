import { supabase } from "@/integrations/supabase/client";

/** Returns a short-lived signed URL for a private bucket object. */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}
