'use client';

import { useState } from 'react';
import { CandidateReviewModal } from './CandidateReviewModal';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Mail, 
  MapPin, 
  User, 
  Search,
  Filter
} from 'lucide-react';

interface CandidatesTableProps {
  applications: any[];
  eventTitle: string;
  organizerName: string;
}

export function CandidatesTable({
  applications,
  eventTitle,
  organizerName,
}: CandidatesTableProps) {
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = applications.filter((app) => {
    if (filterStatus !== 'ALL' && app.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = app.volunteerProfile?.fullName?.toLowerCase() || '';
      const email = app.volunteerEmail?.toLowerCase() || '';
      return name.includes(q) || email.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 text-stone-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <div className="flex items-center gap-1.5 overflow-x-auto w-full">
            {['ALL', 'SUBMITTED', 'ACCEPTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st === 'ALL' && 'Toutes'}
                {st === 'SUBMITTED' && 'En attente'}
                {st === 'ACCEPTED' && 'Acceptées'}
                {st === 'REJECTED' && 'Refusées'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="py-4 px-6">Candidat</th>
                  <th className="py-4 px-6">Ville & Âge</th>
                  <th className="py-4 px-6">Date d&apos;envoi</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-stone-900 text-sm">
                        {app.volunteerProfile?.fullName || 'Bénévole'}
                      </div>
                      <div className="text-stone-500 text-[11px] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        {app.volunteerEmail}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-stone-600">
                      <div>{app.volunteerProfile?.city || 'Non précisé'}</div>
                      <div className="text-[11px] text-stone-400">
                        {app.volunteerProfile?.age ? `${app.volunteerProfile.age} ans` : '-'}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-stone-600">
                      {new Date(app.submittedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6">
                      {app.status === 'SUBMITTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Acceptée
                        </span>
                      )}
                      {app.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold">
                          <XCircle className="w-3 h-3 text-stone-500" />
                          Refusée
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          // Charger le détail de la candidature via fetch ou Server Action
                          const { getApplicationDetails } = await import('@/src/actions/applications');
                          const details = await getApplicationDetails(app.id);
                          setSelectedApp(details);
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Examiner</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300">
          <p className="text-sm font-semibold text-stone-700">Aucune candidature trouvée</p>
          <p className="text-xs text-stone-400 mt-1">Les réponses des bénévoles apparaîtront automatiquement ici.</p>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <CandidateReviewModal
          application={selectedApp}
          eventTitle={eventTitle}
          organizerName={organizerName}
          onClose={() => setSelectedApp(null)}
        />
      )}

    </div>
  );
}
