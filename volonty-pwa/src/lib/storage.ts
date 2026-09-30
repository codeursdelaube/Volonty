import { createSupabaseServerClient } from './supabase/server';

export const EVENT_COVERS_BUCKET = 'event-covers';
export const CV_UPLOADS_BUCKET = 'cv-uploads';

export async function uploadEventCover(file: File, eventId: string): Promise<{ url: string | null; error: string | null }> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return { url: null, error: 'Format d’image non supporté (seuls JPG, PNG, WebP sont acceptés)' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'L’image dépasse la limite de 5 Mo' };
  }

  const supabase = await createSupabaseServerClient();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const filePath = `${eventId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(EVENT_COVERS_BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Upload cover error:', uploadError);
    return { url: null, error: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from(EVENT_COVERS_BUCKET)
    .getPublicUrl(filePath);

  return { url: publicUrlData.publicUrl, error: null };
}

export async function uploadVolunteerCV(file: File, applicationId: string): Promise<{ path: string | null; error: string | null }> {
  if (file.type !== 'application/pdf') {
    return { path: null, error: 'Seuls les fichiers PDF sont acceptés pour le CV' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { path: null, error: 'Le fichier dépasse la limite de 5 Mo' };
  }

  const supabase = await createSupabaseServerClient();
  const filePath = `${applicationId}/${Date.now()}_cv.pdf`;

  const { error: uploadError } = await supabase.storage
    .from(CV_UPLOADS_BUCKET)
    .upload(filePath, file, {
      upsert: true,
      contentType: 'application/pdf',
    });

  if (uploadError) {
    console.error('Upload CV error:', uploadError);
    return { path: null, error: uploadError.message };
  }

  return { path: filePath, error: null };
}

export async function getCvSignedUrl(filePath: string, expiresInSeconds: number = 3600): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(CV_UPLOADS_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    return { url: null, error: error.message };
  }

  return { url: data.signedUrl, error: null };
}
