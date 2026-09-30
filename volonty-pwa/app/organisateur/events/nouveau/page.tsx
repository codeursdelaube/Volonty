import Link from 'next/link';
import { requireUser } from '@/src/lib/auth';
import { EventCreateForm } from '@/src/components/events/EventCreateForm';
import { ArrowLeft, PlusCircle } from 'lucide-react';

export default async function NouveauEventPage() {
  await requireUser();

  return (
    <div className="min-h-screen py-10 bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/organisateur/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à mes événements
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
            Nouvelle mission
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
            Publier un appel à bénévoles
          </h1>
          <p className="text-stone-600 text-sm">
            Renseignez les détails de votre événement pour attirer des candidats motivés.
          </p>
        </div>

        <EventCreateForm />

      </div>
    </div>
  );
}
