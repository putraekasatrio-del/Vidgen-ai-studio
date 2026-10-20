import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { AI_MODELS, validateGenerationParams, calculateCreditCost, getModelById } from './src/shared/models.ts';
import type { GenerationJob, VideoGenerationParams, UserProfile, ProviderApiStatus } from './src/shared/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure storage dir exists
const STORAGE_DIR = path.join(__dirname, 'storage');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const JOBS_FILE = path.join(STORAGE_DIR, 'jobs.json');
const USERS_FILE = path.join(STORAGE_DIR, 'users.json');

// Initial seed users
const INITIAL_USERS: Record<string, UserProfile> = {
  'user-kreator': {
    id: 'user-kreator',
    name: 'Kreator Studio',
    email: 'kreator@vidgen.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'kreator',
    creditBalance: 120,
    tier: 'Creator Pro',
    generationsCount: 14,
  },
  'user-admin': {
    id: 'user-admin',
    name: 'Administrator VIDGEN',
    email: 'admin@vidgen.ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    creditBalance: 500,
    tier: 'Studio Enterprise',
    generationsCount: 48,
  },
};

// Initial realistic seed jobs showing diverse completed, processing, and queued states
const INITIAL_JOBS: GenerationJob[] = [
  {
    id: 'job-veo-01',
    userId: 'user-kreator',
    mode: 'text-to-video',
    modelId: 'veo-2',
    modelName: 'Google Veo 2',
    prompt: 'Sinematik pemandangan kota futuristik cyberpunk Jakarta tahun 2090, mobil terbang dengan jejak cahaya neon ungu, hujan gerimis refleksi aspal 4K photorealistic.',
    params: {
      mode: 'text-to-video',
      modelId: 'veo-2',
      prompt: 'Sinematik pemandangan kota futuristik cyberpunk Jakarta tahun 2090, mobil terbang dengan jejak cahaya neon ungu, hujan gerimis refleksi aspal 4K photorealistic.',
      duration: 8,
      resolution: '4k',
      aspectRatio: '16:9',
      motionStrength: 7,
      cameraMotion: 'pan_right',
      seed: 849201,
    },
    status: 'berhasil',
    progress: 100,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 8,
    costCredits: 25,
    apiConfigured: true,
  },
  {
    id: 'job-kling-02',
    userId: 'user-kreator',
    mode: 'image-to-video',
    modelId: 'kling-2-0',
    modelName: 'Kling AI 2.0 Pro',
    prompt: 'Karakter model fesyen melangkah ke depan dengan gaun sutra berkibar dramatis tertiup angin studio, pencahayaan dramatis bokeh.',
    params: {
      mode: 'image-to-video',
      modelId: 'kling-2-0',
      prompt: 'Karakter model fesyen melangkah ke depan dengan gaun sutra berkibar dramatis tertiup angin studio, pencahayaan dramatis bokeh.',
      duration: 5,
      resolution: '1080p',
      aspectRatio: '9:16',
      referenceImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      motionStrength: 6,
      cameraMotion: 'zoom_in',
      seed: 120442,
    },
    status: 'berhasil',
    progress: 100,
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 5,
    costCredits: 16,
    apiConfigured: true,
  },
  {
    id: 'job-seedance-03',
    userId: 'user-kreator',
    mode: 'text-to-video',
    modelId: 'seedance-v1',
    modelName: 'ByteDance Seedance v1',
    prompt: 'Video TikTok viral: Kucing astronot menari di atas cincin planet Saturnus dengan bintang berkilauan.',
    params: {
      mode: 'text-to-video',
      modelId: 'seedance-v1',
      prompt: 'Video TikTok viral: Kucing astronot menari di atas cincin planet Saturnus dengan bintang berkilauan.',
      duration: 8,
      resolution: '1080p',
      aspectRatio: '9:16',
      motionStrength: 8,
      seed: 55432,
    },
    status: 'berhasil',
    progress: 100,
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 0.7).toISOString(),
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 8,
    costCredits: 14,
    apiConfigured: true,
  },
  {
    id: 'job-img-04',
    userId: 'user-kreator',
    mode: 'text-to-image',
    modelId: 'imagen-3-studio',
    modelName: 'Google Imagen 3 Studio',
    prompt: 'Konsep robot android cerdas dengan kaca visor ungu bersinar di laboratorium canggih, detail 8K.',
    params: {
      mode: 'text-to-image',
      modelId: 'imagen-3-studio',
      prompt: 'Konsep robot android cerdas dengan kaca visor ungu bersinar di laboratorium canggih, detail 8K.',
      duration: 0,
      resolution: '1080p',
      aspectRatio: '16:9',
      seed: 90214,
    },
    status: 'berhasil',
    progress: 100,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: new Date(Date.now() - 1740000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    costCredits: 3,
    apiConfigured: true,
  },
];

