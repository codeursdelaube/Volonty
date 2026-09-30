import Link from 'next/link';
import Image from 'next/image';
import { getPublicEvents } from '@/src/actions/events';
import { MapPin, Calendar, Users, Search, ArrowRight, HeartHandshake, Filter } from 'lucide-react';

interface EventsPageProps {
  searchParams: Promise<{
    city?: string;
    skill?: string;
    q?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const currentCity = params.city || 'all';
  const currentSkill = params.skill || 'all';
  const searchQuery = params.q || '';

  const events = await getPublicEvents({
    city: currentCity,
    skill: currentSkill,
    search: searchQuery,
  });

  const togoCities = [
    'Toutes les villes',
    'Lomé',
    'Kara',
    'Sokodé',
    'Kpalimé',
    'Atakpamé',
    'Aného',
    'Dapaong',
    'Tsévié',
  ];

  const commonSkills = [
    'Toutes les compétences',
    'Accueil & Orientation',
    'Logistique & Montage',
    'Communication & Médias',
    'Photographie & Vidéo',
    'Secourisme & Santé',
    'Informatique & Technique',
    'Animation & Sport',
    'Restauration',
  ];

  return (
    <div className="min-h-screen py-10 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            Missions de Bénévolat Ouvertes
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-stone-900">
            Trouvez une mission qui vous inspire
          </h1>
          <p className="text-stone-600 text-sm max-w-2xl">
            Parcourez les événements qui ont besoin de vos talents au Togo. Filtrez par ville ou compétence et postulez en quelques clics.
          </p>
        </div>

        {/* Filters Form */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200/80 shadow-sm mb-10">
          <form method="GET" action="/events" className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Rechercher par titre, lieu ou mot-clé..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              />
            </div>

            {/* City Selector */}
            <div className="sm:col-span-3">
              <select
                name="city"
                defaultValue={currentCity}
                className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              >
                {togoCities.map((city, idx) => (
                  <option key={idx} value={idx === 0 ? 'all' : city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Selector */}
            <div className="sm:col-span-3">
              <select
                name="skill"
                defaultValue={currentSkill}
                className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              >
                {commonSkills.map((skill, idx) => (
                  <option key={idx} value={idx === 0 ? 'all' : skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <div className="sm:col-span-1">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center shadow-sm"
                title="Filtrer"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Active filters pill display */}
          {(currentCity !== 'all' || currentSkill !== 'all' || searchQuery) && (
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500 flex-wrap">
              <span>Filtres appliqués :</span>
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                  Mot-clé : &quot;{searchQuery}&quot;
                </span>
              )}
              {currentCity !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                  Ville : {currentCity}
                </span>
              )}
              {currentSkill !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                  Compétence : {currentSkill}
                </span>
              )}
              <Link href="/events" className="text-amber-600 font-medium hover:underline ml-2">
                Effacer les filtres
              </Link>
            </div>
          )}
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-52 w-full bg-stone-100 overflow-hidden">
                  {event.coverImageUrl ? (
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-amber-100 to-orange-100 flex items-center justify-center text-amber-600">
                      <HeartHandshake className="w-12 h-12 opacity-60" />
                    </div>
                  )}

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-stone-800 shadow-sm">
                    {event.slots} places
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1 font-medium text-stone-700">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        {event.city}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {new Date(event.startsAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-serif text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>

                    {event.organizerProfile && (
                      <p className="text-xs font-semibold text-amber-700">
                        Par {event.organizerProfile.name}
                      </p>
                    )}

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Tags */}
                    {event.skillsWanted.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {event.skillsWanted.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>

                  <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs text-stone-500 truncate max-w-[150px]">
                      {event.location}
                    </span>

                    <Link
                      href={`/events/${event.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
                    >
                      Détails & Postuler
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-stone-300 max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900">
              Aucune mission ne correspond à vos critères
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Essayez d&apos;élargir vos filtres de recherche ou consultez la liste complète des missions disponibles.
            </p>
            <div className="pt-2">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Réinitialiser la recherche
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
