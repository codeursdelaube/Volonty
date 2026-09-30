'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEventAction, setEventStatusAction, deleteEventAction } from '@/src/actions/events';
import { saveEventFormAction } from '@/src/actions/forms';
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client';
const EVENT_COVERS_BUCKET = 'event-covers';
import { 
  FileText, 
  Settings, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Check, 
  AlertCircle, 
  Send,
  Eye,
  Inbox,
  UploadCloud
} from 'lucide-react';
import Link from 'next/link';

interface EventEditTabsProps {
  event: any;
  form: any;
}

export function EventEditTabs({ event, form }: EventEditTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'builder'>('info');

  // Event info state
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [coverImageUrl, setCoverImageUrl] = useState(event.coverImageUrl || '');
  const [startsAt, setStartsAt] = useState(new Date(event.startsAt).toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(new Date(event.endsAt).toISOString().slice(0, 16));
  const [location, setLocation] = useState(event.location);
  const [city, setCity] = useState(event.city);
  const [slots, setSlots] = useState(event.slots);
  const [skills, setSkills] = useState<string[]>(event.skillsWanted || []);
  const [skillInput, setSkillInput] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'CLOSED'>(event.status);

  // Form builder state
  const [formTitle, setFormTitle] = useState(form?.title || 'Formulaire de candidature');
  const [formDescription, setFormDescription] = useState(form?.description || 'Merci de renseigner ce formulaire pour rejoindre notre équipe de bénévoles.');
  const [fields, setFields] = useState<Array<{
    id?: string;
    label: string;
    type: 'SHORT_TEXT' | 'LONG_TEXT' | 'SINGLE_CHOICE' | 'FILE';
    required: boolean;
    order: number;
    options: string[];
    optionsString?: string;
  }>>(
    form?.fields?.length > 0
      ? form.fields.map((f: any) => ({
          ...f,
          optionsString: (f.options || []).join(', '),
        }))
      : [
          {
            label: 'Quelles sont vos motivations pour rejoindre cet événement ?',
            type: 'LONG_TEXT',
            required: true,
            order: 0,
            options: [],
          },
          {
            label: 'Votre CV ou document de présentation (PDF)',
            type: 'FILE',
            required: false,
            order: 1,
            options: [],
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleCoverUpload(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setMessage({ type: 'error', text: 'Format non supporté. Utilisez JPG, PNG ou WebP.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: "L'image ne doit pas dépasser 5 Mo." });
      return;
    }
    try {
      setUploadingCover(true);
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `covers/${event.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(EVENT_COVERS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) {
        setMessage({ type: 'error', text: 'Échec de l\'upload : ' + upErr.message });
        return;
      }
      const { data: pubData } = supabase.storage.from(EVENT_COVERS_BUCKET).getPublicUrl(path);
      setCoverImageUrl(pubData.publicUrl);
      setMessage({ type: 'success', text: 'Image téléversée avec succès.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'upload : ' + (err?.message || 'Erreur réseau') });
    } finally {
      setUploadingCover(false);
    }
  }

  function addField() {
    setFields([
      ...fields,
      {
        label: 'Nouvelle question',
        type: 'SHORT_TEXT',
        required: false,
        order: fields.length,
        options: [],
        optionsString: '',
      },
    ]);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, idx) => idx !== index));
  }

  function moveField(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIdx];
    newFields[targetIdx] = temp;
    setFields(newFields);
  }

  async function handleEventSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await updateEventAction(event.id, {
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
      useExternalUrl: Boolean(event.externalApplicationUrl),
      externalApplicationUrl: event.externalApplicationUrl,
    });

    setSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Événement mis à jour avec succès !' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error || 'Erreur lors de la mise à jour.' });
    }
  }

  async function handleFormSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formattedFields = fields.map((f, idx) => ({
      label: f.label,
      type: f.type,
      required: f.required,
      order: idx,
      options: f.type === 'SINGLE_CHOICE' && f.optionsString
        ? f.optionsString.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }));

    const res = await saveEventFormAction({
      eventId: event.id,
      title: formTitle,
      description: formDescription,
      fields: formattedFields,
    });

    setSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Formulaire de candidature enregistré avec succès !' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error || 'Erreur lors de l’enregistrement du formulaire.' });
    }
  }

  async function handleStatusChange(newStatus: 'DRAFT' | 'PUBLISHED' | 'CLOSED') {
    setSaving(true);
    setMessage(null);

    const res = await setEventStatusAction(event.id, newStatus);
    setSaving(false);

    if (res.success) {
      setStatus(newStatus);
      setMessage({ type: 'success', text: `Statut modifié avec succès en : ${newStatus}` });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error || 'Impossible de changer le statut.' });
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-stone-600">Statut actuel :</span>
          {status === 'PUBLISHED' && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              ● Publié en ligne
            </span>
          )}
          {status === 'DRAFT' && (
            <span className="px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-xs font-bold">
              ● Brouillon
            </span>
          )}
          {status === 'CLOSED' && (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
              ● Clôturé
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {status !== 'PUBLISHED' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleStatusChange('PUBLISHED')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              Publier l&apos;événement
            </button>
          )}

          {status === 'PUBLISHED' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleStatusChange('CLOSED')}
              className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-semibold hover:bg-stone-900 transition-colors shadow-sm disabled:opacity-50"
            >
              Clôturer les candidatures
            </button>
          )}

          {status !== 'DRAFT' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleStatusChange('DRAFT')}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Repasser en brouillon
            </button>
          )}

          <Link
            href={`/organisateur/events/${event.id}/candidatures`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Voir les candidatures</span>
          </Link>

          <Link
            href={`/events/${event.id}`}
            target="_blank"
            className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            title="Aperçu public"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Tabs */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        
        <div className="flex border-b border-stone-200 bg-stone-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>1. Détails & Paramètres de l&apos;événement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'builder'
                ? 'border-amber-500 text-amber-700 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Form Builder (Questions de candidature)</span>
          </button>
        </div>

        <div className="p-6 sm:p-10">
          
          {/* TAB 1: EVENT INFO */}
          {activeTab === 'info' && (
            <form onSubmit={handleEventSave} className="space-y-6">
              
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Titre de l&apos;événement
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Description détaillée
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                />
              </div>

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
                    className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Nombre de places
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

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700">
                  Image de couverture
                </label>

                {/* Upload fichier */}
                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center hover:border-amber-400 transition-colors bg-stone-50/50">
                  <UploadCloud className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-[11px] text-stone-600 font-medium">Téléverser (JPG, PNG, WebP — max 5 Mo)</p>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingCover}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCoverUpload(f);
                    }}
                    className="mt-2 block w-full text-[11px] text-stone-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-amber-100 file:text-amber-800 cursor-pointer"
                  />
                  {uploadingCover && <p className="text-[11px] text-amber-600 mt-1 animate-pulse">Téléversement en cours...</p>}
                </div>

                {/* URL manuelle */}
                <div>
                  <p className="text-[11px] text-stone-500 mb-1">Ou renseignez une URL directe :</p>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                  />
                </div>

                {/* Preview */}
                {coverImageUrl && !uploadingCover && (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-stone-200">
                    <img
                      src={coverImageUrl}
                      alt="Aperçu de la couverture"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible.')) {
                      await deleteEventAction(event.id);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                >
                  Supprimer l&apos;événement
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: FORM BUILDER */}
          {activeTab === 'builder' && (
            <form onSubmit={handleFormSave} className="space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Titre du formulaire
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Instructions / Message d&apos;accueil
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold font-serif text-stone-900">
                    Questions du formulaire ({fields.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addField}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold hover:bg-amber-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une question
                  </button>
                </div>

                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50 transition-colors space-y-4 relative"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        Question {idx + 1}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveField(idx, 'up')}
                          className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                          title="Monter"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={() => moveField(idx, 'down')}
                          className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30"
                          title="Descendre"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(idx)}
                          className="p-1 text-red-500 hover:text-red-700 ml-2"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          required
                          value={field.label}
                          onChange={(e) => {
                            const newFields = [...fields];
                            newFields[idx].label = e.target.value;
                            setFields(newFields);
                          }}
                          placeholder="Intitulé de la question..."
                          className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newFields = [...fields];
                            newFields[idx].type = e.target.value as any;
                            setFields(newFields);
                          }}
                          className="w-full px-3 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 font-medium"
                        >
                          <option value="SHORT_TEXT">Texte court</option>
                          <option value="LONG_TEXT">Texte long</option>
                          <option value="SINGLE_CHOICE">Choix unique (QCM)</option>
                          <option value="FILE">Fichier (CV PDF)</option>
                        </select>
                      </div>
                    </div>

                    {/* Single choice options */}
                    {field.type === 'SINGLE_CHOICE' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Options de réponse (séparées par une virgule)
                        </label>
                        <input
                          type="text"
                          value={field.optionsString || ''}
                          onChange={(e) => {
                            const newFields = [...fields];
                            newFields[idx].optionsString = e.target.value;
                            setFields(newFields);
                          }}
                          placeholder="Ex. Matin, Après-midi, Journée complète"
                          className="w-full px-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const newFields = [...fields];
                            newFields[idx].required = e.target.checked;
                            setFields(newFields);
                          }}
                          className="checkbox checkbox-xs text-amber-500 rounded"
                        />
                        <span>Réponse obligatoire pour le candidat</span>
                      </label>
                    </div>

                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving || fields.length === 0}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enregistrer le formulaire</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
