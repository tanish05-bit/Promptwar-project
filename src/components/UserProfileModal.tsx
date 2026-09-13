import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [institution, setInstitution] = useState('');
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data: UserProfile) => {
          setProfile(data);
          setName(data.name);
          setEmail(data.email);
          setRole(data.role);
          setInstitution(data.institution);
        })
        .catch((err) => console.warn('User profile fetch error:', err));

      fetch('/api/ai/quota-status')
        .then((res) => res.json())
        .then((data) => setQuotaStatus(data))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, institution }),
      });
      const updated = await res.json();
      setProfile(updated);
      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated(updated);
      setStatusMsg('Profile updated successfully!');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleSwitchKey = async () => {
    try {
      const res = await fetch('/api/ai/switch-key', { method: 'POST' });
      const data = await res.json();
      setQuotaStatus(data.status);
      setStatusMsg(data.message || 'Key slot toggled');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to switch key:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b1b1d] border border-[#ffb68c]/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in text-[#e4e2e4]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2c] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ffb68c]/40">
              <img
                src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt="Scholar Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-headline-md text-lg text-[#ffb68c] font-bold">
                {profile?.name || 'Scholar Profile'}
              </h3>
              <p className="text-xs text-[#a38c80]">{profile?.role || 'Senior Fellow'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#242426] hover:bg-[#353437] flex items-center justify-center text-[#a38c80] hover:text-[#e4e2e4]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Quota & AI Key Status Box */}
        <div className="mb-4 p-3.5 rounded-xl bg-[#131315] border border-[#2a2a2c]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb68c] text-[18px]">key</span>
              <span className="text-xs font-label-md font-semibold text-[#dbc1b4]">
                Gemini API Key Routing
              </span>
            </div>
            <button
              onClick={handleSwitchKey}
              className="px-2.5 py-1 rounded bg-[#242426] hover:bg-[#353437] text-[11px] font-label-md text-[#ffb68c] border border-[#ffb68c]/20 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[12px]">swap_horiz</span>
              <span>Switch Slot</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-label-sm text-[#a38c80]">
            <div>
              Active Slot:{' '}
              <span className="text-[#ffb68c] font-semibold">
                {quotaStatus?.activeKeyLabel || 'User Key (.env)'}
              </span>
            </div>
            <div>
              Auto-Failover:{' '}
              <span className="text-[#7ddba3] font-semibold">
                {quotaStatus?.isAutoFailoverReady ? 'Active (2 Keys)' : 'Single Key Pool'}
              </span>
            </div>
            <div>
              Failover Count: <span className="text-[#e4e2e4]">{quotaStatus?.quotaFailoverCount ?? 0}</span>
            </div>
            <div>
              Last Switched: <span className="text-[#e4e2e4]">{quotaStatus?.lastSwitchedAt || 'Init'}</span>
            </div>
          </div>
        </div>

        {/* Profile Details or Edit Form */}
        {isEditing ? (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-label-sm text-[#a38c80] mb-1">Scholar Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#131315] border border-[#2a2a2c] text-xs text-[#e4e2e4] px-3 py-2 rounded-lg focus:outline-none focus:border-[#ffb68c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-label-sm text-[#a38c80] mb-1">Academic Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131315] border border-[#2a2a2c] text-xs text-[#e4e2e4] px-3 py-2 rounded-lg focus:outline-none focus:border-[#ffb68c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-label-sm text-[#a38c80] mb-1">Academic Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#131315] border border-[#2a2a2c] text-xs text-[#e4e2e4] px-3 py-2 rounded-lg focus:outline-none focus:border-[#ffb68c]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-label-sm text-[#a38c80] mb-1">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-[#131315] border border-[#2a2a2c] text-xs text-[#e4e2e4] px-3 py-2 rounded-lg focus:outline-none focus:border-[#ffb68c]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-4 bg-[#131315] p-4 rounded-xl border border-[#2a2a2c]">
            <div className="flex justify-between text-xs">
              <span className="text-[#a38c80]">Institution:</span>
              <span className="text-[#e4e2e4] font-medium">{profile?.institution}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#a38c80]">Email:</span>
              <span className="text-[#e4e2e4] font-medium">{profile?.email}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#a38c80]">Epistemic Stability:</span>
              <span className="text-[#7ddba3] font-bold">{profile?.epistemicStability}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#a38c80]">Target Retention:</span>
              <span className="text-[#ffb68c] font-bold">{profile?.retentionRate}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#a38c80]">Codex Manuscripts:</span>
              <span className="text-[#e4e2e4] font-medium">{profile?.totalNotes} notes recorded</span>
            </div>
          </div>
        )}

        {statusMsg && (
          <div className="mb-3 p-2.5 rounded bg-[#143320] border border-[#7ddba3]/30 text-[#7ddba3] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2c]">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-[#a38c80] hover:text-[#e4e2e4]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#d97736] hover:bg-[#f9ba78] text-[#532200] font-label-md font-semibold text-xs rounded-lg shadow"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 bg-[#242426] hover:bg-[#353437] text-[#dbc1b4] text-xs font-label-md rounded-lg flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Edit Profile</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#2a2a2c] hover:bg-[#353437] text-[#e4e2e4] text-xs font-label-md rounded-lg"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
