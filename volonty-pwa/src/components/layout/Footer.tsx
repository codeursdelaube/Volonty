import Link from 'next/link';
import { HeartHandshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white font-serif">
                Volonty<span className="text-amber-500">.</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              La plateforme unifiée pour le bénévolat événementiel au Togo et en Afrique francophone. Rapprocher les volontés, simplifier les candidatures et démultiplier l'impact sur le terrain.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-stone-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              Plateforme active pour le Togo & l'Afrique de l'Ouest
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-200 mb-4 font-sans">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-amber-400 transition-colors">
                  Découvrir les missions
                </Link>
              </li>
              <li>
                <Link href="/mes-candidatures" className="hover:text-amber-400 transition-colors">
                  Mes candidatures
                </Link>
              </li>
              <li>
                <Link href="/organisateur/events" className="hover:text-amber-400 transition-colors">
                  Espace Organisateur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-200 mb-4 font-sans">
              Organisateurs
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/organisateur/events/nouveau" className="hover:text-amber-400 transition-colors">
                  Créer un appel à bénévoles
                </Link>
              </li>
              <li>
                <Link href="/profil" className="hover:text-amber-400 transition-colors">
                  Profil de l'organisation
                </Link>
              </li>
              <li>
                <span className="text-stone-400">Support : contact@volonty.org</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Volonty. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span>Fait pour dynamiser l'engagement solidaire</span>
            <span>•</span>
            <span>Lomé, Togo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
