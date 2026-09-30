'use client';

import { useActionState, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { registerAction } from '@/src/actions/auth';
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client';
import { HeartHandshake, ArrowRight, Lock, Mail, User } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function InscriptionContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/events';
  const hasOauthError = searchParams.get('error') === 'oauth';

  const [googleLoading, setGoogleLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(
    hasOauthError ? 'Échec de l’inscription avec Google. Veuillez réessayer.' : null
  );

  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const res = await registerAction(formData);
      return res;
    },
    null
  );

  async function handleGoogleSignUp() {
    try {
      setGoogleLoading(true);
      setOauthError(null);
      const supabase = createSupabaseBrowserClient();
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        setOauthError(error.message || 'Impossible d’initialiser l’inscription Google');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setOauthError(err?.message || 'Erreur imprévue lors de l’inscription Google');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#fffaf4] to-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-amber-100/80 shadow-xl shadow-stone-900/5">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white mx-auto shadow-md shadow-orange-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Rejoignez Volonty
          </h1>
          <p className="text-xs text-stone-500">
            Un seul compte pour postuler ou créer vos événements
          </p>
        </div>

        {/* Global Error */}
        {(state?.error || oauthError) && (
          <div className="p-3 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
            {state?.error || oauthError}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || isPending}
          className="w-full py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {googleLoading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <GoogleIcon />
          )}
          <span>Continuer avec Google</span>
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 font-medium">
            ou avec votre email
          </span>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Nom complet ou Prénom & Nom
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                required
                placeholder="Ex. Koffi Mensah"
                className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              />
            </div>
            {state?.fieldErrors?.fullName && (
              <p className="text-[11px] text-red-600 mt-1">{state.fieldErrors.fullName[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                placeholder="votre.email@exemple.com"
                className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              />
            </div>
            {state?.fieldErrors?.email && (
              <p className="text-[11px] text-red-600 mt-1">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Mot de passe (min. 6 caractères)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              />
            </div>
            {state?.fieldErrors?.password && (
              <p className="text-[11px] text-red-600 mt-1">{state.fieldErrors.password[0]}</p>
            )}
          </div>

          <p className="text-[11px] text-stone-500 leading-tight">
            En vous inscrivant, vous acceptez de rejoindre le réseau solidaire Volonty.
          </p>

          <button
            type="submit"
            disabled={isPending || googleLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isPending ? (
              <span>Création du compte...</span>
            ) : (
              <>
                <span>Créer mon compte</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500">
          Vous avez déjà un compte ?{' '}
          <Link
            href={`/connexion${next ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-amber-600 font-semibold hover:underline"
          >
            Se connecter
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <span className="loading loading-spinner text-amber-500 loading-lg"></span>
      </div>
    }>
      <InscriptionContent />
    </Suspense>
  );
}
