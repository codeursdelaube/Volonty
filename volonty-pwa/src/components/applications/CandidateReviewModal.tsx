'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateApplicationStatusAction } from '@/src/actions/applications';
import { getDefaultEmailTemplates } from '@/src/lib/email';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  FileDown, 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  Send,
  AlertCircle
} from 'lucide-react';

interface CandidateReviewModalProps {
  application: any;
  eventTitle: string;
  organizerName: string;
  onClose: () => void;
}

export function CandidateReviewModal({
  application,
  eventTitle,
  organizerName,
  onClose,
}: CandidateReviewModalProps) {
  const router = useRouter();

  const [decisionMode, setDecisionMode] = useState<'view' | 'email'>('view');
  const [selectedStatus, setSelectedStatus] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');

  const defaultTemplates = getDefaultEmailTemplates({
    volunteerName: application.volunteerProfile?.fullName || 'Bénévole',
    eventTitle,
    organizerName,
  });

  const [emailSubject, setEmailSubject] = useState(defaultTemplates.accepted.subject);
  const [emailMessage, setEmailMessage] = useState(defaultTemplates.accepted.message);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startDecision(status: 'ACCEPTED' | 'REJECTED') {
    setSelectedStatus(status);
    const template = status === 'ACCEPTED' ? defaultTemplates.accepted : defaultTemplates.rejected;
    setEmailSubject(template.subject);
    setEmailMessage(template.message);
    setDecisionMode('email');
  }

  async function handleConfirmDecision() {
    setSubmitting(true);
    setError(null);

    const res = await updateApplicationStatusAction({
      applicationId: application.id,
      status: selectedStatus,
      sendEmail: sendEmailNotification,
      emailSubject,
      emailMessage,
    });

    setSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Erreur lors de la mise à jour.');
    } else {
      router.refresh();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-scaleIn">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold font-serif text-sm">
              {application.volunteerProfile?.fullName?.charAt(0) || 'B'}
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900">
                {application.volunteerProfile?.fullName || 'Candidat'}
              </h3>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {application.volunteerEmail}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {decisionMode === 'view' ? (
            <>
              {/* Volunteer Profile Snapshot */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] text-stone-400 font-semibold uppercase">Âge</span>
                  <span className="font-medium text-stone-800">{application.volunteerProfile?.age ? `${application.volunteerProfile.age} ans` : 'Non renseigné'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-400 font-semibold uppercase">Ville</span>
                  <span className="font-medium text-stone-800">{application.volunteerProfile?.city || 'Non renseigné'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-400 font-semibold uppercase">Disponibilité</span>
                  <span className="font-medium text-stone-800 truncate block">{application.volunteerProfile?.availability || 'Non renseigné'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-400 font-semibold uppercase">Statut actuel</span>
                  <span className="font-bold text-amber-700">{application.status}</span>
                </div>
              </div>

              {/* Volunteer Skills */}
              {application.volunteerProfile?.skills?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Compétences du profil
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {application.volunteerProfile.skills.map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Answers to Form Questions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Réponses au formulaire de candidature
                </h4>

                {application.answers?.length > 0 ? (
                  <div className="space-y-4">
                    {application.answers.map((ans: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1.5">
                        <p className="text-xs font-bold text-stone-800">
                          {ans.field?.label || `Question ${idx + 1}`}
                        </p>

                        {ans.field?.type === 'FILE' || ans.fileUrl ? (
                          <div className="pt-1">
                            {ans.downloadUrl ? (
                              <a
                                href={ans.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-semibold hover:bg-amber-200 transition-colors"
                              >
                                <FileDown className="w-3.5 h-3.5 text-amber-700" />
                                Télécharger le CV (PDF)
                              </a>
                            ) : (
                              <span className="text-xs text-stone-400 italic">Aucun fichier fourni</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-600 whitespace-pre-wrap leading-relaxed">
                            {ans.textValue || <span className="italic text-stone-400">Pas de réponse</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">Aucune question spécifique dans ce formulaire.</p>
                )}
              </div>

              {/* Notification note */}
              {application.decisionEmailSentAt && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>Email de notification déjà envoyé le {new Date(application.decisionEmailSentAt).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </>
          ) : (
            /* EMAIL CUSTOMIZATION STEP */
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600">Décision choisie :</span>
                  {selectedStatus === 'ACCEPTED' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Acceptation
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-xs font-bold">
                      Refus
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setDecisionMode('view')}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  ← Revenir aux réponses
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                Vous pouvez personnaliser le texte de l&apos;email ci-dessous avant son envoi au candidat.
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Sujet du mail
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Corps du message
                </label>
                <textarea
                  rows={8}
                  required
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900 leading-relaxed font-sans"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={sendEmailNotification}
                  onChange={(e) => setSendEmailNotification(e.target.checked)}
                  className="checkbox checkbox-xs text-amber-500 rounded"
                />
                <span>Envoyer cet email de notification au candidat ({application.volunteerEmail})</span>
              </label>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Fermer
          </button>

          {decisionMode === 'view' ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => startDecision('REJECTED')}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-stone-500" />
                <span>Refuser</span>
              </button>

              <button
                type="button"
                onClick={() => startDecision('ACCEPTED')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accepter la candidature</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmDecision}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Validation...' : 'Confirmer et enregistrer'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
