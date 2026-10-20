import React from 'react';
import { Sparkles, Film, Coins, Key, User, ShieldCheck, AlertCircle, Smartphone } from 'lucide-react';
import type { UserProfile, ProviderApiStatus } from '../shared/types.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  providers: ProviderApiStatus[];
  onOpenAuth: () => void;
  onOpenInstallModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  providers,
  onOpenAuth,
  onOpenInstallModal,
}) => {
  const configuredCount = providers.filter(p => p.isConfigured).length;
  const isFullyConfigured = configuredCount === providers.length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-900/30 bg-[#090514]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('studio')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/50 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-400 bg-clip-text text-transparent">
                VIDGEN
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-950 text-purple-300 border border-purple-600/40 uppercase tracking-wider">
                AI Studio
              </span>
            </div>
            <p className="text-[11px] text-purple-400/80 hidden sm:block">Multi-Model Video Generator</p>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-purple-950/40 p-1 rounded-xl border border-purple-900/40">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-700/40'
                : 'text-gray-300 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Studio Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-700/40'
                : 'text-gray-300 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Riwayat Video</span>
          </button>

          <button
            onClick={() => setActiveTab('credits')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'credits'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-700/40'
                : 'text-gray-300 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Dashboard Kredit</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-700/40'
                : 'text-gray-300 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Pengaturan API</span>
          </button>
        </nav>

        {/* Right Action Section */}
        <div className="flex items-center space-x-2.5">
          
          {/* PWA Android Install helper */}
          <button
            onClick={onOpenInstallModal}
            title="Panduan Pasang di HP Android"
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-300 bg-purple-950/60 border border-purple-800/40 hover:bg-purple-900/40 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Mode HP</span>
          </button>

          {/* API Health indicator */}
          <button
            onClick={() => setActiveTab('admin')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900/80 border border-purple-900/30 hover:border-purple-600/50 transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                configuredCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-gray-300 hidden lg:inline">
              {configuredCount > 0 ? `${configuredCount}/${providers.length} API Siap` : 'API Belum Diatur'}
            </span>
          </button>

          {/* Credits Badge */}
          <button
            onClick={() => setActiveTab('credits')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/40 to-violet-900/40 border border-purple-700/50 hover:border-purple-500 transition-colors text-purple-200"
          >
            <Coins className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-sm text-white">{user.creditBalance}</span>
            <span className="text-xs text-purple-300/80 hidden sm:inline">Kredit</span>
          </button>

          {/* User Profile button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 p-1 pl-2 sm:pr-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 hover:bg-purple-900/40 transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-lg object-cover border border-purple-500/50"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-purple-400 capitalize">{user.role}</p>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
