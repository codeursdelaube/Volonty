import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/src/prisma/db';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Award,
  Globe2,
  HeartHandshake
} from 'lucide-react';

export default async function HomePage() {
  // Récupérer les événements réels publiés depuis la base Prisma 8
  const publishedEvents = await db.orm.public.Event
    .where({ status: 'PUBLISHED' })
    .orderBy((e) => e.startsAt.asc())
    .limit(3)
    .all();

  // Statistiques réelles depuis la base
  const allEventsCount = await db.orm.public.Event.all();
  const allVolunteersCount = await db.orm.public.VolunteerProfile.all();
  const allApplicationsCount = await db.orm.public.Application.all();

  const totalEvents = allEventsCount.length;
  const totalVolunteers = allVolunteersCount.length;
  const totalApplications = allApplicationsCount.length;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-[#fff9f0] via-[#fffdfa] to-white">
        
        {/* Subtle decorative circles */}
        <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-amber-400 opacity-80 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-orange-500 opacity-60"></div>
        <div className="absolute top-16 right-1/3 w-3.5 h-3.5 rounded-full bg-sky-500 opacity-70"></div>
        <div className="absolute bottom-20 left-1/2 w-4 h-4 rounded-full bg-emerald-500 opacity-60"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Plateforme de Bénévolat Événementiel au Togo
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 font-serif leading-[1.12]">
                La solidarité <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  commence là où
                </span> <br />
                l'action s'unit.
              </h1>

              <p className="text-lg text-stone-600 max-w-xl leading-relaxed font-sans">
                Fini les formulaires Google Forms dispersés dans les groupes WhatsApp. Volonty réunit organisateurs et bénévoles en un lieu unique pour créer, candidater et transformer nos communautés.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/10 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Découvrir les missions
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>

                <Link
                  href="/organisateur/events/nouveau"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-semibold rounded-full bg-white text-stone-800 border border-stone-200 hover:bg-amber-50/50 hover:border-amber-300 transition-all shadow-sm"
                >
                  Publier un événement
                </Link>
              </div>

              {/* Quick stats mini ribbon */}
              <div className="pt-6 border-t border-amber-100/80 flex items-center gap-8 text-sm">
                <div>
                  <span className="block text-2xl font-bold font-serif text-stone-900">{totalEvents}</span>
                  <span className="text-xs text-stone-500 font-medium">Événements créés</span>
                </div>
                <div className="w-px h-8 bg-stone-200"></div>
                <div>
                  <span className="block text-2xl font-bold font-serif text-stone-900">{totalVolunteers}</span>
                  <span className="text-xs text-stone-500 font-medium">Bénévoles inscrits</span>
                </div>
                <div className="w-px h-8 bg-stone-200"></div>
                <div>
                  <span className="block text-2xl font-bold font-serif text-stone-900">{totalApplications}</span>
                  <span className="text-xs text-stone-500 font-medium">Candidatures</span>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Collage inspired by design */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-lg lg:max-w-none">
                
                {/* Background glow & decorative map motif */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-amber-200/40 via-orange-100/20 to-transparent rounded-[3rem] blur-2xl -z-10"></div>

                {/* Hero image cutout container */}
                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-stone-900/10 aspect-[4/3] sm:aspect-[16/11]">
                  <Image
                    src="/hero.png"
                    alt="Bénévoles engagés au Togo"
                    fill
                    priority
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="px-3 py-1 rounded-full bg-amber-500/90 text-xs font-semibold tracking-wide uppercase">
                      Action communautaire
                    </span>
                    <h3 className="text-xl font-bold font-serif mt-2">
                      Faire rayonner la jeunesse engagée
                    </h3>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-6 -left-6 sm:bottom-4 sm:-left-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-amber-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">100% Gratuit</p>
                    <p className="text-[11px] text-stone-500">Pour tous les volontaires</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= VALUE PROPOSITIONS ================= */}
      <section className="py-20 bg-stone-50/70 border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Pourquoi Volonty ?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 font-serif mt-2">
              Faire la différence ensemble
            </h2>
            <p className="text-stone-600 text-sm mt-3">
              Une infrastructure moderne conçue sur mesure pour répondre aux défis réels du bénévolat associatif.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-serif mb-2">Accès Libre</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Inscription gratuite pour tous les bénévoles et les associations locales à but non lucratif.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-serif mb-2">Impact Local</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Des initiatives concrètes de terrain menées par et pour nos communautés au Togo et en Afrique de l'Ouest.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-serif mb-2">Formulaires Directs</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Questions personnalisées et upload sécurisé de CV. Fini les tableurs égarés et les messages WhatsApp perdus.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-serif mb-2">Suivi & Mails</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Suivi transparent des statuts de candidature et notifications par mail pour chaque décision de l'organisateur.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= ABOUT / STORY SECTION ================= */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Montage */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Main circle image */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden border-8 border-stone-50 shadow-2xl mx-auto">
                  <Image
                    src="/etu.png"
                    alt="Étudiant bénévole"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Secondary overlapping circle */}
                <div className="absolute -bottom-6 -right-4 sm:bottom-0 sm:right-0 w-44 h-44 rounded-full overflow-hidden border-6 border-white shadow-xl">
                  <Image
                    src="/orga.png"
                    alt="Organisateur engagé"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Decorative accent element */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-amber-100 rounded-full -z-10 blur-xl"></div>
              </div>
            </div>

            {/* Narrative Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                Notre Vision
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-stone-900 font-serif leading-tight">
                Changer des vies grâce au partage & à l'action
              </h2>
              <p className="text-stone-600 leading-relaxed font-sans text-sm sm:text-base">
                Chaque année, des centaines de festivals, conférences, marathons, actions écologiques et campagnes médicales peinent à mobiliser les bras et les compétences dont ils ont besoin. En parallèle, des milliers de jeunes et de professionnels cherchent où se rendre utiles.
              </p>
              <p className="text-stone-600 leading-relaxed font-sans text-sm sm:text-base">
                Volonty crée cette passerelle durable, en permettant aux porteurs de projet de concevoir leurs formulaires d'admission, de sélectionner avec soin leurs équipes, et de valoriser l'engagement bénévole.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/events"
                  className="px-6 py-3 rounded-full bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm"
                >
                  Explorer les opportunités
                </Link>
                <Link
                  href="/inscription"
                  className="px-6 py-3 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium text-sm hover:bg-amber-100 transition-colors"
                >
                  Devenir bénévole
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FEATURED CAMPAIGNS / EVENTS ================= */}
      <section className="py-24 bg-[#faf8f5] border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                Opportunités du moment
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 font-serif mt-2">
                Missions de Bénévolat en Vedette
              </h2>
              <p className="text-stone-600 text-sm mt-2">
                Rejoignez des équipes dynamiques et apportez votre pierre à l'édifice.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Voir toutes les missions ({totalEvents})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards Grid */}
          {publishedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group"
                >
                  {/* Event Cover Image */}
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

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          {event.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          {new Date(event.startsAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold font-serif text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {event.title}
                      </h3>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Skills Tags */}
                      {event.skillsWanted.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {event.skillsWanted.slice(0, 3).map((tag, idx) => (
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
                      <span className="text-xs font-medium text-stone-500">
                        {event.location}
                      </span>

                      <Link
                        href={`/events/${event.id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors shadow-sm"
                      >
                        Candidater
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Clean Empty State when database has 0 published events */
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-stone-900">
                Aucune mission publiée pour le moment
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Vous organisez un événement associatif, culturel ou solidaire ? Soyez le premier à lancer votre appel à bénévoles sur la plateforme !
              </p>
              <div className="pt-2">
                <Link
                  href="/organisateur/events/nouveau"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
                >
                  Publier le premier événement
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ================= COMMUNITY CTA ================= */}
      <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-block px-3.5 py-1 rounded-full bg-stone-800 text-amber-400 text-xs font-semibold tracking-wide">
            Prêt à vous investir ?
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif max-w-2xl mx-auto leading-tight">
            Donnez de votre temps, recevez de l'expérience et créez du lien.
          </h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Créez votre profil en 2 minutes et commencez à postuler aux événements qui vous tiennent à cœur.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/inscription"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30"
            >
              Créer mon compte bénévole
            </Link>
            <Link
              href="/events"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-sm hover:bg-stone-700 transition-colors"
            >
              Parcourir les annonces
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
