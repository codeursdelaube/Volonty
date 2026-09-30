'use client';

import { useState } from 'react';
import { saveVolunteerProfile, saveOrganizerProfile } from '@/src/actions/profile';
import { User, Building2, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ProfileManagerProps {
  userEmail: string;
  volunteerProfile: {
    fullName: string;
    age?: number | null;
    city?: string | null;
    bio?: string | null;
    availability?: string | null;
    skills: readonly string[] | string[];
  } | null;
  organizerProfile: {
    name: string;
    description?: string | null;
    contactEmail: string;
  } | null;
}

export function ProfileManager({ userEmail, volunteerProfile, organizerProfile }: ProfileManagerProps) {
  const [activeTab, setActiveTab] = useState<'volunteer' | 'organizer'>('volunteer');

  // Volunteer state
  const [volunteerName, setVolunteerName] = useState(volunteerProfile?.fullName || '');
  const [volunteerAge, setVolunteerAge] = useState(volunteerProfile?.age ? String(volunteerProfile.age) : '');
  const [volunteerCity, setVolunteerCity] = useState(volunteerProfile?.city || '');
  const [volunteerBio, setVolunteerBio] = useState(volunteerProfile?.bio || '');
  const [volunteerAvailability, setVolunteerAvailability] = useState(volunteerProfile?.availability || '');
  const [skills, setSkills] = useState<string[]>(volunteerProfile?.skills ? [...volunteerProfile.skills] : []);
  const [skillInput, setSkillInput] = useState('');

  // Organizer state
  const [organizerName, setOrganizerName] = useState(organizerProfile?.name || '');
  const [organizerDesc, setOrganizerDesc] = useState(organizerProfile?.description || '');
  const [organizerEmail, setOrganizerEmail] = useState(organizerProfile?.contactEmail || userEmail);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  }

  function removeSkill(tag: string) {
    setSkills(skills.filter((s) => s !== tag));
  }

  async function handleVolunteerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await saveVolunteerProfile({
      fullName: volunteerName,
      age: volunteerAge ? parseInt(volunteerAge, 10) : null,
      city: volunteerCity || null,
      bio: volunteerBio || null,
      availability: volunteerAvailability || null,
      skills,
    });

    setSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Profil bénévole mis à jour avec succès !' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Erreur lors de la mise à jour.' });
    }
  }

  async function handleOrganizerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await saveOrganizerProfile({
      name: organizerName,
      description: organizerDesc || null,
      contactEmail: organizerEmail,
    });

    setSaving(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Profil organisateur mis à jour avec succès !' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Erreur lors de la mise à jour.' });
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
      
      {/* Tab Switcher */}
      <div className="flex border-b border-stone-200 bg-stone-50/50">
        <button
          type="button"
          onClick={() => { setActiveTab('volunteer'); setMessage(null); }}
          className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'volunteer'
              ? 'border-amber-500 text-amber-700 bg-white'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil Bénévole</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('organizer'); setMessage(null); }}
          className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === 'organizer'
              ? 'border-amber-500 text-amber-700 bg-white'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil Organisateur</span>
        </button>
      </div>

      <div className="p-6 sm:p-10">
        
        {message && (
          <div
            className={`p-4 mb-6 rounded-2xl text-xs flex items-center gap-2 ${
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

        {/* Tab 1: Volunteer */}
        {activeTab === 'volunteer' && (
          <form onSubmit={handleVolunteerSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="Ex. Koffi Mensah"
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Âge (optionnel)
                </label>
                <input
                  type="number"
                  min="14"
                  max="100"
                  value={volunteerAge}
                  onChange={(e) => setVolunteerAge(e.target.value)}
                  placeholder="Ex. 22"
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Ville de résidence (Togo)
                </label>
                <input
                  type="text"
                  value={volunteerCity}
                  onChange={(e) => setVolunteerCity(e.target.value)}
                  placeholder="Ex. Lomé, Kpalimé..."
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Disponibilités (texte libre)
                </label>
                <input
                  type="text"
                  value={volunteerAvailability}
                  onChange={(e) => setVolunteerAvailability(e.target.value)}
                  placeholder="Ex. Week-ends, soirs en semaine, vacances scolaires..."
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                />
              </div>
            </div>

            {/* Skills Tags */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Compétences & Domaines d&apos;intérêt
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
                  placeholder="Tapez une compétence et appuyez sur Entrée (ex. Accueil, Secourisme, Photo)..."
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
                <div className="flex flex-wrap gap-2 pt-2">
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

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Bio / Présentation personnelle
              </label>
              <textarea
                rows={4}
                value={volunteerBio}
                onChange={(e) => setVolunteerBio(e.target.value)}
                placeholder="Parlez de vos motivations, de vos expériences associatives passées..."
                className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer mon profil bénévole'}
            </button>
          </form>
        )}

        {/* Tab 2: Organizer */}
        {activeTab === 'organizer' && (
          <form onSubmit={handleOrganizerSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nom de l&apos;organisation ou nom complet de l&apos;organisateur
                </label>
                <input
                  type="text"
                  required
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="Ex. Association Jeunesse & Avenir Togo"
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email de contact officiel
                </label>
                <input
                  type="email"
                  required
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  placeholder="contact@organisation.org"
                  className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Description de l&apos;organisation / Activités
              </label>
              <textarea
                rows={4}
                value={organizerDesc}
                onChange={(e) => setOrganizerDesc(e.target.value)}
                placeholder="Présentez la mission de votre association, vos domaines d'intervention, vos événements habituels..."
                className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer mon profil organisateur'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
