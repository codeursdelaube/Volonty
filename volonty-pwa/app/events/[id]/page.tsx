import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventDetails } from '@/src/actions/events';
import { getCurrentUser } from '@/src/lib/auth';
import { db } from '@/src/prisma/db';
import { ApplicationForm } from '@/src/components/applications/ApplicationForm';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ExternalLink, 
  HeartHandshake, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ArrowLeft
} from 'lucide-react';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventDetails(id);

  if (!event) {
    notFound();
  }

  const user = await getCurrentUser();

  // Vérifier si l'utilisateur connecté a déjà soumis une candidature
  let existingApplication = null;
  if (user) {
    existingApplication = await db.orm.public.Application
      .where({ eventId: event.id, volunteerId: user.id })
      .first();
  }

  const isClosed = event.status === 'CLOSED';
  const isDraft = event.status === 'DRAFT';

  return (
    <div className="min-h-screen py-10 bg-[#faf8f5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à toutes les missions
          </Link>
        </div>

        {/* Main Event Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm mb-10">
          
          {/* Cover Image */}
          <div className="relative h-64 sm:h-96 w-full bg-stone-100">
            {event.coverImageUrl ? (
              <Image
                src={event.coverImageUrl}
                alt={event.title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-amber-100 to-orange-100 flex items-center justify-center text-amber-600">
                <HeartHandshake className="w-16 h-16 opacity-50" />
              </div>
            )}

            <div className="absolute top-6 right-6 flex items-center gap-2">
              <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-stone-800 shadow-md">
                {event.remainingSlots} / {event.slots} places restantes
              </span>
              {isClosed && (
                <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                  Clôturé
                </span>
              )}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Title & Metadata */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1 font-semibold text-stone-800">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  {event.city} ({event.location})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Du {new Date(event.startsAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  au {new Date(event.endsAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 leading-tight">
                {event.title}
              </h1>

              {/* Organizer Badge */}
              {event.organizerProfile && (
                <div className="inline-flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                    {event.organizerProfile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 block">
                      Organisé par
                    </span>
                    <p className="text-xs font-bold text-stone-900">{event.organizerProfile.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Skills wanted */}
            {event.skillsWanted.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Compétences & Profils recherchés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.skillsWanted.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                À propos de la mission
              </h3>
              <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line font-sans">
                {event.description}
              </div>
            </div>

          </div>
        </div>

        {/* ================= APPLICATION SECTION ================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm">
          
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Rejoindre l&apos;équipe
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
              Candidature au bénévolat
            </h2>
          </div>

          {/* Condition 1: Event is closed or draft */}
          {isClosed ? (
            <div className="p-6 rounded-2xl bg-stone-100 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-700">
                Les candidatures pour cet événement sont désormais clôturées.
              </p>
              <p className="text-xs text-stone-500">
                Merci de votre intérêt ! Consultez les autres missions disponibles.
              </p>
            </div>
          ) : isDraft ? (
            <div className="p-6 rounded-2xl bg-amber-50 text-center text-xs text-amber-800 font-medium">
              Cet événement est encore en cours de préparation (brouillon).
            </div>
          ) : !user ? (
            /* Condition 2: User is not logged in */
            <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-4">
              <HeartHandshake className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Connectez-vous pour postuler
              </h3>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Pour candidater à cet événement et suivre l&apos;avancement de votre demande, connectez-vous ou créez votre compte gratuitement.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/connexion"
                  className="px-5 py-2.5 rounded-full bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="px-5 py-2.5 rounded-full bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          ) : existingApplication ? (
            /* Condition 3: User has already submitted */
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                {existingApplication.status === 'SUBMITTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Candidature soumise (En attente d&apos;examen)
                  </span>
                )}
                {existingApplication.status === 'ACCEPTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Félicitations ! Votre candidature est acceptée
                  </span>
                )}
                {existingApplication.status === 'REJECTED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    Candidature non retenue
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Vous avez déjà envoyé votre candidature pour cette mission le{' '}
                {new Date(existingApplication.submittedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}.
              </p>

              <div className="pt-2">
                <Link
                  href="/mes-candidatures"
                  className="text-xs font-semibold text-amber-600 hover:underline"
                >
                  Voir le suivi dans &quot;Mes Candidatures&quot; →
                </Link>
              </div>
            </div>
          ) : event.externalApplicationUrl ? (
            /* Condition 4: External Application URL */
            <div className="p-8 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-center space-y-4">
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Formulaire externe d&apos;inscription
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                L&apos;organisateur de cet événement a configuré un portail externe pour recevoir les candidatures.
              </p>
              <div className="pt-2">
                <a
                  href={event.externalApplicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20"
                >
                  <span>Accéder au formulaire externe</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : event.form ? (
            /* Condition 5: Internal Form */
            <ApplicationForm eventId={event.id} form={event.form} />
          ) : (
            <div className="p-6 rounded-2xl bg-stone-100 text-center text-xs text-stone-500">
              Aucun formulaire de candidature n&apos;a encore été publié pour cet événement.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
