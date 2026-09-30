import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { db } from '@/src/prisma/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/events';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Synchroniser avec la base de données PostgreSQL via Prisma
      try {
        const existing = await db.orm.public.User.where({ id: data.user.id }).first();
        if (!existing) {
          await db.orm.public.User.create({
            id: data.user.id,
            email: data.user.email || '',
          });

          // Créer un profil bénévole initial avec les métadonnées Google
          const meta = data.user.user_metadata;
          const fullName =
            meta?.full_name ||
            meta?.name ||
            data.user.email?.split('@')[0] ||
            'Bénévole';

          await db.orm.public.VolunteerProfile.create({
            userId: data.user.id,
            fullName,
            skills: [],
          });
        }
      } catch (err) {
        console.error('Erreur synchronisation utilisateur Google :', err);
      }

      // Redirection sécurisée
      const targetPath = next.startsWith('/') && !next.startsWith('//') ? next : '/events';
      const forwardedHost = request.headers.get('x-forwarded-host');
      const origin = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin;
      return NextResponse.redirect(new URL(targetPath, origin));
    }
  }

  // En cas d'erreur
  const forwardedHost = request.headers.get('x-forwarded-host');
  const origin = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin;
  return NextResponse.redirect(new URL('/connexion?error=oauth', origin));
}
