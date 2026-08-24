import { createAdminClient } from './supabase/admin';

const BUCKET = 'payment-proofs';

export async function uploadPaymentScreenshot(orderId: string, file: File): Promise<string> {
  const db = createAdminClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${orderId}/${Date.now()}.${ext}`;

  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  return path;
}

/** The bucket is private, so viewers (the admin dashboard) need a short-lived signed URL rather than a public one. */
export async function signedScreenshotUrl(path: string): Promise<string | null> {
  const db = createAdminClient();
  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}
