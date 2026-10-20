import type { ModelCapability, VideoGenerationParams, VideoResolution, AspectRatio } from './types.ts';

export const AI_MODELS: ModelCapability[] = [
  {
    id: 'veo-2',
    name: 'Google Veo 2',
    provider: 'google',
    badge: 'Kualitas Tertinggi 4K',
    description: 'Model video tercanggih Google DeepMind dengan pemahaman fisika nyata, kontrol sinematik detail, dan durasi hingga 15 detik.',
    supportedModes: ['text-to-video', 'image-to-video'],
    maxDuration: 15,
    durationOptions: [5, 8, 15],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportedRatios: ['16:9', '9:16', '1:1'],
    baseCreditCost: 15,
    envKeyRequired: 'GEMINI_API_KEY',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/vision',
    setupInstructions: 'Dapatkan API Key di Google AI Studio (aistudio.google.com), lalu set env GEMINI_API_KEY di file .env server.',
    features: {
      cameraControl: true,
      seedControl: true,
      motionStrength: true,
      audioInput: false,
      referenceImage: true,
    },
  },
  {
    id: 'kling-2-0',
    name: 'Kling AI 2.0 Pro',
    provider: 'kling',
    badge: 'Gerakan Karakter Halus',
    description: 'Model terdepan dari Kuaishou dengan kemampuan rendering anatomi manusia, dinamika kain, dan durasi fleksibel hingga 10 detik.',
    supportedModes: ['text-to-video', 'image-to-video', 'video-lip-sync'],
    maxDuration: 10,
    durationOptions: [5, 10],
    supportedResolutions: ['720p', '1080p'],
    supportedRatios: ['16:9', '9:16', '1:1'],
    baseCreditCost: 12,
    envKeyRequired: 'KLING_API_KEY',
    docsUrl: 'https://klingai.com/api',
    setupInstructions: 'Daftar di Kling AI Developer Console, buat Access Key dan Secret Key, lalu atur KLING_API_KEY di server.',
    features: {
      cameraControl: true,
      seedControl: true,
      motionStrength: true,
      audioInput: true,
      referenceImage: true,
    },
  },
  {
    id: 'seedance-v1',
    name: 'ByteDance Seedance v1',
    provider: 'seedance',
    badge: 'Generasi Cepat & Vertikal',
    description: 'Model video generasi baru berkecepatan tinggi dari ByteDance, dioptimalkan khusus untuk video pendek vertikal TikTok dan Reels.',
    supportedModes: ['text-to-video', 'image-to-video'],
    maxDuration: 10,
    durationOptions: [5, 8, 10],
    supportedResolutions: ['720p', '1080p'],
    supportedRatios: ['9:16', '16:9'],
    baseCreditCost: 10,
    envKeyRequired: 'SEEDANCE_API_KEY',
    docsUrl: 'https://www.volcengine.com/docs/seedance',
    setupInstructions: 'Dapatkan API Key di ByteDance Volcengine AI Studio, lalu konfigurasikan SEEDANCE_API_KEY di backend.',
    features: {
      cameraControl: false,
      seedControl: true,
      motionStrength: true,
      audioInput: false,
      referenceImage: true,
    },
  },
  {
    id: 'imagen-3-studio',
    name: 'Google Imagen 3 Studio',
    provider: 'google',
    badge: 'Teks ke Gambar HD',
    description: 'Generator gambar ultra-realistis berdefinisi tinggi untuk menghasilkan referensi visual atau storyboard video.',
    supportedModes: ['text-to-image'],
    maxDuration: 0,
    durationOptions: [0],
    supportedResolutions: ['1080p'],
    supportedRatios: ['16:9', '9:16', '1:1'],
    baseCreditCost: 3,
    envKeyRequired: 'GEMINI_API_KEY',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/imagen',
    setupInstructions: 'Memerlukan GEMINI_API_KEY aktif dari Google AI Studio untuk merender gambar resolusi tinggi.',
    features: {
      cameraControl: false,
      seedControl: true,
      motionStrength: false,
      audioInput: false,
      referenceImage: false,
    },
  },
  {
    id: 'lipsync-syncnet',
    name: 'SyncVoice LivePortrait',
    provider: 'syncnet',
    badge: 'Lip Sync Wajah Akurat',
    description: 'Sinkronisasi suara dan gerak bibir otomatis pada video atau foto wajah menggunakan model audio-driven neural speech rendering.',
    supportedModes: ['video-lip-sync'],
    maxDuration: 15,
    durationOptions: [5, 10, 15],
    supportedResolutions: ['720p', '1080p'],
    supportedRatios: ['9:16', '16:9', '1:1'],
    baseCreditCost: 8,
    envKeyRequired: 'LIPSYNC_API_KEY',
    docsUrl: 'https://api.fal.ai/models/syncnet',
    setupInstructions: 'Gunakan kunci API Lipsync/Fal.ai pada variabel LIPSYNC_API_KEY untuk pemrosesan sinkronisasi bibir.',
    features: {
      cameraControl: false,
      seedControl: false,
      motionStrength: false,
      audioInput: true,
      referenceImage: true,
    },
  },
];

