import { requireUser } from '@/src/lib/auth';
import { getUserProfiles } from '@/src/actions/profile';
import { ProfileManager } from '@/src/components/profile/ProfileManager';
import { User } from 'lucide-react';

export default async function ProfilPage() {
  const user = await requireUser();
  const { volunteerProfile, organizerProfile } = await getUserProfiles();

  return (
    <div className="min-h-screen py-10 bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
            <User className="w-3.5 h-3.5 text-amber-600" />
            Mon Espace Compte
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">
            Gestion de vos profils
          </h1>
          <p className="text-stone-600 text-sm max-w-xl">
            Sur Volonty, vous disposez d&apos;un profil bénévole pour postuler, et d&apos;un profil organisateur pour publier des missions.
          </p>
        </div>

        <ProfileManager
          userEmail={user.email || ''}
          volunteerProfile={volunteerProfile}
          organizerProfile={organizerProfile}
        />

      </div>
    </div>
  );
}
