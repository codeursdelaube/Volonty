import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/src/lib/auth';
import { isEventOwner } from '@/src/lib/permissions';
import { db } from '@/src/prisma/db';
import { EventEditTabs } from '@/src/components/events/EventEditTabs';
import { ArrowLeft, Settings } from 'lucide-react';

interface EventEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventEditPage({ params }: EventEditPageProps) {
  const { id } = await params;
  const user = await requireUser();

  const allowed = await isEventOwner(id, user.id);
  if (!allowed) {
    notFound();
  }

  const event = await db.orm.public.Event.where({ id }).first();
  if (!event) notFound();

  const form = await db.orm.public.Form.where({ eventId: id }).first();
  let fields: any[] = [];
  if (form) {
    fields = await db.orm.public.FormField
      .where({ formId: form.id })
      .orderBy((f) => f.order.asc())
      .all();
  }

  return (
    <div className="min-h-screen py-10 bg-[#faf8f5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
            <Settings className="w-3.5 h-3.5 text-amber-600" />
            Configuration de la mission
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
            {event.title}
          </h1>
          <p className="text-stone-600 text-sm">
            Ajustez les paramètres de l&apos;événement et définissez les questions de votre formulaire de candidature.
          </p>
        </div>

        <EventEditTabs
          event={event}
          form={form ? { ...form, fields } : null}
        />

      </div>
    </div>
  );
}
