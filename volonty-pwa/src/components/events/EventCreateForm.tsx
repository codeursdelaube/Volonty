'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createEventAction } from '@/src/actions/events';
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client';
const EVENT_COVERS_BUCKET = 'event-covers';
const DRAFT_KEY = 'volonty_event_create_draft';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  UploadCloud, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  FileText,
  RotateCcw
} from 'lucide-react';

export function EventCreateForm() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Lomé');
  const [slots, setSlots] = useState(10);
  const [skills, setSkills] = useState<string[]>(['Accueil', 'Logistique']);
  const [skillInput, setSkillInput] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  
  // Exclusive choice
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [externalApplicationUrl, setExternalApplicationUrl] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Charger le brouillon local au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.description) setDescription(d.description);
        if (d.coverImageUrl) setCoverImageUrl(d.coverImageUrl);
        if (d.startsAt) setStartsAt(d.startsAt);
        if (d.endsAt) setEndsAt(d.endsAt);
        if (d.location) setLocation(d.location);
        if (d.city) setCity(d.city);
        if (typeof d.slots === 'number') setSlots(d.slots);
        if (Array.isArray(d.skills) && d.skills.length > 0) setSkills(d.skills);
        if (typeof d.useExternalUrl === 'boolean') setUseExternalUrl(d.useExternalUrl);
        if (d.externalApplicationUrl) setExternalApplicationUrl(d.externalApplicationUrl);
        if (d.status) setStatus(d.status);
        if (d.title || d.description) setHasDraft(true);
      }
    } catch {
      // Ignorer
    }
  }, []);

  // Sauvegarder automatiquement en continu
  useEffect(() => {
    try {
      if (title || description || location) {
        const dataToSave = {
          title,
          description,
          coverImageUrl,
          startsAt,
          endsAt,
          location,
          city,
          slots,
          skills,
          useExternalUrl,
          externalApplicationUrl,
          status,
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(dataToSave));
        setHasDraft(true);
      }
    } catch {
      // Ignorer
    }
  }, [title, description, coverImageUrl, startsAt, endsAt, location, city, slots, skills, useExternalUrl, externalApplicationUrl, status]);

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setTitle('');
      setDescription('');
      setCoverImageUrl('');
      setStartsAt('');
      setEndsAt('');
      setLocation('');
      setCity('Lomé');
      setSlots(10);
      setSkills(['Accueil', 'Logistique']);
      setUseExternalUrl(false);
      setExternalApplicationUrl('');
      setStatus('DRAFT');
      setHasDraft(false);
    } catch {
      // Ignorer
    }
  }

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  }

  function removeSkill(tag: string) {
    setSkills(skills.filter((s) => s !== tag));
  }

  async function handleImageUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `covers/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      const { data, error: upErr } = await supabase.storage
        .from(EVENT_COVERS_BUCKET)
        .upload(path, file, { upsert: true });

      if (upErr) {
        console.error('Cover upload error:', upErr);
        // Utiliser une URL d'objet locale temporaire si le bucket Supabase n'est pas encore configuré
        setCoverImageUrl(URL.createObjectURL(file));
      } else {
        const { data: pubData } = supabase.storage
          .from(EVENT_COVERS_BUCKET)
          .getPublicUrl(path);
        setCoverImageUrl(pubData.publicUrl);
      }
    } catch (err: any) {
      setError("Erreur lors de l'upload de l'image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await createEventAction({
      title,
      description,
      coverImageUrl: coverImageUrl || null,
      startsAt,
      endsAt,
      location,
      city,
      slots: Number(slots),
      skillsWanted: skills,
      status,
      useExternalUrl,
      externalApplicationUrl: useExternalUrl ? externalApplicationUrl : null,
    });

    setSaving(false);
    if (!res.success) {
      setError(res.error || 'Erreur lors de la création.');
    } else {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      // Rediriger vers la page d'édition pour configurer le formulaire interne ou gérer l'événement
      router.push(`/organisateur/events/${res.eventId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-8">
      
      {hasDraft && (
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Brouillon restauré & sauvegardé automatiquement en direct
          </span>
          <button
            type="button"
            onClick={clearDraft}
            className="text-[11px] font-semibold text-stone-500 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Réinitialiser
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-3">
          1. Informations générales
        </h3>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Titre de l&apos;événement
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. Festival Éco-Citoyen Lomé 2026"
            className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Description détaillée & Missions attendues
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'événement, les responsabilités des bénévoles, l'ambiance, les repas prévus..."
            className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Image de couverture (upload ou URL)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center hover:border-amber-400 transition-colors bg-stone-50/50">
              <UploadCloud className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <p className="text-[11px] text-stone-600 font-medium">Téléverser une image (JPG, PNG, max 5 Mo)</p>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                }}
                className="mt-2 block w-full text-[11px] text-stone-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-amber-100 file:text-amber-800 cursor-pointer"
              />
            </div>

            <div>
              <p className="text-[11px] text-stone-500 mb-1.5">Ou renseignez une URL directe :</p>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dates, Location & Slots */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-3">
          2. Logistique & Calendrier
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Date & Heure de début
            </label>
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Date & Heure de fin
            </label>
            <input
              type="datetime-local"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Ville
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex. Lomé"
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Lieu précis
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex. Palais des Congrès, Plage de Lomé..."
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Nombre de places bénévoles
            </label>
            <input
              type="number"
              min="1"
              required
              value={slots}
              onChange={(e) => setSlots(Number(e.target.value))}
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Compétences ou rôles recherchés (tags)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Ex. Accueil, Logistique, Réseaux Sociaux, Secourisme..."
              className="flex-1 px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Ajouter
            </button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-amber-500 hover:text-amber-800 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Choice: Internal Form vs External Link */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-3">
          3. Mode de candidature (Choix exclusif)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            onClick={() => setUseExternalUrl(false)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              !useExternalUrl
                ? 'border-amber-500 bg-amber-50/30 shadow-sm'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <input
              type="radio"
              name="applicationMode"
              checked={!useExternalUrl}
              onChange={() => setUseExternalUrl(false)}
              className="radio radio-xs text-amber-500 mt-0.5"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-stone-900">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Formulaire interne Volonty (Recommandé)</span>
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Vous personnaliserez les questions à l&apos;étape suivante. Vous recevrez et traiterez les candidatures directement dans l&apos;application.
              </p>
            </div>
          </label>

          <label
            onClick={() => setUseExternalUrl(true)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              useExternalUrl
                ? 'border-amber-500 bg-amber-50/30 shadow-sm'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <input
              type="radio"
              name="applicationMode"
              checked={useExternalUrl}
              onChange={() => setUseExternalUrl(true)}
              className="radio radio-xs text-amber-500 mt-0.5"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-stone-900">
                <ExternalLink className="w-4 h-4 text-amber-600" />
                <span>Lien externe de candidature</span>
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Les bénévoles seront redirigés vers votre propre lien de candidature externe.
              </p>
            </div>
          </label>
        </div>

        {useExternalUrl && (
          <div className="pt-2 animate-fadeIn">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              URL externe de candidature (obligatoire si choisi)
            </label>
            <input
              type="url"
              required={useExternalUrl}
              value={externalApplicationUrl}
              onChange={(e) => setExternalApplicationUrl(e.target.value)}
              placeholder="https://forms.gle/..."
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
            />
          </div>
        )}
      </div>

      {/* Initial Status */}
      <div className="pt-2 flex items-center gap-6">
        <span className="text-xs font-semibold text-stone-700">Statut initial :</span>
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
          <input
            type="radio"
            name="eventStatus"
            value="DRAFT"
            checked={status === 'DRAFT'}
            onChange={() => setStatus('DRAFT')}
            className="radio radio-xs text-amber-500"
          />
          <span>Brouillon (Configurer avant de publier)</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
          <input
            type="radio"
            name="eventStatus"
            value="PUBLISHED"
            checked={status === 'PUBLISHED'}
            onChange={() => setStatus('PUBLISHED')}
            className="radio radio-xs text-amber-500"
          />
          <span>Publier immédiatement</span>
        </label>
      </div>

      <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 transition-colors"
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={saving || uploadingImage}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <span>Création en cours...</span>
          ) : (
            <>
              <span>Continuer vers le formulaire</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </form>
  );
}
