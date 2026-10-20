import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Terminal, 
  RefreshCw, 
  Server, 
  Lock, 
  Info,
  Check,
  Send
} from 'lucide-react';
import type { ProviderApiStatus } from '../shared/types.ts';

interface AdminApiSettingsProps {
  providers: ProviderApiStatus[];
  onRefreshStatus: () => Promise<void>;
}

export const AdminApiSettings: React.FC<AdminApiSettingsProps> = ({
  providers,
  onRefreshStatus,
}) => {
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: string;
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestConnection = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      setTestResult({
        provider,
        success: data.success,
        message: data.message,
      });
      await onRefreshStatus();
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: 'Gagal menghubungi server untuk pengujian koneksi.',
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const configuredCount = providers.filter(p => p.isConfigured).length;

  return (
    <div className="space-y-6">
      
      {/* Header and Security Disclaimer */}
      <div className="bg-neutral-900/70 border border-purple-900/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                <Key className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Pengaturan API & Kredensial Provider
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-300">
              Konfigurasi server-side untuk integrasi resmi model video Veo, Kling, Seedance, dan Lip-Sync.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshStatus}
            className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 hover:text-white text-xs font-semibold flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan Status API</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-purple-950/40 border border-purple-800/40 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed text-purple-200">
          <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Prinsip Keamanan Tanpa Kompromi: </span>
            Semua API key penyedia AI disimpan secara eksklusif pada sisi server (environment variables) dan tidak pernah dikirimkan atau diekspos ke antarmuka peramban frontend.
          </div>
        </div>
      </div>

      {/* Connectivity Test Feedback */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start space-x-3 ${
            testResult.success
              ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200'
              : 'bg-amber-950/80 border-amber-600/60 text-amber-200'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">
            <p className="font-bold text-white mb-0.5">Hasil Uji Koneksi Provider: {testResult.provider.toUpperCase()}</p>
            <p>{testResult.message}</p>
          </div>
        </div>
      )}

      {/* Provider List and Activation Guide */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Server className="w-4 h-4 text-purple-400" />
          <span>Daftar Provider Model Video Resmi ({configuredCount}/{providers.length} Terhubung)</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {providers.map((p) => {
            const isTesting = testingProvider === p.provider;

            return (
              <div
                key={p.provider}
                className="bg-neutral-900/60 border border-purple-900/30 rounded-2xl p-5 hover:border-purple-700/50 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-purple-400 uppercase bg-purple-950/90 px-2 py-0.5 rounded border border-purple-800/40">
                        {p.provider}
                      </span>
                      <h4 className="font-extrabold text-white text-base">{p.name}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Variabel Server: <code className="text-purple-300 font-mono bg-black/40 px-1.5 py-0.5 rounded">{p.envKey}</code>
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        p.isConfigured
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          p.isConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                        }`}
                      />
                      <span>{p.statusText}</span>
                    </span>

                    {/* Test Button */}
                    <button
                      type="button"
                      disabled={isTesting}
                      onClick={() => handleTestConnection(p.provider)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow shadow-purple-900/30"
                    >
                      {isTesting ? (
                        <span>Menguji...</span>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Uji Koneksi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="bg-black/40 border border-purple-900/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-purple-300 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" /> Panduan Langkah Aktivasi:
                    </span>
                    <a
                      href={p.setupUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:text-white underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Dokumentasi Portal Resmi</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <pre className="text-xs font-sans text-gray-300 whitespace-pre-line leading-relaxed">
                    {p.instructions}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deployment & Environment Helper */}
      <div className="bg-neutral-900/50 border border-purple-900/30 rounded-2xl p-5 space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center space-x-2">
          <Info className="w-4 h-4 text-purple-400" />
          <span>Cara Mengatur Environment Variable di Server Hosting</span>
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          Saat mempublikasikan aplikasi ke Cloud Run atau penyedia hosting Node.js, tambahkan variabel berikut di panel Environment Variables:
        </p>
        <div className="bg-black/50 p-3 rounded-xl font-mono text-xs text-purple-300 border border-purple-900/40 space-y-1">
          <div>GEMINI_API_KEY="AIzaSy..." <span className="text-gray-500"># Untuk Google Veo & Imagen</span></div>
          <div>KLING_API_KEY="kling_sec_..." <span className="text-gray-500"># Untuk Kling AI 2.0</span></div>
          <div>SEEDANCE_API_KEY="seedance_..." <span className="text-gray-500"># Untuk ByteDance Seedance</span></div>
          <div>LIPSYNC_API_KEY="fal_sync_..." <span className="text-gray-500"># Untuk SyncVoice Lip Sync</span></div>
        </div>
      </div>

    </div>
  );
};