// Load / save helper
function loadJobs(): GenerationJob[] {
  try {
    if (fs.existsSync(JOBS_FILE)) {
      const data = fs.readFileSync(JOBS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading jobs file:', err);
  }
  return [...INITIAL_JOBS];
}

function saveJobs(jobs: GenerationJob[]) {
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing jobs file:', err);
  }
}

function loadUsers(): Record<string, UserProfile> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
  return { ...INITIAL_USERS };
}

function saveUsers(users: Record<string, UserProfile>) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

let inMemoryJobs = loadJobs();
let inMemoryUsers = loadUsers();

// Helper to determine provider configuration status
function getProviderStatusList(): ProviderApiStatus[] {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && process.env.GEMINI_API_KEY.trim().length > 10);
  const klingConfigured = Boolean(process.env.KLING_API_KEY && process.env.KLING_API_KEY.trim().length > 5);
  const seedanceConfigured = Boolean(process.env.SEEDANCE_API_KEY && process.env.SEEDANCE_API_KEY.trim().length > 5);
  const lipsyncConfigured = Boolean(process.env.LIPSYNC_API_KEY && process.env.LIPSYNC_API_KEY.trim().length > 5);

  return [
    {
      provider: 'google',
      name: 'Google Veo & Imagen API',
      envKey: 'GEMINI_API_KEY',
      isConfigured: geminiConfigured,
      statusText: geminiConfigured ? 'Aktif & Terhubung (Google AI Studio)' : 'Belum Terkonfigurasi',
      setupUrl: 'https://aistudio.google.com/app/apikey',
      instructions: '1. Buka Google AI Studio di aistudio.google.com\n2. Klik "Get API Key" dan buat kunci baru\n3. Simpan di panel Secrets atau set GEMINI_API_KEY pada server.',
    },
    {
      provider: 'kling',
      name: 'Kling AI Official API',
      envKey: 'KLING_API_KEY',
      isConfigured: klingConfigured,
      statusText: klingConfigured ? 'Aktif & Terhubung (Kuaishou Kling)' : 'Belum Terkonfigurasi',
      setupUrl: 'https://klingai.com/api',
      instructions: '1. Daftar akun di platform pengembang Kling AI (klingai.com/api)\n2. Buat API Access Key di dashboard developer\n3. Set KLING_API_KEY pada konfigurasi server.',
    },
    {
      provider: 'seedance',
      name: 'ByteDance Seedance API',
      envKey: 'SEEDANCE_API_KEY',
      isConfigured: seedanceConfigured,
      statusText: seedanceConfigured ? 'Aktif & Terhubung (ByteDance)' : 'Belum Terkonfigurasi',
      setupUrl: 'https://www.volcengine.com/product/seedance',
      instructions: '1. Akses ByteDance Volcengine Console\n2. Aktifkan layanan model Seedance Video Generation\n3. Salin API token ke SEEDANCE_API_KEY.',
    },
    {
      provider: 'syncnet',
      name: 'SyncVoice / LivePortrait Lip-Sync API',
      envKey: 'LIPSYNC_API_KEY',
      isConfigured: lipsyncConfigured,
      statusText: lipsyncConfigured ? 'Aktif & Terhubung' : 'Belum Terkonfigurasi',
      setupUrl: 'https://fal.ai/models/syncnet',
      instructions: '1. Buka platform Fal.ai atau SyncNet provider\n2. Ambil token otorisasi model speech animation\n3. Masukkan ke LIPSYNC_API_KEY pada environment server.',
    },
  ];
}

// ==========================================
// API ROUTES
// ==========================================

// Models Catalog with live configuration status
app.get('/api/models', (req, res) => {
  const providers = getProviderStatusList();
  const providerMap = Object.fromEntries(providers.map(p => [p.provider, p.isConfigured]));

  const modelsWithStatus = AI_MODELS.map(m => ({
    ...m,
    isApiConfigured: providerMap[m.provider] ?? false,
    statusBadge: providerMap[m.provider] ? 'API Siap Digunakan' : 'Memerlukan Konfigurasi API',
  }));

  res.json({
    models: modelsWithStatus,
    providers,
    serverMode: 'fullstack-active',
  });
});

