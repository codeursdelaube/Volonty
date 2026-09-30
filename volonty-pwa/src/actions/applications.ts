'use server';

import { requireUser } from '@/src/lib/auth';
import { isEventOwner, canViewApplication } from '@/src/lib/permissions';
import { db } from '@/src/prisma/db';
import { sendDecisionEmail } from '@/src/lib/email';
import { getCvSignedUrl } from '@/src/lib/storage';
import { revalidatePath } from 'next/cache';

export async function submitApplicationAction(formData: FormData) {
  const user = await requireUser();
  const eventId = formData.get('eventId') as string;

  if (!eventId) {
    return { success: false, error: 'Identifiant d’événement manquant' };
  }

  // 1. Vérifier l'événement
  const event = await db.orm.public.Event.where({ id: eventId }).first();
  if (!event || event.status !== 'PUBLISHED') {
    return { success: false, error: 'Cet événement n’accepte plus de candidatures pour le moment.' };
  }

  // 2. Vérifier si l'utilisateur a déjà postulé
  const existingApp = await db.orm.public.Application
    .where({ eventId, volunteerId: user.id })
    .first();

  if (existingApp) {
    return { success: false, error: 'Vous avez déjà soumis votre candidature pour cet événement.' };
  }

  // 3. Récupérer le formulaire et ses champs
  const form = await db.orm.public.Form.where({ eventId }).first();
  if (!form) {
    return { success: false, error: 'Formulaire de candidature introuvable.' };
  }

  const fields = await db.orm.public.FormField
    .where({ formId: form.id })
    .orderBy((f) => f.order.asc())
    .all();

  // 4. Créer la candidature
  const application = await db.orm.public.Application.create({
    eventId,
    volunteerId: user.id,
    status: 'SUBMITTED',
  });

  // 5. Enregistrer les réponses
  for (const field of fields) {
    const rawVal = formData.get(`field_${field.id}`);

    if (field.required && (!rawVal || (typeof rawVal === 'string' && rawVal.trim() === ''))) {
      // Nettoyage en cas d'erreur
      await db.orm.public.Application.where({ id: application.id }).delete();
      return { success: false, error: `Le champ "${field.label}" est obligatoire.` };
    }

    if (field.type === 'FILE') {
      // Le chemin Supabase Storage ou URL signée est passé comme texte
      const filePath = typeof rawVal === 'string' ? rawVal : null;
      await db.orm.public.ApplicationAnswer.create({
        applicationId: application.id,
        fieldId: field.id,
        fileUrl: filePath,
      });
    } else {
      const textVal = typeof rawVal === 'string' ? rawVal : null;
      await db.orm.public.ApplicationAnswer.create({
        applicationId: application.id,
        fieldId: field.id,
        textValue: textVal,
      });
    }
  }

  revalidatePath('/mes-candidatures');
  revalidatePath(`/events/${eventId}`);
  return { success: true, applicationId: application.id };
}

export async function getMyApplications() {
  const user = await requireUser();

  const applications = await db.orm.public.Application
    .where({ volunteerId: user.id })
    .orderBy((a) => a.submittedAt.desc())
    .all();

  const results = await Promise.all(
    applications.map(async (app) => {
      const event = await db.orm.public.Event.where({ id: app.eventId }).first();
      let organizerName = 'Organisateur';
      if (event) {
        const org = await db.orm.public.OrganizerProfile.where({ userId: event.organizerId }).first();
        if (org) organizerName = org.name;
      }

      return {
        ...app,
        event,
        organizerName,
      };
    })
  );

  return results;
}

export async function getEventApplications(eventId: string) {
  const user = await requireUser();
  const allowed = await isEventOwner(eventId, user.id);
  if (!allowed) {
    throw new Error('Action non autorisée');
  }

  const applications = await db.orm.public.Application
    .where({ eventId })
    .orderBy((a) => a.submittedAt.desc())
    .all();

  const applicants = await Promise.all(
    applications.map(async (app) => {
      const volunteer = await db.orm.public.VolunteerProfile.where({ userId: app.volunteerId }).first();
      const userRecord = await db.orm.public.User.where({ id: app.volunteerId }).first();

      return {
        ...app,
        volunteerProfile: volunteer,
        volunteerEmail: userRecord?.email || '',
      };
    })
  );

  return applicants;
}

export async function getApplicationDetails(applicationId: string) {
  const user = await requireUser();
  const { allowed, isOwner } = await canViewApplication(applicationId, user.id);
  if (!allowed) {
    throw new Error('Action non autorisée');
  }

  const application = await db.orm.public.Application.where({ id: applicationId }).first();
  if (!application) return null;

  const [event, volunteerProfile, userRecord, answers] = await Promise.all([
    db.orm.public.Event.where({ id: application.eventId }).first(),
    db.orm.public.VolunteerProfile.where({ userId: application.volunteerId }).first(),
    db.orm.public.User.where({ id: application.volunteerId }).first(),
    db.orm.public.ApplicationAnswer.where({ applicationId }).all(),
  ]);

  const answersWithFields = await Promise.all(
    answers.map(async (ans) => {
      const field = await db.orm.public.FormField.where({ id: ans.fieldId }).first();
      let downloadUrl = ans.fileUrl;
      // Si c'est un fichier stocké dans Supabase, générer une URL signée
      if (field?.type === 'FILE' && ans.fileUrl && !ans.fileUrl.startsWith('http')) {
        const signed = await getCvSignedUrl(ans.fileUrl);
        if (signed.url) downloadUrl = signed.url;
      }

      return {
        ...ans,
        field,
        downloadUrl,
      };
    })
  );

  let organizerProfile = null;
  if (event) {
    organizerProfile = await db.orm.public.OrganizerProfile.where({ userId: event.organizerId }).first();
  }

  return {
    ...application,
    event,
    volunteerProfile,
    volunteerEmail: userRecord?.email || '',
    organizerProfile,
    answers: answersWithFields,
    isOwner,
  };
}

export async function updateApplicationStatusAction(params: {
  applicationId: string;
  status: 'ACCEPTED' | 'REJECTED';
  sendEmail?: boolean;
  emailSubject?: string;
  emailMessage?: string;
}) {
  const user = await requireUser();
  const details = await getApplicationDetails(params.applicationId);
  if (!details || !details.isOwner) {
    return { success: false, error: 'Action non autorisée' };
  }

  const now = new Date().toISOString();
  let emailSentDate: string | null = details.decisionEmailSentAt;

  // Envoi d'email si demandé
  if (params.sendEmail && details.volunteerEmail) {
    const emailResult = await sendDecisionEmail({
      toEmail: details.volunteerEmail,
      volunteerName: details.volunteerProfile?.fullName || 'Bénévole',
      eventTitle: details.event?.title || 'Événement',
      organizerName: details.organizerProfile?.name || 'L’organisateur',
      organizerContactEmail: details.organizerProfile?.contactEmail || user.email || 'contact@volonty.org',
      status: params.status,
      customSubject: params.emailSubject,
      customMessage: params.emailMessage,
    });

    if (emailResult.success) {
      emailSentDate = now;
    }
  }

  await db.orm.public.Application.where({ id: params.applicationId }).update({
    status: params.status,
    decidedAt: now,
    decisionEmailSentAt: emailSentDate,
  });

  revalidatePath(`/organisateur/events/${details.eventId}/candidatures`);
  revalidatePath('/mes-candidatures');

  return { success: true };
}
