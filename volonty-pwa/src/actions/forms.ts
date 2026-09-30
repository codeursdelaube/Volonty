'use server';

import { requireUser } from '@/src/lib/auth';
import { isEventOwner } from '@/src/lib/permissions';
import { db } from '@/src/prisma/db';
import { formSchema, type FormInput } from '@/src/lib/validations';
import { revalidatePath } from 'next/cache';

export async function saveEventFormAction(data: FormInput) {
  const user = await requireUser();
  const allowed = await isEventOwner(data.eventId, user.id);
  if (!allowed) {
    return { success: false, error: 'Action non autorisée' };
  }

  const parsed = formSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Formulaire invalide',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Vérifier si l'événement a un lien externe : ils sont mutuellement exclusifs
  const event = await db.orm.public.Event.where({ id: data.eventId }).first();
  if (event?.externalApplicationUrl) {
    // Si on enregistre un formulaire interne, réinitialiser l'URL externe
    await db.orm.public.Event.where({ id: data.eventId }).update({
      externalApplicationUrl: null,
    });
  }

  // Rechercher ou créer le formulaire
  let form = await db.orm.public.Form.where({ eventId: data.eventId }).first();

  if (form) {
    await db.orm.public.Form.where({ id: form.id }).update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    });
    // Supprimer les anciens champs pour les recréer proprement avec le nouvel ordre
    const oldFields = await db.orm.public.FormField.where({ formId: form.id }).all();
    for (const f of oldFields) {
      await db.orm.public.FormField.where({ id: f.id }).delete();
    }
  } else {
    form = await db.orm.public.Form.create({
      eventId: data.eventId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    });
  }

  // Créer les champs du formulaire
  for (let i = 0; i < parsed.data.fields.length; i++) {
    const f = parsed.data.fields[i];
    await db.orm.public.FormField.create({
      formId: form.id,
      label: f.label,
      type: f.type,
      required: f.required,
      order: i,
      options: f.options || [],
    });
  }

  revalidatePath(`/organisateur/events/${data.eventId}`);
  revalidatePath(`/events/${data.eventId}`);
  return { success: true };
}

export async function getEventForm(eventId: string) {
  const form = await db.orm.public.Form.where({ eventId }).first();
  if (!form) return null;

  const fields = await db.orm.public.FormField
    .where({ formId: form.id })
    .orderBy((f) => f.order.asc())
    .all();

  return {
    ...form,
    fields,
  };
}
