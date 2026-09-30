import { z } from 'zod';

// ================= AUTH =================
export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
});

export const registerSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
  fullName: z.string().min(2, 'Le nom complet est requis'),
});

// ================= PROFILES =================
export const volunteerProfileSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  age: z.coerce.number().int().min(14, 'Âge minimum 14 ans').max(100).nullable().optional(),
  city: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  availability: z.string().max(500).optional().nullable(),
  skills: z.array(z.string()).default([]),
});

export const organizerProfileSchema = z.object({
  name: z.string().min(2, "Le nom de l'organisation ou de l'organisateur est requis"),
  description: z.string().max(2000).optional().nullable(),
  contactEmail: z.string().email('Email de contact invalide'),
});

// ================= EVENTS =================
export const eventSchema = z.object({
  title: z.string().min(3, "Le titre de l'événement est requis"),
  description: z.string().min(10, 'La description doit être détaillée (au moins 10 caractères)'),
  coverImageUrl: z.string().url('URL invalide').optional().nullable(),
  startsAt: z.string().min(1, 'Date de début requise'),
  endsAt: z.string().min(1, 'Date de fin requise'),
  location: z.string().min(2, 'Le lieu est requis'),
  city: z.string().min(2, 'La ville est requise'),
  slots: z.coerce.number().int().min(1, 'Il faut au moins 1 place disponible'),
  skillsWanted: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).default('DRAFT'),
  useExternalUrl: z.boolean().default(false),
  externalApplicationUrl: z.string().url('URL de candidature invalide').optional().nullable(),
}).refine((data) => {
  if (data.useExternalUrl && !data.externalApplicationUrl) {
    return false;
  }
  return true;
}, {
  message: "Si vous n'utilisez pas le formulaire interne, le lien externe de candidature est obligatoire",
  path: ['externalApplicationUrl'],
});

// ================= FORM BUILDER =================
export const formFieldTypeEnum = z.enum(['SHORT_TEXT', 'LONG_TEXT', 'SINGLE_CHOICE', 'FILE']);

export const formFieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Le libellé de la question est requis'),
  type: formFieldTypeEnum,
  required: z.boolean().default(false),
  order: z.number().int().default(0),
  options: z.array(z.string()).default([]),
});

export const formSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(2, 'Le titre du formulaire est requis'),
  description: z.string().optional().nullable(),
  fields: z.array(formFieldSchema).min(1, 'Ajoutez au moins une question'),
});

// ================= APPLICATION =================
export const applicationAnswerSchema = z.object({
  fieldId: z.string().min(1),
  textValue: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
});

export const applicationSubmitSchema = z.object({
  eventId: z.string().min(1),
  answers: z.array(applicationAnswerSchema),
});

// ================= DECISION EMAIL =================
export const decisionEmailSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(['ACCEPTED', 'REJECTED']),
  subject: z.string().min(3, 'Le sujet est requis'),
  message: z.string().min(10, 'Le message est requis'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VolunteerProfileInput = z.infer<typeof volunteerProfileSchema>;
export type OrganizerProfileInput = z.infer<typeof organizerProfileSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type FormInput = z.infer<typeof formSchema>;
export type FormFieldInput = z.infer<typeof formFieldSchema>;
export type ApplicationSubmitInput = z.infer<typeof applicationSubmitSchema>;
export type DecisionEmailInput = z.infer<typeof decisionEmailSchema>;
