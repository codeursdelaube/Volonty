'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Compass, 
  ClipboardList, 
  Building2, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import { logoutAction } from '@/src/actions/auth';

interface MobileMenuProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
    };
  } | null;
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fermer le menu lors d'un changement de page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Mon Compte';

  const menuContent = (
    <div className="fixed inset-0 z-[9999] h-[100dvh] w-screen flex flex-col justify-between bg-white animate-in fade-in duration-200">
      
      {/* Header Mobile Menu */}
      <div className="flex items-center justify-between px-6 h-20 border-b border-stone-200/80 bg-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image
              src="/logo-icon.png"
              alt="Volonty Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold font-serif text-stone-900 tracking-tight">
            Volonty<span className="text-amber-500">.</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Fermer le menu"
          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Corps du menu avec défilement fluide */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 space-y-6 bg-white">
        
        {/* Profil utilisateur connecté */}
        {user && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {userName[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900 truncate text-sm">{userName}</p>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Liens de navigation */}
        <nav className="space-y-1">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors ${
              pathname === '/'
                ? 'bg-amber-100/70 text-amber-900 font-semibold'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Home className="w-5 h-5 text-amber-600" />
            Accueil
          </Link>

          <Link
            href="/events"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors ${
              pathname.startsWith('/events')
                ? 'bg-amber-100/70 text-amber-900 font-semibold'
                : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Compass className="w-5 h-5 text-amber-600" />
            Missions de Bénévolat
          </Link>

          {user ? (
            <>
              <Link
                href="/mes-candidatures"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors ${
                  pathname.startsWith('/mes-candidatures')
                    ? 'bg-amber-100/70 text-amber-900 font-semibold'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <ClipboardList className="w-5 h-5 text-amber-600" />
                Mes Candidatures
              </Link>

              <Link
                href="/organisateur/events"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors ${
                  pathname.startsWith('/organisateur') && !pathname.includes('/nouveau')
                    ? 'bg-amber-100/70 text-amber-900 font-semibold'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-5 h-5 text-amber-600" />
                Espace Organisateur
              </Link>

              <Link
                href="/profil"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors ${
                  pathname.startsWith('/profil')
                    ? 'bg-amber-100/70 text-amber-900 font-semibold'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <UserIcon className="w-5 h-5 text-amber-600" />
                Mon Profil
              </Link>
            </>
          ) : null}
        </nav>

        {/* Action principale Organisateur */}
        {user && (
          <div className="pt-2">
            <Link
              href="/organisateur/events/nouveau"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 shadow-md shadow-stone-900/10 transition-all active:scale-[0.99]"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              Créer un événement
            </Link>
          </div>
        )}
      </div>

      {/* Footer Mobile Menu (Connexion / Déconnexion) */}
      <div className="p-6 border-t border-stone-200/80 bg-stone-50/80 flex-shrink-0">
        {user ? (
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-semibold text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/connexion"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-300 bg-white font-semibold text-sm text-stone-800 hover:bg-stone-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Connexion
            </Link>
            <Link
              href="/inscription"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-md shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              S'inscrire
            </Link>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <div className="md:hidden flex items-center">
      {/* Bouton burger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
        aria-expanded={isOpen}
        className="p-2.5 rounded-xl text-stone-700 hover:text-amber-600 hover:bg-amber-50/80 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      >
        {isOpen ? <X className="w-6 h-6 text-stone-900" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay & Menu Mobile téléporté sur document.body */}
      {isOpen && mounted && createPortal(menuContent, document.body)}
    </div>
  );
}