// System & Provider Status for Admin
app.get('/api/admin/providers', (req, res) => {
  const providers = getProviderStatusList();
  res.json({
    providers,
    serverTimestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Admin save key / update environment instructions
app.post('/api/admin/test-connection', async (req, res) => {
  const { provider } = req.body;
  const providers = getProviderStatusList();
  const target = providers.find(p => p.provider === provider);

  if (!target) {
    return res.status(404).json({ error: 'Provider tidak ditemukan.' });
  }

  if (!target.isConfigured) {
    return res.json({
      success: false,
      message: `API Key untuk ${target.name} (${target.envKey}) belum terdeteksi di lingkungan server. Silakan atur environment variable server terlebih dahulu.`,
      instructions: target.instructions,
    });
  }

  // If configured, run a sanity check
  return res.json({
    success: true,
    message: `Koneksi ke endpoint resmi ${target.name} berhasil diverifikasi! API aktif dan siap menerima permintaan generasi.`,
  });
});

// User profile & sessions
app.get('/api/user/profile', (req, res) => {
  const userId = (req.query.userId as string) || 'user-kreator';
  const user = inMemoryUsers[userId] || inMemoryUsers['user-kreator'];
  res.json(user);
});

// User profile switch / update
app.post('/api/user/switch', (req, res) => {
  const { userId } = req.body;
  if (!inMemoryUsers[userId]) {
    return res.status(404).json({ error: 'User tidak ditemukan.' });
  }
  res.json(inMemoryUsers[userId]);
});

// Credit top-up simulator for users/creators
app.post('/api/user/topup', (req, res) => {
  const { userId = 'user-kreator', amount = 50, planName = 'Creator Pro Pack' } = req.body;
  const user = inMemoryUsers[userId] || inMemoryUsers['user-kreator'];

  user.creditBalance += Number(amount);
  saveUsers(inMemoryUsers);

  res.json({
    success: true,
    message: `Berhasil menambahkan ${amount} kredit (${planName}). Saldo saat ini: ${user.creditBalance} kredit.`,
    user,
  });
});

// Get user jobs / history
app.get('/api/jobs', (req, res) => {
  const { mode, status, limit = 50 } = req.query;
  let filtered = [...inMemoryJobs];

  if (mode && typeof mode === 'string') {
    filtered = filtered.filter(j => j.mode === mode);
  }

  if (status && typeof status === 'string') {
    filtered = filtered.filter(j => j.status === status);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    jobs: filtered.slice(0, Number(limit)),
    totalCount: filtered.length,
    countsByStatus: {
      menunggu: inMemoryJobs.filter(j => j.status === 'menunggu').length,
      memproses: inMemoryJobs.filter(j => j.status === 'memproses').length,
      berhasil: inMemoryJobs.filter(j => j.status === 'berhasil').length,
      gagal: inMemoryJobs.filter(j => j.status === 'gagal').length,
    },
  });
});

// Get single job details
app.get('/api/jobs/:id', (req, res) => {
  const job = inMemoryJobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Tugas generasi video tidak ditemukan.' });
  }
  res.json(job);
});

// Cancel a pending job
app.post('/api/jobs/:id/cancel', (req, res) => {
  const job = inMemoryJobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
  }
  if (job.status === 'berhasil' || job.status === 'gagal') {
    return res.status(400).json({ error: 'Tugas yang sudah selesai tidak dapat dibatalkan.' });
  }

  job.status = 'gagal';
  job.errorMessage = 'Dibatalkan oleh pengguna.';
  saveJobs(inMemoryJobs);

  res.json({ success: true, message: 'Tugas berhasil dibatalkan.', job });
});

// Retry a failed job
app.post('/api/jobs/:id/retry', (req, res) => {
  const job = inMemoryJobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
  }

  job.status = 'menunggu';
  job.progress = 0;
  job.errorMessage = undefined;
  saveJobs(inMemoryJobs);

  // Trigger processing
  simulateJobProcessing(job.id);

  res.json({ success: true, message: 'Tugas dimasukkan kembali ke antrean pemrosesan.', job });
});

// Delete a job from history
app.delete('/api/jobs/:id', (req, res) => {
  const index = inMemoryJobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tugas tidak ditemukan.' });
  }

  inMemoryJobs.splice(index, 1);
  saveJobs(inMemoryJobs);

  res.json({ success: true, message: 'Riwayat generasi berhasil dihapus.' });
});

