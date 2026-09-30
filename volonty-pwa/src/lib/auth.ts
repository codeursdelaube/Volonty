import { createSupabaseServerClient } from './supabase/server';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Throws redirect to /connexion if no active session. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/connexion');
  }
  return user;
}
