'use server';

import { requireUser } from '@/src/lib/auth';
import { isEventOwner } from '@/src/lib/permissions';
import { db } from '@/src/prisma/db';
import { eventSchema, type EventInput } from '@/src/lib/validations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createEventAction(data: EventInput) {
  const user = await requireUser();

  // Vérifier qu'un profil organisateur existe ou le créer par défaut
  let organizerProfile = await db.orm.public.OrganizerProfile.where({ userId: user.id }).first();
  if (!organizerProfile) {
    organizerProfile = await db.orm.public.OrganizerProfile.create({
      userId: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Organisateur',
      contactEmail: user.email || '',
    });
  }

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Veuillez vérifier les informations de l’événement',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const created = await db.orm.public.Event.create({
    organizerId: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    coverImageUrl: parsed.data.coverImageUrl ?? null,
    startsAt: new Date(parsed.data.startsAt).toISOString(),
    endsAt: new Date(parsed.data.endsAt).toISOString(),
    location: parsed.data.location,
    city: parsed.data.city,
    slots: parsed.data.slots,
    skillsWanted: parsed.data.skillsWanted,
    status: parsed.data.status,
    externalApplicationUrl: parsed.data.useExternalUrl ? (parsed.data.externalApplicationUrl ?? null) : null,
  });

  revalidatePath('/organisateur/events');
  revalidatePath('/events');

  return { success: true, eventId: created.id };
}

export async function updateEventAction(eventId: string, data: EventInput) {
  const user = await requireUser();
  const allowed = await isEventOwner(eventId, user.id);
  if (!allowed) {
    return { success: false, error: 'Action non autorisée' };
  }

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Veuillez vérifier les informations de l’événement',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.orm.public.Event.where({ id: eventId }).update({
    title: parsed.data.title,
    description: parsed.data.description,
    coverImageUrl: parsed.data.coverImageUrl ?? null,
    startsAt: new Date(parsed.data.startsAt).toISOString(),
    endsAt: new Date(parsed.data.endsAt).toISOString(),
    location: parsed.data.location,
    city: parsed.data.city,
    slots: parsed.data.slots,
    skillsWanted: parsed.data.skillsWanted,
    status: parsed.data.status,
    externalApplicationUrl: parsed.data.useExternalUrl ? (parsed.data.externalApplicationUrl ?? null) : null,
  });

  revalidatePath(`/organisateur/events/${eventId}`);
  revalidatePath('/organisateur/events');
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/events');

  return { success: true };
}

export async function setEventStatusAction(eventId: string, status: 'DRAFT' | 'PUBLISHED' | 'CLOSED') {
  const user = await requireUser();
  const allowed = await isEventOwner(eventId, user.id);
  if (!allowed) {
    return { success: false, error: 'Action non autorisée' };
  }

  // Si on publie, vérifier qu'il y a soit une URL externe, soit un formulaire interne avec au moins 1 champ
  if (status === 'PUBLISHED') {
    const event = await db.orm.public.Event.where({ id: eventId }).first();
    if (!event) return { success: false, error: 'Événement introuvable' };

    if (!event.externalApplicationUrl) {
      const form = await db.orm.public.Form.where({ eventId }).first();
      if (!form) {
        return {
          success: false,
          error: 'Veuillez configurer le formulaire de candidature ou définir un lien externe avant de publier.',
        };
      }
      const fields = await db.orm.public.FormField.where({ formId: form.id }).all();
      if (fields.length === 0) {
        return {
          success: false,
          error: 'Le formulaire de candidature doit comporter au moins une question avant publication.',
        };
      }
    }
  }

  await db.orm.public.Event.where({ id: eventId }).update({ status });

  revalidatePath(`/organisateur/events/${eventId}`);
  revalidatePath('/organisateur/events');
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/events');

  return { success: true };
}

export async function deleteEventAction(eventId: string) {
  const user = await requireUser();
  const allowed = await isEventOwner(eventId, user.id);
  if (!allowed) {
    return { success: false, error: 'Action non autorisée' };
  }

  await db.orm.public.Event.where({ id: eventId }).delete();

  revalidatePath('/organisateur/events');
  revalidatePath('/events');
  redirect('/organisateur/events');
}

export async function getPublicEvents(filters?: {
  city?: string;
  skill?: string;
  search?: string;
}) {
  let events = await db.orm.public.Event
    .where({ status: 'PUBLISHED' })
    .orderBy((e) => e.startsAt.asc())
    .all();

  // Filtrage mémoire propre pour la recherche textuelle, les tags et les villes
  if (filters?.city && filters.city !== 'all') {
    events = events.filter((e) => e.city.toLowerCase() === filters.city!.toLowerCase());
  }

  if (filters?.skill && filters.skill !== 'all') {
    events = events.filter((e) =>
      e.skillsWanted.some((s) => s.toLowerCase() === filters.skill!.toLowerCase())
    );
  }

  if (filters?.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase().trim();
    events = events.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  }

  // Récupérer les profils organisateurs correspondants
  const organizerIds = Array.from(new Set(events.map((e) => e.organizerId)));
  const organizers = await Promise.all(
    organizerIds.map(async (uid) => {
      const org = await db.orm.public.OrganizerProfile.where({ userId: uid }).first();
      return { userId: uid, profile: org };
    })
  );

  const orgMap = new Map(organizers.map((o) => [o.userId, o.profile]));

  return events.map((e) => ({
    ...e,
    organizerProfile: orgMap.get(e.organizerId) || null,
  }));
}

export async function getEventDetails(eventId: string) {
  const event = await db.orm.public.Event.where({ id: eventId }).first();
  if (!event) return null;

  const [organizerProfile, form, applications] = await Promise.all([
    db.orm.public.OrganizerProfile.where({ userId: event.organizerId }).first(),
    db.orm.public.Form.where({ eventId: event.id }).first(),
    db.orm.public.Application.where({ eventId: event.id }).all(),
  ]);

  let formFields: any[] = [];
  if (form) {
    formFields = await db.orm.public.FormField
      .where({ formId: form.id })
      .orderBy((f) => f.order.asc())
      .all();
  }

  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;
  const remainingSlots = Math.max(0, event.slots - acceptedCount);

  return {
    ...event,
    organizerProfile,
    form: form ? { ...form, fields: formFields } : null,
    totalApplications: applications.length,
    acceptedCount,
    remainingSlots,
  };
}

export async function getOrganizerEventsWithStats() {
  const user = await requireUser();

  const events = await db.orm.public.Event
    .where({ organizerId: user.id })
    .orderBy((e) => e.createdAt.desc())
    .all();

  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const applications = await db.orm.public.Application.where({ eventId: event.id }).all();
      const submitted = applications.filter((a) => a.status === 'SUBMITTED').length;
      const accepted = applications.filter((a) => a.status === 'ACCEPTED').length;
      const rejected = applications.filter((a) => a.status === 'REJECTED').length;

      return {
        ...event,
        stats: {
          total: applications.length,
          submitted,
          accepted,
          rejected,
        },
      };
    })
  );

  return eventsWithStats;
}
