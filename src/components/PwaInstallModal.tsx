import React from 'react';
import { X, Smartphone, CheckCircle2, Download, Share } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e091d] border border-purple-800/50 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Pasang di Layar Utama HP</h3>
              <p className="text-[11px] text-purple-400">Optimasi untuk Android & Ponsel Pintar</p>
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

        {/* Instructions */}
        <div className="space-y-3.5 text-xs text-gray-200">
          <p className="leading-relaxed">
            Aplikasi VIDGEN AI Studio telah dilengkapi teknologi Progressive Web App (PWA). Anda dapat memasangnya langsung di ponsel Android tanpa perlu melalui toko aplikasi:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 bg-neutral-900/80 rounded-xl border border-purple-900/30 flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="font-bold text-white">Buka Menu Browser</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Di Google Chrome Android, ketuk ikon titik tiga (⋮) di sudut kanan atas.
                </p>
              </div>
            </div>

            <div className="p-3 bg-neutral-900/80 rounded-xl border border-purple-900/30 flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="font-bold text-white">Pilih "Tambahkan ke Layar Utama"</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Atau pilih opsi "Instal Aplikasi VIDGEN AI Studio".
                </p>
              </div>
            </div>

            <div className="p-3 bg-neutral-900/80 rounded-xl border border-purple-900/30 flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="font-bold text-white">Akses Layar Penuh (Standalone)</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Ikon VIDGEN akan muncul di beranda ponsel Anda dan dapat dibuka secepat aplikasi native.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all"
        >
          Mengerti, Lanjutkan
        </button>

      </div>
    </div>
  );
};
