export type GenerationMode = 'text-to-video' | 'image-to-video' | 'text-to-image' | 'video-lip-sync';

export type VideoResolution = '720p' | '1080p' | '4k';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type JobStatus = 'menunggu' | 'memproses' | 'berhasil' | 'gagal';

export interface ModelCapability {
  id: string;
  name: string;
  provider: 'google' | 'kling' | 'seedance' | 'syncnet';
  badge: string;
  description: string;
  supportedModes: GenerationMode[];
  maxDuration: number; // e.g. 15
  durationOptions: number[]; // e.g. [5, 10, 15]
  supportedResolutions: VideoResolution[];
  supportedRatios: AspectRatio[];
  baseCreditCost: number;
  envKeyRequired: string;
  docsUrl: string;
  setupInstructions: string;
  features: {
    cameraControl: boolean;
    seedControl: boolean;
    motionStrength: boolean;
    audioInput: boolean;
    referenceImage: boolean;
  };
}

export interface VideoGenerationParams {
  mode: GenerationMode;
  modelId: string;
  prompt: string;
  negativePrompt?: string;
  duration: number;
  resolution: VideoResolution;
  aspectRatio: AspectRatio;
  motionStrength?: number; // 1 - 10
  cameraMotion?: 'static' | 'pan_left' | 'pan_right' | 'zoom_in' | 'zoom_out' | 'drone_orbit';
  seed?: number;
  referenceImageUrl?: string;
  audioUrl?: string;
  audioFileName?: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  mode: GenerationMode;
  modelId: string;
  modelName: string;
  prompt: string;
  params: VideoGenerationParams;
  status: JobStatus;
  progress: number; // 0 - 100
  createdAt: string;
  completedAt?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string; // For text-to-image
  durationSeconds?: number;
  costCredits: number;
  errorMessage?: string;
  apiConfigured: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'kreator' | 'admin';
  creditBalance: number;
  tier: 'Free Starter' | 'Creator Pro' | 'Studio Enterprise';
  generationsCount: number;
}

export interface ProviderApiStatus {
  provider: 'google' | 'kling' | 'seedance' | 'syncnet';
  name: string;
  envKey: string;
  isConfigured: boolean;
  statusText: string;
  setupUrl: string;
  instructions: string;
}
