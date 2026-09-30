import { db } from '@/src/prisma/db';

export async function isEventOwner(eventId: string, userId: string): Promise<boolean> {
  const event = await db.orm.public.Event
    .select('id', 'organizerId')
    .where({ id: eventId })
    .first();

  return Boolean(event && event.organizerId === userId);
}

export async function canViewApplication(applicationId: string, userId: string): Promise<{
  allowed: boolean;
  isOwner: boolean;
  isApplicant: boolean;
}> {
  const application = await db.orm.public.Application
    .select('id', 'volunteerId', 'eventId')
    .where({ id: applicationId })
    .first();

  if (!application) {
    return { allowed: false, isOwner: false, isApplicant: false };
  }

  if (application.volunteerId === userId) {
    return { allowed: true, isOwner: false, isApplicant: true };
  }

  const isOwner = await isEventOwner(application.eventId, userId);
  return { allowed: isOwner, isOwner, isApplicant: false };
}
