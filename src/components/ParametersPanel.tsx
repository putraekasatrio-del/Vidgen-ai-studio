import React from 'react';
import { Clock, Monitor, Smartphone, Square, Sliders, Video, Compass, Shuffle, Coins } from 'lucide-react';
import type { ModelCapability, VideoResolution, AspectRatio, VideoGenerationParams } from '../shared/types.ts';
import { calculateCreditCost } from '../shared/models.ts';

interface ParametersPanelProps {
  model: ModelCapability;
  params: VideoGenerationParams;
  onChangeParams: (updater: (prev: VideoGenerationParams) => VideoGenerationParams) => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  model,
  params,
  onChangeParams,
}) => {
  const isVideoMode = params.mode !== 'text-to-image';
  const calculatedCost = calculateCreditCost(params, model);

  return (
    <div className="bg-neutral-900/50 border border-purple-900/30 rounded-2xl p-4 sm:p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-sm sm:text-base">Pengaturan & Parameter Video</h3>
        </div>
        <div className="flex items-center space-x-1.5 bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/40">
          <Coins className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-semibold text-purple-200">
            Biaya: <span className="text-white font-bold">{calculatedCost}</span> Kredit
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Durasi Video (hanya untuk mode video) */}
        {isVideoMode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Durasi Video</span>
              </label>
              <span className="text-xs font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                {params.duration} Detik
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {model.durationOptions.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => onChangeParams(p => ({ ...p, duration: dur }))}
                  className={`flex-1 min-w-[60px] py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    params.duration === dur
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                      : 'bg-neutral-800/80 text-gray-300 hover:bg-neutral-800 hover:text-white border border-purple-900/30'
                  }`}
                >
                  {dur}s
                  {dur === 15 && <span className="block text-[9px] text-purple-200 font-normal">Maksimal</span>}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500">
              *Model {model.name} mendukung durasi hingga {model.maxDuration} detik.
            </p>
          </div>
        )}

        {/* Resolusi Video */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-purple-400" />
            <span>Resolusi Output</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(['720p', '1080p', '4k'] as VideoResolution[]).map((res) => {
              const isSupported = model.supportedResolutions.includes(res);
              const isSelected = params.resolution === res;

              return (
                <button
                  key={res}
                  type="button"
                  disabled={!isSupported}
                  onClick={() => onChangeParams(p => ({ ...p, resolution: res }))}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center ${
                    !isSupported
                      ? 'opacity-30 bg-neutral-900 border border-neutral-800 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                      : 'bg-neutral-800/80 text-gray-300 hover:bg-neutral-800 hover:text-white border border-purple-900/30'
                  }`}
                >
                  <span className="uppercase">{res}</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {res === '4k' ? 'Ultra HD' : res === '1080p' ? 'Full HD' : 'HD Ready'}
                  </span>
                  {!isSupported && (
                    <span className="text-[8px] text-gray-400 mt-0.5">Tidak didukung</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rasio Aspek */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>Rasio Layar (Aspect Ratio)</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((ratio) => {
              const isSupported = model.supportedRatios.includes(ratio);
              const isSelected = params.aspectRatio === ratio;

              return (
                <button
                  key={ratio}
                  type="button"
                  disabled={!isSupported}
                  onClick={() => onChangeParams(p => ({ ...p, aspectRatio: ratio }))}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                    !isSupported
                      ? 'opacity-30 bg-neutral-900 border border-neutral-800 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                      : 'bg-neutral-800/80 text-gray-300 hover:bg-neutral-800 hover:text-white border border-purple-900/30'
                  }`}
                >
                  <div className="mb-1">
                    {ratio === '16:9' ? (
                      <Monitor className="w-3.5 h-3.5" />
                    ) : ratio === '9:16' ? (
                      <Smartphone className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span>{ratio}</span>
                  <span className="text-[8px] opacity-80 font-normal">
                    {ratio === '16:9' ? 'Landscape' : ratio === '9:16' ? 'TikTok / HP' : 'Persegi'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Advanced Camera Motion & Seed Controls if supported */}
      {isVideoMode && (
        <div className="pt-3 border-t border-purple-900/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Gerakan Kamera */}
          {model.features.cameraControl && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span>Gerakan Kamera (Cinematography)</span>
              </label>
              <select
                value={params.cameraMotion || 'static'}
                onChange={(e) => onChangeParams(p => ({ ...p, cameraMotion: e.target.value as any }))}
                className="w-full bg-neutral-800 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="static">Kamera Statis (Fokus Karakter)</option>
                <option value="pan_right">Geser Kanan (Pan Right)</option>
                <option value="pan_left">Geser Kiri (Pan Left)</option>
                <option value="zoom_in">Zoom Masuk (Dolly Zoom In)</option>
                <option value="zoom_out">Zoom Keluar (Zoom Out)</option>
                <option value="drone_orbit">Orbit Drone Memutar (360° Orbit)</option>
              </select>
            </div>
          )}

          {/* Intensitas Gerakan */}
          {model.features.motionStrength && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-300">
                  Intensitas Gerakan AI: {params.motionStrength || 6}/10
                </label>
                <span className="text-[10px] text-purple-400">
                  {(params.motionStrength || 6) >= 7 ? 'Dinamis Cepat' : 'Halus Sinematik'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={params.motionStrength || 6}
                onChange={(e) => onChangeParams(p => ({ ...p, motionStrength: parseInt(e.target.value, 10) }))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          )}

          {/* Seed Generator */}
          {model.features.seedControl && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Seed Replikasi</span>
                <button
                  type="button"
                  onClick={() => onChangeParams(p => ({ ...p, seed: Math.floor(Math.random() * 999999) }))}
                  className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Shuffle className="w-2.5 h-2.5" /> Acak Seed
                </button>
              </label>
              <input
                type="number"
                placeholder="Acak (opsional)"
                value={params.seed ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  onChangeParams(p => ({ ...p, seed: val }));
                }}
                className="w-full bg-neutral-800 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

        </div>
      )}

    </div>
  );
};
