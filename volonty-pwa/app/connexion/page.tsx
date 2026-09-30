'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/src/actions/auth';
import { HeartHandshake, ArrowRight, Lock, Mail } from 'lucide-react';

export default function ConnexionPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const res = await loginAction(formData);
      return res;
    },
    null
  );

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#fffaf4] to-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-amber-100/80 shadow-xl shadow-stone-900/5">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white mx-auto shadow-md shadow-orange-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Bon retour parmi nous
          </h1>
          <p className="text-xs text-stone-500">
            Connectez-vous pour gérer vos candidatures ou vos événements
          </p>
        </div>

        {/* Global Error message */}
        {state?.error && (
          <div className="p-3 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
            {state.error}
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-5">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Mot de passe
              </label>
            </div>
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-amber-600 font-semibold hover:underline">
            Créer un compte gratuitement
          </Link>
        </div>

      </div>
    </div>
  );
}
