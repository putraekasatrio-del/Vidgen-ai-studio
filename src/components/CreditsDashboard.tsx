import React, { useState } from 'react';
import { 
  Coins, 
  Zap, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Calculator, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import type { UserProfile, ModelCapability, VideoResolution } from '../shared/types.ts';
import { calculateCreditCost } from '../shared/models.ts';

interface CreditsDashboardProps {
  user: UserProfile;
  models: ModelCapability[];
  onTopupCredits: (amount: number, planName: string) => Promise<void>;
  onNavigateToStudio: () => void;
}

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Creator',
    credits: 50,
    priceIdr: 'Rp 49.000',
    popular: false,
    description: 'Cocok untuk eksperimen pembuatan 3-4 video definisi tinggi.',
    features: ['Akses Google Veo 2 (720p/1080p)', 'Dukungan Video Vertikal 9:16', 'Penyimpanan Riwayat Standar'],
  },
  {
    id: 'creator-pro',
    name: 'Creator Pro',
    credits: 200,
    priceIdr: 'Rp 149.000',
    popular: true,
    description: 'Paket terfavorit untuk kreator konten YouTube Shorts, TikTok, dan Reels.',
    features: ['Dukungan Render Ultra HD 4K', 'Durasi Penuh hingga 15 Detik', 'Akses Semua Model (Kling, Seedance, Veo)', 'Prioritas Antrean Render GPU'],
  },
  {
    id: 'studio-enterprise',
    name: 'Studio Enterprise',
    credits: 600,
    priceIdr: 'Rp 399.000',
    popular: false,
    description: 'Untuk agensi iklan, studio produksi komersial, dan batch video generation.',
    features: ['Rendering Simultan Multi-Job', 'Dukungan Lip Sync Suara Tanpa Batas', 'Dedicated Server Proxy', 'Dukungan Teknis Prioritas 24/7'],
  },
];

export const CreditsDashboard: React.FC<CreditsDashboardProps> = ({
  user,
  models,
  onTopupCredits,
  onNavigateToStudio,
}) => {
  const [topupLoading, setTopupLoading] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Interactive Calculator State
  const [calcModelId, setCalcModelId] = useState<string>('veo-2');
  const [calcDuration, setCalcDuration] = useState<number>(8);
  const [calcResolution, setCalcResolution] = useState<VideoResolution>('1080p');

  const selectedCalcModel = models.find(m => m.id === calcModelId) || models[0];
  const calculatedCost = calculateCreditCost(
    {
      mode: 'text-to-video',
      modelId: calcModelId,
      prompt: 'dummy',
      duration: calcDuration,
      resolution: calcResolution,
      aspectRatio: '16:9',
    },
    selectedCalcModel
  );

  const handleTopup = async (amount: number, planName: string, id: string) => {
    setTopupLoading(id);
    setSuccessBanner(null);
    try {
      await onTopupCredits(amount, planName);
      setSuccessBanner(`Selamat! Kuota Anda bertambah +${amount} Kredit (${planName}).`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setTopupLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner: User Balance & Status */}
      <div className="bg-gradient-to-br from-purple-950/80 via-[#130d29] to-indigo-950/80 border border-purple-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Futuristic glowing backdrop orb */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-700/50">
                Paket Aktif: {user.tier}
              </span>
              <span className="text-xs text-gray-400">ID: {user.id}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Halo, {user.name}
            </h1>
            
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
              Kredit digunakan untuk memproses komputasi kecerdasan buatan pada model video generasi mutakhir.
            </p>
          </div>

          {/* Balance card */}
          <div className="bg-black/50 border border-purple-700/50 rounded-2xl p-5 min-w-[260px] flex flex-col items-center sm:items-end justify-center shadow-inner">
            <span className="text-xs text-purple-300 font-medium">Sisa Saldo Kredit</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <Coins className="w-6 h-6 text-purple-400" />
              <span className="text-4xl font-extrabold text-white tracking-tight">{user.creditBalance}</span>
              <span className="text-sm font-semibold text-purple-300">Kredit</span>
            </div>
            <div className="mt-2 text-[11px] text-gray-400">
              Total Generasi Berhasil: <span className="font-bold text-white">{user.generationsCount}</span> video
            </div>
          </div>
        </div>

        {/* Success notification */}
        {successBanner && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}
      </div>

      {/* Credit Pricing Packages */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center sm:justify-start space-x-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span>Pilihan Paket Isi Ulang Kuota Kredit</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Simulasikan top-up saldo instan untuk melanjutkan proses pembuatan konten video Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-all relative ${
                pkg.popular
                  ? 'bg-purple-950/50 border-purple-500 shadow-xl shadow-purple-900/30 ring-1 ring-purple-500'
                  : 'bg-neutral-900/60 border-purple-900/30 hover:border-purple-700/60'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] uppercase font-extrabold tracking-wider px-3 py-0.5 rounded-full shadow-md">
                  Paling Populer
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-white text-base">{pkg.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{pkg.description}</p>
                </div>

                <div className="pt-2 border-t border-purple-900/30 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-white">{pkg.credits}</span>
                    <span className="text-xs text-purple-300 ml-1 font-semibold">Kredit</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">{pkg.priceIdr}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-purple-900/30">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  disabled={topupLoading !== null}
                  onClick={() => handleTopup(pkg.credits, pkg.name, pkg.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 ${
                    pkg.popular
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-800/40'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-purple-200 border border-purple-900/50'
                  }`}
                >
                  {topupLoading === pkg.id ? (
                    <span>Memproses Kuota...</span>
                  ) : (
                    <>
                      <span>Isi Ulang +{pkg.credits} Kredit</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Credit Cost Calculator */}
      <div className="bg-neutral-900/60 border border-purple-900/30 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-base">Kalkulator Estimasi Biaya Kredit Video</h3>
        </div>
        <p className="text-xs text-gray-400">
          Biaya kredit dihitung secara transparan berdasarkan model AI yang dipilih, durasi frame video, serta resolusi output.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center pt-2">
          
          {/* Model selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Model AI</label>
            <select
              value={calcModelId}
              onChange={(e) => {
                const nextId = e.target.value;
                setCalcModelId(nextId);
                const m = models.find(mod => mod.id === nextId);
                if (m && !m.durationOptions.includes(calcDuration)) {
                  setCalcDuration(m.durationOptions[0] || 5);
                }
              }}
              className="w-full bg-neutral-800 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Durasi Video</label>
            <select
              value={calcDuration}
              onChange={(e) => setCalcDuration(parseInt(e.target.value, 10))}
              className="w-full bg-neutral-800 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {selectedCalcModel.durationOptions.map((d) => (
                <option key={d} value={d}>
                  {d} Detik
                </option>
              ))}
            </select>
          </div>

          {/* Resolution */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Resolusi</label>
            <select
              value={calcResolution}
              onChange={(e) => setCalcResolution(e.target.value as any)}
              className="w-full bg-neutral-800 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {selectedCalcModel.supportedResolutions.map((r) => (
                <option key={r} value={r}>
                  {r.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Calculated Output box */}
          <div className="p-3 bg-purple-950/70 border border-purple-700/50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-purple-300">Estimasi Kebutuhan</p>
              <p className="text-xl font-black text-white">{calculatedCost} Kredit</p>
            </div>
            <button
              type="button"
              onClick={onNavigateToStudio}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition-all"
            >
              Buka Studio
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