/**
 * Validates generation parameters against model capabilities.
 * Returns an array of error messages (empty if valid).
 */
export function validateGenerationParams(
  params: VideoGenerationParams,
  model: ModelCapability
): string[] {
  const errors: string[] = [];

  // Prompt check (except for pure lip sync where audio + reference image might be primary)
  if (params.mode !== 'video-lip-sync' && (!params.prompt || params.prompt.trim().length < 3)) {
    errors.push('Prompt teks minimal harus memiliki 3 karakter.');
  }

  // Check if mode is supported by model
  if (!model.supportedModes.includes(params.mode)) {
    errors.push(`Model "${model.name}" tidak mendukung mode "${params.mode}".`);
  }

  // Duration check for video modes
  if (params.mode !== 'text-to-image') {
    if (!model.durationOptions.includes(params.duration)) {
      errors.push(
        `Durasi ${params.duration} detik tidak didukung oleh ${model.name}. Pilihan yang valid: ${model.durationOptions.join(', ')} detik.`
      );
    }
  }

  // Resolution check
  if (!model.supportedResolutions.includes(params.resolution)) {
    errors.push(
      `Resolusi ${params.resolution} tidak didukung oleh ${model.name}. Pilihan yang didukung: ${model.supportedResolutions.join(', ')}.`
    );
  }

  // Aspect ratio check
  if (!model.supportedRatios.includes(params.aspectRatio)) {
    errors.push(
      `Rasio aspek ${params.aspectRatio} tidak didukung oleh ${model.name}. Pilihan yang didukung: ${model.supportedRatios.join(', ')}.`
    );
  }

  // Image requirement for image-to-video
  if (params.mode === 'image-to-video' && !params.referenceImageUrl) {
    errors.push('Mode Image to Video membutuhkan gambar referensi.');
  }

  // Audio requirement for lip-sync
  if (params.mode === 'video-lip-sync' && !params.audioUrl) {
    errors.push('Mode Video Lip Sync membutuhkan file audio.');
  }

  return errors;
}

/**
 * Calculates credit cost for a given parameter set
 */
export function calculateCreditCost(
  params: VideoGenerationParams,
  model: ModelCapability
): number {
  if (params.mode === 'text-to-image') {
    return model.baseCreditCost;
  }

  let cost = model.baseCreditCost;

  // Duration factor: more than 5s adds extra cost
  if (params.duration > 5) {
    const extraDuration = params.duration - 5;
    cost += Math.ceil(extraDuration * 1.5);
  }

  // Resolution multiplier: 1080p + 2, 4K + 10
  if (params.resolution === '1080p') {
    cost += 4;
  } else if (params.resolution === '4k') {
    cost += 12;
  }

  return cost;
}

export function getModelById(modelId: string): ModelCapability | undefined {
  return AI_MODELS.find((m) => m.id === modelId);
}

export function getModelsForMode(mode: string): ModelCapability[] {
  return AI_MODELS.filter((m) => m.supportedModes.includes(mode as any));
}
