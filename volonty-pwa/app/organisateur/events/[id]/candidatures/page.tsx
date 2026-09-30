import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/src/lib/auth';
import { isEventOwner } from '@/src/lib/permissions';
import { db } from '@/src/prisma/db';
import { getEventApplications } from '@/src/actions/applications';
import { CandidatesTable } from '@/src/components/applications/CandidatesTable';
import { ArrowLeft, Inbox, Settings } from 'lucide-react';

interface CandidaturesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventCandidaturesPage({ params }: CandidaturesPageProps) {
  const { id } = await params;
  const user = await requireUser();

  const allowed = await isEventOwner(id, user.id);
  if (!allowed) notFound();

  const event = await db.orm.public.Event.where({ id }).first();
  if (!event) notFound();

  const organizerProfile = await db.orm.public.OrganizerProfile.where({ userId: event.organizerId }).first();
  const applications = await getEventApplications(id);

  const total = applications.length;
  const submitted = applications.filter((a) => a.status === 'SUBMITTED').length;
  const accepted = applications.filter((a) => a.status === 'ACCEPTED').length;
  const rejected = applications.filter((a) => a.status === 'REJECTED').length;

  return (
    <div className="min-h-screen py-10 bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/organisateur/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à mes événements
          </Link>

          <Link
            href={`/organisateur/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Paramètres & Formulaire
          </Link>
        </div>

        {/* Header & Stats Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
              <Inbox className="w-3.5 h-3.5 text-amber-600" />
              Traitement des candidatures
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {event.title}
            </h1>
            <p className="text-xs text-stone-500">
              {event.city} • {event.slots} places prévues au total
            </p>
          </div>

          {/* Counters */}
          <div className="flex items-center gap-4 text-center">
            <div className="px-4 py-2 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="block text-xl font-bold font-serif text-stone-900">{total}</span>
              <span className="text-[10px] text-stone-500 uppercase font-semibold">Total</span>
            </div>
            <div className="px-4 py-2 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="block text-xl font-bold font-serif text-amber-700">{submitted}</span>
              <span className="text-[10px] text-amber-800 uppercase font-semibold">En attente</span>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="block text-xl font-bold font-serif text-emerald-700">{accepted}</span>
              <span className="text-[10px] text-emerald-800 uppercase font-semibold">Acceptées</span>
            </div>
            <div className="px-4 py-2 bg-stone-100 rounded-2xl border border-stone-200">
              <span className="block text-xl font-bold font-serif text-stone-600">{rejected}</span>
              <span className="text-[10px] text-stone-500 uppercase font-semibold">Refusées</span>
            </div>
          </div>
        </div>

        {/* Table & Actions */}
        <CandidatesTable
          applications={applications}
          eventTitle={event.title}
          organizerName={organizerProfile?.name || 'Organisateur'}
        />

      </div>
    </div>
  );
}
