import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface DecisionEmailParams {
  toEmail: string;
  volunteerName: string;
  eventTitle: string;
  organizerName: string;
  organizerContactEmail: string;
  status: 'ACCEPTED' | 'REJECTED';
  customSubject?: string;
  customMessage?: string;
}

export function getDefaultEmailTemplates(params: {
  volunteerName: string;
  eventTitle: string;
  organizerName: string;
}) {
  const { volunteerName, eventTitle, organizerName } = params;

  return {
    accepted: {
      subject: `Félicitations ! Votre candidature pour "${eventTitle}" a été acceptée`,
      message: `Bonjour ${volunteerName},

Nous avons le grand plaisir de vous annoncer que votre candidature pour participer en tant que bénévole à l'événement "${eventTitle}" a été retenue par l'équipe de ${organizerName} !

Nous vous remercions pour votre engagement et votre enthousiasme. L'organisateur prendra contact avec vous très prochainement avec tous les détails pratiques pour préparer votre mission.

À très bientôt,
L'équipe ${organizerName} via Volonty`,
    },
    rejected: {
      subject: `Mise à jour concernant votre candidature pour "${eventTitle}"`,
      message: `Bonjour ${volunteerName},

Nous vous remercions sincèrement pour votre intérêt et votre candidature pour l'événement "${eventTitle}".

Le nombre de candidatures reçues a été très élevé et le nombre de places limité. Après une analyse attentive, nous avons le regret de vous informer que nous n'avons pas pu retenir votre profil pour cette mission précise.

Nous tenons à saluer votre volonté d'engagement et nous vous encourageons vivement à postuler à d'autres événements sur la plateforme Volonty.

Bien cordialement,
L'équipe ${organizerName} via Volonty`,
    },
  };
}

export async function sendDecisionEmail(params: DecisionEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const defaultTemplates = getDefaultEmailTemplates({
    volunteerName: params.volunteerName,
    eventTitle: params.eventTitle,
    organizerName: params.organizerName,
  });

  const selectedTemplate = params.status === 'ACCEPTED'
    ? defaultTemplates.accepted
    : defaultTemplates.rejected;

  const subject = params.customSubject || selectedTemplate.subject;
  const message = params.customMessage || selectedTemplate.message;

  if (!resend) {
    console.warn(
      `[Volonty Email Warning] RESEND_API_KEY non configurée. Simulation de l'envoi d'email à ${params.toEmail}:`,
      { subject, to: params.toEmail, replyTo: params.organizerContactEmail }
    );
    // Simuler le succès en environnement sans clé Resend active pour permettre le test MVP complet
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  try {
    const result = await resend.emails.send({
      from: 'Volonty <notifications@volonty.org>',
      to: [params.toEmail],
      replyTo: params.organizerContactEmail,
      subject,
      text: message,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[Volonty Email Error]', err);
    return { success: false, error: err.message || "Erreur lors de l'envoi de l'email" };
  }
}
