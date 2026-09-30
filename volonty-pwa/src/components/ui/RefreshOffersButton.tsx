'use client';

import { useState } from 'react';
import { RotateCw, Sparkles } from 'lucide-react';

export function RefreshOffersButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Recharge la page complète pour récupérer immédiatement les toutes dernières offres
    window.location.reload();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        id="btn-refresh-offers"
        title="Actualiser pour voir les dernières offres publiées"
        aria-label="Recharger les nouvelles offres"
        className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-stone-900/95 hover:bg-stone-900 text-white shadow-2xl shadow-stone-900/40 border border-stone-700/60 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer font-medium text-sm"
      >
        {/* Pastille pulsante animée */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>

        {/* Texte du bouton */}
        <span className="tracking-wide font-semibold text-stone-100 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 inline group-hover:rotate-12 transition-transform" />
          Nouvelles offres
        </span>

        {/* Icône de rechargement */}
        <RotateCw
          className={`w-4 h-4 text-stone-400 group-hover:text-white transition-all ${
            isRefreshing ? 'animate-spin text-amber-400' : 'group-hover:rotate-180'
          }`}
        />
      </button>
    </div>
  );
}
