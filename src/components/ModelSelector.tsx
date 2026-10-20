import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ExternalLink, Sparkles, Sliders } from 'lucide-react';
import type { ModelCapability, GenerationMode } from '../shared/types.ts';

interface ModelSelectorProps {
  models: ModelCapability[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  currentMode: GenerationMode;
  onOpenAdminSettings: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelectModel,
  currentMode,
  onOpenAdminSettings,
}) => {
  // Filter models that support current mode
  const eligibleModels = models.filter((m) => m.supportedModes.includes(currentMode));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Pilih Model AI Video Engine</span>
        </label>
        <span className="text-xs text-purple-400 font-medium">
          {eligibleModels.length} Model Mendukung Mode Ini
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {eligibleModels.map((model) => {
          const isSelected = model.id === selectedModelId;
          const isConfigured = (model as any).isApiConfigured;

          return (
            <div
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className={`relative rounded-xl p-3.5 cursor-pointer transition-all border text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-900/30 ring-1 ring-purple-500/50'
                  : 'bg-neutral-900/60 border-purple-900/30 hover:border-purple-700/60 hover:bg-neutral-900/90'
              }`}
            >
              <div>
                {/* Header with Provider Tag & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/90 px-2 py-0.5 rounded-md border border-purple-800/50">
                      {model.provider.toUpperCase()}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1 flex items-center gap-1.5">
                      {model.name}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                    </h4>
                  </div>

                  {/* API Connectivity status */}
                  <span
                    className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isConfigured
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                      }`}
                    />
                    <span>{isConfigured ? 'API Aktif' : 'Perlu Key'}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {model.description}
                </p>
              </div>

              {/* Badges / Specs Footer */}
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {model.maxDuration > 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-800/30">
                      Maks {model.maxDuration}s
                    </span>
                  )}
                  {model.supportedResolutions.includes('4k') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/40">
                      Resolusi 4K
                    </span>
                  )}
                  {model.supportedRatios.includes('9:16') && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-800/30">
                      9:16 TikTok
                    </span>
                  )}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-gray-300">
                    Mulai {model.baseCreditCost} Kredit
                  </span>
                </div>

                {/* Setup helper if unconfigured */}
                {!isConfigured && (
                  <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between">
                    <span className="text-[11px] text-amber-400/90 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Kunci belum diatur
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAdminSettings();
                      }}
                      className="text-[11px] text-purple-300 hover:text-white underline flex items-center gap-0.5"
                    >
                      <span>Panduan API</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
