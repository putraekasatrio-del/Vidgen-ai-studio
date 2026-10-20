import React from 'react';
import { Sparkles, Film, Coins, Key } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingJobsCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  pendingJobsCount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090514]/95 backdrop-blur-xl border-t border-purple-900/40 px-3 py-2 pb-safe">
      <div className="grid grid-cols-4 gap-1">
        
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            activeTab === 'studio'
              ? 'text-purple-300 bg-purple-950/70 border border-purple-700/50'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold">Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
            activeTab === 'history'
              ? 'text-purple-300 bg-purple-950/70 border border-purple-700/50'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Film className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold">Riwayat</span>
          {pendingJobsCount > 0 && (
            <span className="absolute top-1 right-4 w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('credits')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            activeTab === 'credits'
              ? 'text-purple-300 bg-purple-950/70 border border-purple-700/50'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Coins className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold">Kredit</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            activeTab === 'admin'
              ? 'text-purple-300 bg-purple-950/70 border border-purple-700/50'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Key className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold">API</span>
        </button>

      </div>
    </div>
  );
};