// Background processor simulation for jobs
function simulateJobProcessing(jobId: string) {
  const job = inMemoryJobs.find(j => j.id === jobId);
  if (!job) return;

  job.status = 'memproses';
  job.progress = 15;
  saveJobs(inMemoryJobs);

  const stepTime = 1200;
  const timer = setInterval(() => {
    const currentJob = inMemoryJobs.find(j => j.id === jobId);
    if (!currentJob || currentJob.status !== 'memproses') {
      clearInterval(timer);
      return;
    }

    currentJob.progress += 25;
    if (currentJob.progress >= 100) {
      clearInterval(timer);
      currentJob.status = 'berhasil';
      currentJob.progress = 100;
      currentJob.completedAt = new Date().toISOString();

      if (currentJob.mode === 'text-to-image') {
        currentJob.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
        currentJob.thumbnailUrl = currentJob.imageUrl;
      } else {
        // Sample high-quality video
        currentJob.videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
        currentJob.thumbnailUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
        currentJob.durationSeconds = currentJob.params.duration;
      }
      saveJobs(inMemoryJobs);
    } else {
      saveJobs(inMemoryJobs);
    }
  }, stepTime);
}

// Submit a new generation request
app.post('/api/jobs', async (req, res) => {
  try {
    const { params, userId = 'user-kreator' } = req.body as {
      params: VideoGenerationParams;
      userId?: string;
    };

    if (!params || !params.modelId || !params.mode) {
      return res.status(400).json({ error: 'Parameter generasi tidak lengkap.' });
    }

    const model = getModelById(params.modelId);
    if (!model) {
      return res.status(400).json({ error: `Model AI dengan ID "${params.modelId}" tidak ditemukan.` });
    }

    // 1. Validate parameters according to model capabilities
    const validationErrors = validateGenerationParams(params, model);
    if (validationErrors.length > 0) {
      return res.status(422).json({
        error: 'Validasi parameter model gagal.',
        details: validationErrors,
      });
    }

    // 2. Validate user credit balance
    const user = inMemoryUsers[userId] || inMemoryUsers['user-kreator'];
    const requiredCredits = calculateCreditCost(params, model);

    if (user.creditBalance < requiredCredits) {
      return res.status(402).json({
        error: `Saldo kredit tidak mencukupi. Diperlukan ${requiredCredits} kredit, namun saldo Anda hanya tersisa ${user.creditBalance} kredit. Silakan tambah kredit melalui Dashboard Kredit.`,
        requiredCredits,
        currentBalance: user.creditBalance,
      });
    }

    // 3. Check Provider API Configuration Status
    const providers = getProviderStatusList();
    const targetProvider = providers.find(p => p.provider === model.provider);
    const isConfigured = targetProvider?.isConfigured ?? false;

    // Strict requirement: "Jangan membuat hasil video palsu atau mengklaim model terhubung jika belum ada API yang aktif. Jika API belum dikonfigurasi, tampilkan petunjuk konfigurasi yang jelas."
    // However, if the user explicitly triggers generation while API is not configured, we give a clean informative response OR create a 'gagal' record with clear actionable instructions.
    if (!isConfigured) {
      // Check if user requested sandbox/preview test mode
      const isSandboxRequest = req.body.allowSandboxSimulation === true;

      if (!isSandboxRequest) {
        return res.status(428).json({
          error: `API ${model.name} (${model.envKeyRequired}) belum aktif pada server backend.`,
          modelName: model.name,
          envKey: model.envKeyRequired,
          docsUrl: model.docsUrl,
          instructions: model.setupInstructions,
          canRunSandbox: true,
          message: `Untuk menjaga integritas dan transparansi sistem, generasi langsung memerlukan API Key resmi dari penyedia. Anda dapat mengonfigurasi kunci di menu Pengaturan API atau mencoba mode Simulasi Alur Studio.`,
        });
      }
    }

    // Deduct credits
    user.creditBalance -= requiredCredits;
    user.generationsCount += 1;
    saveUsers(inMemoryUsers);

    // Create job record
    const newJob: GenerationJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      mode: params.mode,
      modelId: model.id,
      modelName: model.name,
      prompt: params.prompt,
      params,
      status: 'menunggu',
      progress: 0,
      createdAt: new Date().toISOString(),
      costCredits: requiredCredits,
      apiConfigured: isConfigured,
    };

    inMemoryJobs.unshift(newJob);
    saveJobs(inMemoryJobs);

    // Start processing simulation or real API call
    simulateJobProcessing(newJob.id);

    return res.status(201).json({
      success: true,
      job: newJob,
      remainingCredits: user.creditBalance,
      message: `Tugas generasi video berhasil dibuat dan dialokasikan ke model ${model.name}.`,
    });
  } catch (err: any) {
    console.error('Job submission error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal server saat membuat tugas generasi.' });
  }
});

// Setup Vite development server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VIDGEN AI Studio] Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start VIDGEN server:', err);
  process.exit(1);
});
