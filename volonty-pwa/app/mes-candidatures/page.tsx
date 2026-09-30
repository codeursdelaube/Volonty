import Link from 'next/link';
import Image from 'next/image';
import { requireUser } from '@/src/lib/auth';
import { getMyApplications } from '@/src/actions/applications';
import { 
  HeartHandshake, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default async function MesCandidaturesPage() {
  await requireUser();
  const applications = await getMyApplications();

  return (
    <div className="min-h-screen py-10 bg-[#faf8f5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Espace Bénévole
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
            Suivi de mes candidatures
          </h1>
          <p className="text-stone-600 text-sm max-w-xl">
            Retrouvez ici l&apos;ensemble de vos candidatures de bénévolat et suivez les réponses apportées par les organisateurs.
          </p>
        </div>

        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                
                <div className="flex items-start gap-4">
                  {/* Event thumbnail */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 overflow-hidden shrink-0 border border-stone-200">
                    {app.event?.coverImageUrl ? (
                      <Image
                        src={app.event.coverImageUrl}
                        alt={app.event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-600">
                        <HeartHandshake className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span>Postulé le {new Date(app.submittedAt).toLocaleDateString('fr-FR')}</span>
                      <span>•</span>
                      <span className="font-semibold text-amber-700">{app.organizerName}</span>
                    </div>

                    <h3 className="text-lg font-bold font-serif text-stone-900 hover:text-amber-600 transition-colors">
                      <Link href={`/events/${app.eventId}`}>
                        {app.event?.title || 'Événement'}
                      </Link>
                    </h3>

                    {app.event && (
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {app.event.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {new Date(app.event.startsAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-stone-100 gap-3">
                  
                  {app.status === 'SUBMITTED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      En cours d&apos;examen
                    </span>
                  )}

                  {app.status === 'ACCEPTED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Candidature Acceptée
                    </span>
                  )}

                  {app.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-bold">
                      <XCircle className="w-3.5 h-3.5 text-stone-500" />
                      Non retenue
                    </span>
                  )}

                  <Link
                    href={`/events/${app.eventId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-amber-600 transition-colors"
                  >
                    <span>Voir l&apos;événement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-stone-300 max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900">
              Vous n&apos;avez pas encore candidaté
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Découvrez les événements à venir au Togo et proposez votre aide bénévole dès aujourd&apos;hui.
            </p>
            <div className="pt-2">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
              >
                Explorer les missions
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
