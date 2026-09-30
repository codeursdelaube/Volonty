'use server';

import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { db } from '@/src/prisma/db';
import { loginSchema, registerSchema } from '@/src/lib/validations';
import { redirect } from 'next/navigation';

export interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function loginAction(formData: FormData): Promise<ActionResponse> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Veuillez vérifier les informations saisies.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : (error?.message || 'Erreur lors de la connexion'),
    };
  }

  // S'assurer que l'utilisateur existe dans la base Prisma
  try {
    const existing = await db.orm.public.User.where({ id: data.user.id }).first();
    if (!existing) {
      await db.orm.public.User.create({
        id: data.user.id,
        email: data.user.email || parsed.data.email,
      });
    }
  } catch (err) {
    console.error('Error syncing user on login:', err);
  }

  redirect('/events');
}

export async function registerAction(formData: FormData): Promise<ActionResponse> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Veuillez vérifier les informations saisies.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message || "Erreur lors de l'inscription",
    };
  }

  // Créer l'utilisateur dans la base Prisma + son profil bénévole initial
  try {
    const existing = await db.orm.public.User.where({ id: data.user.id }).first();
    if (!existing) {
      await db.orm.public.User.create({
        id: data.user.id,
        email: data.user.email || parsed.data.email,
      });

      // Profil bénévole par défaut
      await db.orm.public.VolunteerProfile.create({
        userId: data.user.id,
        fullName: parsed.data.fullName,
        skills: [],
      });
    }
  } catch (err) {
    console.error('Error syncing user on register:', err);
  }

  redirect('/events');
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/connexion');
}
