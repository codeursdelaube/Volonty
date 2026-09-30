'use server';

import { requireUser } from '@/src/lib/auth';
import { db } from '@/src/prisma/db';
import { volunteerProfileSchema, organizerProfileSchema, type VolunteerProfileInput, type OrganizerProfileInput } from '@/src/lib/validations';
import { revalidatePath } from 'next/cache';

export async function getUserProfiles() {
  const user = await requireUser();

  const [volunteer, organizer] = await Promise.all([
    db.orm.public.VolunteerProfile.where({ userId: user.id }).first(),
    db.orm.public.OrganizerProfile.where({ userId: user.id }).first(),
  ]);

  return {
    user,
    volunteerProfile: volunteer,
    organizerProfile: organizer,
  };
}

export async function saveVolunteerProfile(data: VolunteerProfileInput) {
  const user = await requireUser();
  const parsed = volunteerProfileSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await db.orm.public.VolunteerProfile.where({ userId: user.id }).first();

  if (existing) {
    await db.orm.public.VolunteerProfile.where({ userId: user.id }).update({
      fullName: parsed.data.fullName,
      age: parsed.data.age ?? null,
      city: parsed.data.city ?? null,
      bio: parsed.data.bio ?? null,
      availability: parsed.data.availability ?? null,
      skills: parsed.data.skills,
    });
  } else {
    await db.orm.public.VolunteerProfile.create({
      userId: user.id,
      fullName: parsed.data.fullName,
      age: parsed.data.age ?? null,
      city: parsed.data.city ?? null,
      bio: parsed.data.bio ?? null,
      availability: parsed.data.availability ?? null,
      skills: parsed.data.skills,
    });
  }

  revalidatePath('/profil');
  return { success: true };
}

export async function saveOrganizerProfile(data: OrganizerProfileInput) {
  const user = await requireUser();
  const parsed = organizerProfileSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await db.orm.public.OrganizerProfile.where({ userId: user.id }).first();

  if (existing) {
    await db.orm.public.OrganizerProfile.where({ userId: user.id }).update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      contactEmail: parsed.data.contactEmail,
    });
  } else {
    await db.orm.public.OrganizerProfile.create({
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      contactEmail: parsed.data.contactEmail,
    });
  }

  revalidatePath('/profil');
  return { success: true };
}
