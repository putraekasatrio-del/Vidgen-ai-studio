import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Mic, 
  Send, 
  Upload, 
  AlertCircle, 
  Wand2, 
  Eye, 
  ShieldAlert, 
  Info, 
  Play, 
  Music, 
  Check, 
  RotateCcw,
  Film
} from 'lucide-react';
import type { 
  GenerationMode, 
  ModelCapability, 
  VideoGenerationParams, 
  UserProfile, 
  GenerationJob 
} from '../shared/types.ts';
import { ModelSelector } from './ModelSelector.tsx';
import { ParametersPanel } from './ParametersPanel.tsx';
import { calculateCreditCost } from '../shared/models.ts';

interface PromptStudioProps {
  models: ModelCapability[];
  user: UserProfile;
  onJobCreated: (job: GenerationJob) => void;
  onOpenAdminSettings: () => void;
  onOpenVideoPlayer: (job: GenerationJob) => void;
  prefilledImageForVideo?: string | null;
  onClearPrefilledImage?: () => void;
}

const INDONESIAN_PROMPT_PRESETS: Record<GenerationMode, { title: string; prompt: string }[]> = {
  'text-to-video': [
    {
      title: 'Kota Cyberpunk 2090',
      prompt: 'Sinematik pemandangan kota futuristik cyberpunk Jakarta tahun 2090, mobil terbang dengan jejak cahaya neon ungu, hujan gerimis refleksi aspal 4K photorealistic.',
    },
    {
      title: 'Alam Fantasi Ghibli',
      prompt: 'Lanskap padang rumput hijau luas dengan kastil melayang di langit berawan putih lembut, angin menerbangkan bunga sakura, pencahayaan golden hour anime.',
    },
    {
      title: 'Iklan Mobil Listrik',
      prompt: 'Mobil hypercar elektrik hitam elegan meluncur di jalanan pesisir pantai tebing berbatu saat matahari terbenam, bidikan kamera drone dinamis sinematik.',
    },
    {
      title: 'Laba-laba Kristal Makro',
      prompt: 'Bidikan makro 8K laba-laba transparan terbuat dari kristal amestist bersinar, bergerak perlahan di atas kelopak bunga basah dengan tetesan embun.',
    },
  ],
  'image-to-video': [
    {
      title: 'Gaun Berkibar Halus',
      prompt: 'Animasikan karakter gaun sutra ungu berkibar tertiup angin sepoi-sepoi, senyuman lembut menatap kamera, gerak mata berkedip natural.',
    },
    {
      title: 'Mobil Berakselerasi',
      prompt: 'Mobil menyalakan lampu depan LED, roda mulai berputar cepat mengeluarkan percikan asap, bergerak maju menyusuri jalan raya malam.',
    },
    {
      title: 'Air Terjun Mengalir',
      prompt: 'Aliran air terjun mengalir deras dengan kabut air halus membubung, dedaunan di sekitar bergoyang lembut diterpa embun.',
    },
  ],
  'text-to-image': [
    {
      title: 'Potret Cyborg Futuristik',
      prompt: 'Potret wanita cyborg dengan pola sirkuit neon ungu bercahaya di pipi, mata amber cybernetic, pencahayaan studio gelap kontras tinggi 8K.',
    },
    {
      title: 'Desain Arsitektur Modern',
      prompt: 'Vila mewah minimalis modern dengan kolam renang infinity menghadap tebing laut Bali, pencahayaan senja dramatis, gaya Architectural Digest.',
    },
    {
      title: 'Karakter Anime Pahlawan',
      prompt: 'Karakter anime pahlawan rambut perak memegang pedang bermandikan petir ungu, efek partikel cahaya berterbangan, gaya Makoto Shinkai.',
    },
  ],
  'video-lip-sync': [
    {
      title: 'Pembawa Berita AI',
      prompt: 'Sinkronisasikan ucapan presenter wanita profesional dengan artikulasi bibir presisi dan anggukan kepala yang meyakinkan.',
    },
    {
      title: 'Karakter Kartun Bernyanyi',
      prompt: 'Sinkronisasi gerakan bibir karakter animasi dengan ketukan dan emosi vokal lagu anak-anak bersemangat.',
    },
  ],
};

