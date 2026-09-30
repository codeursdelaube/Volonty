import Link from 'next/link';
import Image from 'next/image';
import { requireUser } from '@/src/lib/auth';
import { getOrganizerEventsWithStats } from '@/src/actions/events';
import { 
  Building2, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  HeartHandshake, 
  Settings, 
  Inbox
} from 'lucide-react';

export default async function OrganisateurEventsPage() {
  await requireUser();
  const events = await getOrganizerEventsWithStats();

  return (
    <div className="min-h-screen py-10 bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              Espace Organisateur
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
              Mes Événements & Missions
            </h1>
            <p className="text-stone-600 text-sm">
              Gérez vos appels à bénévoles, personnalisez vos formulaires et traitez les candidatures.
            </p>
          </div>

          <Link
            href="/organisateur/events/nouveau"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Créer un événement
          </Link>
        </div>

        {/* Events List */}
        {events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                
                {/* Event Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-50 overflow-hidden shrink-0 border border-stone-200">
                    {event.coverImageUrl ? (
                      <Image
                        src={event.coverImageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-600">
                        <HeartHandshake className="w-10 h-10 opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {event.status === 'PUBLISHED' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          Publié
                        </span>
                      )}
                      {event.status === 'DRAFT' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[11px] font-bold">
                          Brouillon
                        </span>
                      )}
                      {event.status === 'CLOSED' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                          Clôturé
                        </span>
                      )}
                      <span className="text-xs text-stone-500">
                        {event.slots} places prévues
                      </span>
                    </div>

                    <h2 className="text-xl font-bold font-serif text-stone-900">
                      {event.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        {event.city} ({event.location})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        {new Date(event.startsAt).toLocaleDateString('fr-FR')} - {new Date(event.endsAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Counters / Stats Banner */}
                <div className="grid grid-cols-3 gap-3 py-3 px-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-center lg:w-72 shrink-0">
                  <div>
                    <span className="block text-lg font-bold font-serif text-stone-900">{event.stats.total}</span>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Total</span>
                  </div>
                  <div className="border-x border-stone-200">
                    <span className="block text-lg font-bold font-serif text-emerald-600">{event.stats.accepted}</span>
                    <span className="text-[10px] text-emerald-700 uppercase font-semibold">Acceptées</span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold font-serif text-stone-500">{event.stats.rejected}</span>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold">Refusées</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-100 shrink-0">
                  <Link
                    href={`/organisateur/events/${event.id}/candidatures`}
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
                  >
                    <Inbox className="w-4 h-4 text-amber-400" />
                    <span>Candidatures ({event.stats.submitted})</span>
                  </Link>

                  <Link
                    href={`/organisateur/events/${event.id}`}
                    className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                    title="Paramètres & Formulaire"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-stone-300 max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900">
              Vous n&apos;avez encore créé aucun événement
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Lancez votre premier appel à bénévoles en définissant vos dates, votre lieu et vos besoins.
            </p>
            <div className="pt-2">
              <Link
                href="/organisateur/events/nouveau"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                Créer mon premier événement
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
