import React, { useState } from 'react';
import { X, User, ShieldCheck, Sparkles, Check, LogIn } from 'lucide-react';
import type { UserProfile } from '../shared/types.ts';

interface AuthModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSwitchUser: (userId: string) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSwitchUser,
}) => {
  const [switching, setSwitching] = useState<string | null>(null);

  if (!isOpen) return null;

  const profiles = [
    {
      id: 'user-kreator',
      name: 'Kreator Studio',
      email: 'kreator@vidgen.ai',
      role: 'kreator',
      tier: 'Creator Pro',
      credits: 120,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      description: 'Akses penuh ke studio pembuatan video, pratinjau, dan kuota standar.',
    },
    {
      id: 'user-admin',
      name: 'Administrator VIDGEN',
      email: 'admin@vidgen.ai',
      role: 'admin',
      tier: 'Studio Enterprise',
      credits: 500,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      description: 'Hak akses administratif, manajemen kuota tak terbatas, dan uji API server.',
    },
  ];

  const handleSelect = async (id: string) => {
    setSwitching(id);
    try {
      await onSwitchUser(id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e091d] border border-purple-800/50 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Profil Pengguna & Sesi</h3>
              <p className="text-[11px] text-gray-400">Pilih akun kerja studio Anda</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profiles */}
        <div className="space-y-3">
          {profiles.map((p) => {
            const isCurrent = currentUser.id === p.id;

            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                  isCurrent
                    ? 'bg-purple-950/70 border-purple-500 shadow-md shadow-purple-900/30 ring-1 ring-purple-500'
                    : 'bg-neutral-900/70 border-purple-900/30 hover:border-purple-700/60 hover:bg-neutral-900'
                }`}
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-purple-500/50 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-white text-sm truncate">{p.name}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-700/40 flex items-center gap-1">
                        <Check className="w-3 h-3 text-purple-400" />
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-purple-400 font-medium capitalize">{p.role} • {p.tier}</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed line-clamp-2">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer status */}
        <div className="pt-2 text-center text-[11px] text-gray-500">
          Sesi otentikasi disimpan secara lokal dan tersinkronisasi otomatis dengan database VIDGEN.
        </div>

      </div>
    </div>
  );
};