const SAMPLE_REFERENCE_IMAGES = [
  {
    name: 'Model Fesyen Studio',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mobil Sport Gelap',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Pemandangan Gunung & Danau',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Robot Cyberpunk',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  },
];

const SAMPLE_AUDIO_FILES = [
  {
    name: 'Suara Presenter Indonesia (Formal)',
    url: 'https://actions.google.com/sounds/v1/speech/announcement_chime.ogg',
  },
  {
    name: 'Dialog Narasi Podcast Inspiratif',
    url: 'https://actions.google.com/sounds/v1/speech/gentle_applause.ogg',
  },
];

export const PromptStudio: React.FC<PromptStudioProps> = ({
  models,
  user,
  onJobCreated,
  onOpenAdminSettings,
  onOpenVideoPlayer,
  prefilledImageForVideo,
  onClearPrefilledImage,
}) => {
  const [mode, setMode] = useState<GenerationMode>(prefilledImageForVideo ? 'image-to-video' : 'text-to-video');
  const [selectedModelId, setSelectedModelId] = useState<string>('veo-2');
  const [prompt, setPrompt] = useState<string>(INDONESIAN_PROMPT_PRESETS['text-to-video'][0].prompt);
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [showNegative, setShowNegative] = useState<boolean>(false);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>(prefilledImageForVideo || '');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioName, setAudioName] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [unconfiguredNotice, setUnconfiguredNotice] = useState<{
    modelName: string;
    envKey: string;
    instructions: string;
  } | null>(null);

  // Fallback or active model
  const activeModel = models.find(m => m.id === selectedModelId) || models[0];

  // Parameters state
  const [params, setParams] = useState<VideoGenerationParams>({
    mode: 'text-to-video',
    modelId: 'veo-2',
    prompt: INDONESIAN_PROMPT_PRESETS['text-to-video'][0].prompt,
    duration: 8,
    resolution: '1080p',
    aspectRatio: '16:9',
    motionStrength: 7,
    cameraMotion: 'pan_right',
    seed: Math.floor(Math.random() * 899999) + 100000,
  });

  // When mode changes, adapt model and defaults
  const handleModeChange = (newMode: GenerationMode) => {
    setMode(newMode);
    setErrorBanner(null);
    setUnconfiguredNotice(null);

    // Pick first compatible model
    const compatible = models.filter(m => m.supportedModes.includes(newMode));
    const nextModel = compatible[0] || activeModel;
    setSelectedModelId(nextModel.id);

    // Set sample prompt for this mode
    const sample = INDONESIAN_PROMPT_PRESETS[newMode][0]?.prompt || '';
    setPrompt(sample);

    setParams(prev => ({
      ...prev,
      mode: newMode,
      modelId: nextModel.id,
      prompt: sample,
      duration: nextModel.durationOptions[0] || 5,
      resolution: nextModel.supportedResolutions[0] || '1080p',
      aspectRatio: newMode === 'video-lip-sync' ? '9:16' : nextModel.supportedRatios[0] || '16:9',
      referenceImageUrl: newMode === 'image-to-video' ? (referenceImageUrl || SAMPLE_REFERENCE_IMAGES[0].url) : undefined,
      audioUrl: newMode === 'video-lip-sync' ? (audioUrl || SAMPLE_AUDIO_FILES[0].url) : undefined,
    }));
  };

  // Switch model
  const handleSelectModel = (modelId: string) => {
    const next = models.find(m => m.id === modelId);
    if (!next) return;
    setSelectedModelId(modelId);
    setErrorBanner(null);
    setUnconfiguredNotice(null);

    setParams(prev => {
      // Ensure duration is supported
      const duration = next.durationOptions.includes(prev.duration) ? prev.duration : next.durationOptions[0];
      const resolution = next.supportedResolutions.includes(prev.resolution) ? prev.resolution : next.supportedResolutions[0];
      const aspectRatio = next.supportedRatios.includes(prev.aspectRatio) ? prev.aspectRatio : next.supportedRatios[0];

      return {
        ...prev,
        modelId,
        duration,
        resolution,
        aspectRatio,
      };
    });
  };

  // Submit generation request
  const handleSubmitGeneration = async (allowSandboxSimulation: boolean = false) => {
    setErrorBanner(null);
    setUnconfiguredNotice(null);

    if (mode !== 'video-lip-sync' && (!prompt || prompt.trim().length < 3)) {
      setErrorBanner('Silakan masukkan prompt deskripsi minimal 3 karakter.');
      return;
    }

    if (mode === 'image-to-video' && !referenceImageUrl) {
      setErrorBanner('Silakan pilih atau unggah gambar referensi terlebih dahulu.');
      return;
    }

    if (mode === 'video-lip-sync' && !audioUrl) {
      setErrorBanner('Silakan pilih atau unggah file audio untuk sinkronisasi bibir.');
      return;
    }

    const payloadParams: VideoGenerationParams = {
      ...params,
      mode,
      modelId: selectedModelId,
      prompt,
      negativePrompt: showNegative ? negativePrompt : undefined,
      referenceImageUrl: mode === 'image-to-video' ? referenceImageUrl : undefined,
      audioUrl: mode === 'video-lip-sync' ? audioUrl : undefined,
      audioFileName: mode === 'video-lip-sync' ? audioName : undefined,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: payloadParams,
          userId: user.id,
          allowSandboxSimulation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if API unconfigured (status 428)
        if (response.status === 428) {
          setUnconfiguredNotice({
            modelName: data.modelName || activeModel.name,
            envKey: data.envKey || activeModel.envKeyRequired,
            instructions: data.instructions || activeModel.setupInstructions,
          });
          return;
        }

        // Insufficient credits or validation errors
        if (data.details && Array.isArray(data.details)) {
          setErrorBanner(data.details.join(' '));
        } else {
          setErrorBanner(data.error || 'Gagal memulai proses generasi video.');
        }
        return;
      }

      // Success
      if (data.job) {
        onJobCreated(data.job);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorBanner('Gagal terhubung ke server backend VIDGEN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedCost = calculateCreditCost(
    { ...params, mode, prompt, duration: params.duration },
    activeModel
  );

  return (
    <div className="space-y-6">
      
      {/* Mode Tabs (Futuristic Dark Design) */}
      <div className="bg-neutral-900/70 p-1.5 rounded-2xl border border-purple-900/40 shadow-inner">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          
          <button
            type="button"
            onClick={() => handleModeChange('text-to-video')}
            className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              mode === 'text-to-video'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-700/40 ring-1 ring-purple-400'
                : 'text-gray-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>Teks ke Video</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('image-to-video')}
            className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              mode === 'image-to-video'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-700/40 ring-1 ring-purple-400'
                : 'text-gray-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>Gambar ke Video</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('text-to-image')}
            className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              mode === 'text-to-image'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-700/40 ring-1 ring-purple-400'
                : 'text-gray-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Teks ke Gambar</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('video-lip-sync')}
            className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              mode === 'video-lip-sync'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-700/40 ring-1 ring-purple-400'
                : 'text-gray-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Mic className="w-4 h-4 shrink-0" />
            <span>Video Lip Sync</span>
          </button>

        </div>
      </div>

      {/* Unconfigured API Notice Banner (Integrity Compliance) */}
      {unconfiguredNotice && (
        <div className="bg-amber-950/60 border border-amber-600/50 rounded-2xl p-4 sm:p-5 text-amber-200 space-y-3">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-100 text-sm sm:text-base">
                Kunci API {unconfiguredNotice.modelName} Belum Dikonfigurasi di Server
              </h4>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-1 leading-relaxed">
                Sesuai kebijakan keamanan dan integritas VIDGEN AI Studio, kami tidak membuat video tiruan atau mengklaim model aktif sebelum API resmi dikonfigurasi.
              </p>
              <div className="mt-3 bg-black/40 p-3 rounded-xl text-xs font-mono text-amber-300 border border-amber-800/40">
                Variabel Environment: <span className="font-bold underline">{unconfiguredNotice.envKey}</span>
                <p className="font-sans text-[11px] text-gray-300 mt-1">
                  {unconfiguredNotice.instructions}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-amber-900/40">
            <button
              type="button"
              onClick={onOpenAdminSettings}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/40"
            >
              Buka Pengaturan API
            </button>
            <button
              type="button"
              onClick={() => handleSubmitGeneration(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-900/50 hover:bg-amber-800/60 text-amber-200 text-xs font-semibold border border-amber-700/50 transition-colors"
            >
              Jalankan Simulasi Alur Studio (Sandbox Mode)
            </button>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {errorBanner && (
        <div className="bg-rose-950/70 border border-rose-600/50 rounded-xl p-3.5 text-rose-200 flex items-start space-x-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorBanner}</div>
        </div>
      )}

      {/* Mode Specific Inputs */}
      
      {/* 1. Image-to-Video: Reference Image Selection */}
      {mode === 'image-to-video' && (
        <div className="bg-neutral-900/50 border border-purple-900/30 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>Gambar Referensi Sumber (Image to Video)</span>
            </label>
            {referenceImageUrl && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Gambar Terpilih
              </span>
            )}
          </div>

          {/* Active Preview or Upload Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            {/* Selected Image Preview */}
            <div className="relative aspect-video md:aspect-square rounded-xl overflow-hidden border border-purple-800/50 bg-black/40 flex items-center justify-center group">
              {referenceImageUrl ? (
                <>
                  <img
                    src={referenceImageUrl}
                    alt="Referensi"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => setReferenceImageUrl('')}
                      className="px-2.5 py-1 bg-red-600/90 text-white rounded-lg text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-8 h-8 text-purple-400/60 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Pilih salah satu sampel di samping atau masukkan URL gambar.</p>
                </div>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="md:col-span-2 space-y-2">
              <p className="text-xs text-gray-400 font-medium">Atau pilih sampel gambar referensi:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_REFERENCE_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReferenceImageUrl(sample.url)}
                    className={`rounded-xl overflow-hidden border text-left transition-all relative ${
                      referenceImageUrl === sample.url
                        ? 'border-purple-500 ring-2 ring-purple-500'
                        : 'border-purple-900/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={sample.url} alt={sample.name} className="w-full h-16 object-cover" />
                    <p className="p-1 text-[10px] text-gray-300 truncate bg-neutral-900">{sample.name}</p>
                  </button>
                ))}
              </div>

              {/* URL Custom Input */}
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Atau tempel URL gambar eksternal (https://...)"
                  value={referenceImageUrl}
                  onChange={(e) => setReferenceImageUrl(e.target.value)}
                  className="w-full bg-neutral-800 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. Video Lip Sync: Face & Audio Selection */}
      {mode === 'video-lip-sync' && (
        <div className="bg-neutral-900/50 border border-purple-900/30 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
              <Mic className="w-4 h-4 text-purple-400" />
              <span>Sumber Suara & Wajah Lip Sync</span>
            </label>
            <span className="text-xs text-purple-400 font-medium">Model SyncVoice Neural</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Audio selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>Pilih Audio Sulih Suara</span>
              </label>

              <div className="space-y-2">
                {SAMPLE_AUDIO_FILES.map((audio, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setAudioUrl(audio.url);
                      setAudioName(audio.name);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                      audioUrl === audio.url
                        ? 'bg-purple-950/70 border-purple-500 text-white'
                        : 'bg-neutral-800/80 border-purple-900/30 text-gray-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">{audio.name}</span>
                    </div>
                    {audioUrl === audio.url && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                ))}
              </div>

              <input
                type="text"
                placeholder="Atau masukkan URL audio (MP3 / WAV)"
                value={audioUrl}
                onChange={(e) => {
                  setAudioUrl(e.target.value);
                  setAudioName('Custom Audio');
                }}
                className="w-full bg-neutral-800 border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Face reference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>Wajah Subjek / Karakter</span>
              </label>
              <div className="flex items-center space-x-3 p-3 bg-purple-950/30 rounded-xl border border-purple-900/30">
                <img
                  src={referenceImageUrl || SAMPLE_REFERENCE_IMAGES[0].url}
                  alt="Wajah"
                  className="w-14 h-14 rounded-xl object-cover border border-purple-500/50"
                />
                <div className="text-xs text-gray-300 space-y-1">
                  <p className="font-semibold text-white">Model Wajah Standar Aktif</p>
                  <p className="text-[11px] text-gray-400">
                    Artikulasi fonem otomatis diselaraskan dengan ritme audio.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Model Selector Component */}
      <ModelSelector
        models={models}
        selectedModelId={selectedModelId}
        onSelectModel={handleSelectModel}
        currentMode={mode}
        onOpenAdminSettings={onOpenAdminSettings}
      />

      {/* Prompt Text Input Area */}
      <div className="bg-neutral-900/50 border border-purple-900/30 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span>Prompt Deskripsi Video (Bahasa Indonesia atau Inggris)</span>
          </label>
          <span className="text-xs text-gray-400">{prompt.length} karakter</span>
        </div>

        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tuliskan deskripsi adegan video secara mendetail (gerakan, suasana, objek, pencahayaan, gaya visual)..."
          className="w-full bg-neutral-950/90 border border-purple-900/40 rounded-xl p-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />

        {/* Indonesian Prompt Presets / Inspirations */}
        <div className="space-y-1.5">
          <p className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Rekomendasi Prompt Cepat:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {INDONESIAN_PROMPT_PRESETS[mode].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(preset.prompt)}
                className="text-xs bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Negative Prompt Toggle */}
        <div className="pt-2 border-t border-purple-900/30">
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="text-xs text-gray-400 hover:text-purple-300 flex items-center gap-1.5"
          >
            <span>{showNegative ? '− Sembunyikan Negative Prompt' : '+ Tambah Negative Prompt (Elemen yang Dihindari)'}</span>
          </button>

          {showNegative && (
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Contoh: buram, distorsi, jari ganda, teks, watermark, low quality"
              className="mt-2 w-full bg-neutral-950/90 border border-purple-900/40 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          )}
        </div>
      </div>

      {/* Video Settings / Parameters Panel */}
      <ParametersPanel
        model={activeModel}
        params={params}
        onChangeParams={setParams}
      />

      {/* Main Generate Button CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-purple-950/80 via-neutral-900 to-indigo-950/80 p-4 sm:p-5 rounded-2xl border border-purple-800/40 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className="text-sm font-bold text-white">Model: {activeModel.name}</span>
            <span className="text-xs text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-700/50">
              {params.aspectRatio} • {params.resolution.toUpperCase()}
              {mode !== 'text-to-image' && ` • ${params.duration}s`}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Estimasi waktu proses: ~30-60 detik tergantung antrean komputasi model.
          </p>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSubmitGeneration(false)}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2.5 transition-all shadow-lg ${
            isSubmitting
              ? 'bg-purple-900/70 text-gray-400 cursor-wait'
              : 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memproses Permintaan...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-purple-200" />
              <span>Hasilkan Video Sekarang ({calculatedCost} Kredit)</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
