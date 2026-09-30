import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/src/lib/auth';
import { logoutAction } from '@/src/actions/auth';
import { HeartHandshake, User, PlusCircle, LogOut } from 'lucide-react';
import { MobileMenu } from './MobileMenu';

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 bg-[#fffdfa]/95 backdrop-blur-md border-b border-amber-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo-icon.png"
                alt="Volonty Logo"
                width={44}
                height={44}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold font-serif tracking-tight text-stone-900">
              Volonty<span className="text-amber-500">.</span>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-800">
            <Link href="/" className="hover:text-amber-600 transition-colors">
              Accueil
            </Link>
            <Link href="/events" className="hover:text-amber-600 transition-colors">
              Missions de Bénévolat
            </Link>
            {user && (
              <>
                <Link href="/mes-candidatures" className="hover:text-amber-600 transition-colors">
                  Mes Candidatures
                </Link>
                <Link href="/organisateur/events" className="hover:text-amber-600 transition-colors">
                  Espace Organisateur
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/organisateur/events/nouveau"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  Créer un événement
                </Link>

                <Link
                  href="/profil"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  Mon Profil
                </Link>

                <form action={logoutAction} className="hidden sm:block">
                  <button
                    type="submit"
                    title="Se déconnecter"
                    className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/connexion"
                  className="px-4 py-2 text-sm font-medium text-stone-800 hover:text-amber-600 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02]"
                >
                  Rejoindre Volonty
                </Link>
              </div>
            )}

            {/* Menu burger mobile */}
            <MobileMenu user={user} />
          </div>

        </div>
      </div>
    </header>
  );
}
