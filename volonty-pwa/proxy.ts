import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Rafraîchissement automatique de la session Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Protection des routes privées
  const isProtectedRoute =
    pathname.startsWith('/organisateur') ||
    pathname.startsWith('/mes-candidatures') ||
    pathname.startsWith('/profil');

  if (isProtectedRoute && !user) {
    url.pathname = '/connexion';
    url.searchParams.set('next', pathname + url.search);
    return NextResponse.redirect(url);
  }

  // 2. Redirection des utilisateurs déjà connectés
  const isAuthRoute = pathname === '/connexion' || pathname === '/inscription';

  if (isAuthRoute && user) {
    const next = url.searchParams.get('next') || '/events';
    const targetUrl = next.startsWith('/') && !next.startsWith('//') ? next : '/events';
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return supabaseResponse;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
