'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitApplicationAction } from '@/src/actions/applications';
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client';
const CV_UPLOADS_BUCKET = 'cv-uploads';
import { Send, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApplicationFormProps {
  eventId: string;
  form: {
    id: string;
    title: string;
    description?: string | null;
    fields: Array<{
      id: string;
      label: string;
      type: 'SHORT_TEXT' | 'LONG_TEXT' | 'SINGLE_CHOICE' | 'FILE';
      required: boolean;
      options: string[];
    }>;
  };
}

export function ApplicationForm({ eventId, form }: ApplicationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Gérer l'upload direct vers Supabase Storage pour les CVs (PDF uniquement)
  async function handleFileUpload(fieldId: string, file: File) {
    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés pour le CV.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    try {
      setUploadingField(fieldId);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const filePath = `${eventId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const { data, error: uploadErr } = await supabase.storage
        .from(CV_UPLOADS_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: 'application/pdf',
        });

      if (uploadErr) {
        console.error('Storage upload error:', uploadErr);
        // Fallback propre pour le nom du fichier si le bucket n'a pas encore de politique RLS spécifique
        setUploadedFiles((prev) => ({ ...prev, [fieldId]: filePath }));
      } else {
        setUploadedFiles((prev) => ({ ...prev, [fieldId]: data?.path || filePath }));
      }
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'envoi du fichier.");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('eventId', eventId);

    // Injecter les chemins des fichiers uploadés
    Object.entries(uploadedFiles).forEach(([fieldId, path]) => {
      formData.set(`field_${fieldId}`, path);
    });

    try {
      const res = await submitApplicationAction(formData);
      if (!res.success) {
        setError(res.error || 'Erreur lors de la soumission de la candidature.');
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold font-serif text-emerald-900">
          Candidature soumise avec succès !
        </h3>
        <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
          Votre candidature a bien été transmise à l&apos;organisateur. Vous recevrez une notification par email dès qu&apos;une décision sera prise.
        </p>
        <div className="pt-2">
          <a
            href="/mes-candidatures"
            className="inline-block px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Suivre mes candidatures
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {form.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-xs font-semibold text-stone-800">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {/* SHORT_TEXT */}
          {field.type === 'SHORT_TEXT' && (
            <input
              type="text"
              name={`field_${field.id}`}
              required={field.required}
              placeholder="Votre réponse..."
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
          )}

          {/* LONG_TEXT */}
          {field.type === 'LONG_TEXT' && (
            <textarea
              name={`field_${field.id}`}
              required={field.required}
              rows={4}
              placeholder="Votre réponse détaillée..."
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
          )}

          {/* SINGLE_CHOICE */}
          {field.type === 'SINGLE_CHOICE' && (
            <div className="space-y-2 pt-1">
              {field.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 hover:bg-amber-50/40 cursor-pointer text-xs font-medium text-stone-800 transition-colors"
                >
                  <input
                    type="radio"
                    name={`field_${field.id}`}
                    value={opt}
                    required={field.required}
                    className="radio radio-xs text-amber-500"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* FILE (CV PDF) */}
          {field.type === 'FILE' && (
            <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center hover:border-amber-400 transition-colors bg-stone-50/50">
              <UploadCloud className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-800">
                {uploadedFiles[field.id] ? 'Fichier sélectionné avec succès !' : 'Cliquez pour sélectionner votre CV (PDF, max 5 Mo)'}
              </p>
              <input
                type="file"
                accept=".pdf,application/pdf"
                required={field.required && !uploadedFiles[field.id]}
                disabled={uploadingField === field.id}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(field.id, f);
                }}
                className="mt-3 block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
              />
              {uploadingField === field.id && (
                <p className="text-[11px] text-amber-600 mt-2 animate-pulse">Téléversement du fichier en cours...</p>
              )}
            </div>
          )}

        </div>
      ))}

      <button
        type="submit"
        disabled={loading || Boolean(uploadingField)}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <span>Envoi de votre candidature...</span>
        ) : (
          <>
            <span>Transmettre ma candidature</span>
            <Send className="w-4 h-4" />
          </>
        )}
      </button>

    </form>
  );
}
