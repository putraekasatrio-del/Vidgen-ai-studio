import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Download, 
  Copy, 
  Share2, 
  Filter, 
  Search, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { GenerationJob, JobStatus } from '../shared/types.ts';

interface GenerationHistoryProps {
  jobs: GenerationJob[];
  onOpenVideoPlayer: (job: GenerationJob) => void;
  onRetryJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onSendToStudio: (job: GenerationJob) => void;
  countsByStatus: {
    menunggu: number;
    memproses: number;
    berhasil: number;
    gagal: number;
  };
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  jobs,
  onOpenVideoPlayer,
  onRetryJob,
  onCancelJob,
  onDeleteJob,
  onSendToStudio,
  countsByStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    if (filterStatus !== 'all' && job.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        job.prompt.toLowerCase().includes(q) ||
        job.modelName.toLowerCase().includes(q) ||
        job.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyPrompt = (job: GenerationJob) => {
    navigator.clipboard.writeText(job.prompt);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: JobStatus, progress: number) => {
    switch (status) {
      case 'menunggu':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-700/50">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Menunggu Antrean</span>
          </span>
        );
      case 'memproses':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/90 text-purple-300 border border-purple-600/60 shadow-sm shadow-purple-900/50">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Memproses ({progress}%)</span>
          </span>
        );
      case 'berhasil':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="w-3 h-3" />
            <span>Berhasil</span>
          </span>
        );
      case 'gagal':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/50">
            <AlertCircle className="w-3 h-3" />
            <span>Gagal</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <Film className="w-6 h-6 text-purple-400" />
            <span>Riwayat Generasi Video & Aset</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Daftar seluruh tugas generasi video dengan status real-time, metadata, dan pratinjau putar.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari prompt atau model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/90 border border-purple-900/40 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Filter Tabs by Status with Count Badges */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'all'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
              : 'bg-neutral-900 text-gray-400 hover:text-white border border-purple-900/30'
          }`}
        >
          Semua ({jobs.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('berhasil')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterStatus === 'berhasil'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-neutral-900 text-emerald-400/90 hover:text-emerald-300 border border-emerald-900/30'
          }`}
        >
          <span>Berhasil ({countsByStatus.berhasil})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('memproses')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterStatus === 'memproses'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-neutral-900 text-purple-400/90 hover:text-purple-300 border border-purple-900/30'
          }`}
        >
          <span>Memproses ({countsByStatus.memproses})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('menunggu')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterStatus === 'menunggu'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-neutral-900 text-blue-400/90 hover:text-blue-300 border border-blue-900/30'
          }`}
        >
          <span>Menunggu ({countsByStatus.menunggu})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterStatus('gagal')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterStatus === 'gagal'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-neutral-900 text-rose-400/90 hover:text-rose-300 border border-rose-900/30'
          }`}
        >
          <span>Gagal ({countsByStatus.gagal})</span>
        </button>
      </div>

      {/* History Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-neutral-900/40 border border-purple-900/30 rounded-2xl p-12 text-center space-y-3">
          <Film className="w-12 h-12 text-purple-400/40 mx-auto" />
          <h3 className="text-base font-bold text-gray-200">Belum Ada Video pada Kategori Ini</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Gunakan tab Studio Generator untuk mulai memproduksi video AI perdana Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const isCompleted = job.status === 'berhasil';
            const isProcessing = job.status === 'memproses';
            const isFailed = job.status === 'gagal';

            return (
              <div
                key={job.id}
                className="bg-neutral-900/70 border border-purple-900/30 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-purple-600/50 transition-all shadow-lg hover:shadow-purple-900/20 group"
              >
                <div>
                  
                  {/* Thumbnail / Media Surface */}
                  <div className="relative aspect-video bg-black/60 overflow-hidden flex items-center justify-center">
                    {job.thumbnailUrl || job.imageUrl ? (
                      <img
                        src={job.thumbnailUrl || job.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Film className="w-10 h-10 text-purple-500/40 mx-auto mb-1 animate-pulse" />
                        <span className="text-[11px] text-gray-500">Memproses render adegan...</span>
                      </div>
                    )}

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Status Badge in Top Left */}
                    <div className="absolute top-2.5 left-2.5">
                      {getStatusBadge(job.status, job.progress)}
                    </div>

                    {/* Top Right Specs (Resolution & Aspect) */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-purple-200 border border-purple-800/40 uppercase">
                        {job.params.resolution}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-gray-300 border border-gray-700/40">
                        {job.params.aspectRatio}
                      </span>
                    </div>

                    {/* Center Play Button if Completed Video */}
                    {isCompleted && (job.videoUrl || job.imageUrl) && (
                      <button
                        type="button"
                        onClick={() => onOpenVideoPlayer(job)}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-900/60 hover:scale-110 active:scale-95 transition-all group-hover:bg-purple-500"
                      >
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </button>
                    )}

                    {/* Processing Progress Bar */}
                    {isProcessing && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Duration badge */}
                    {job.params.duration > 0 && (
                      <div className="absolute bottom-2.5 right-2.5 text-[10px] font-semibold bg-black/80 text-white px-2 py-0.5 rounded">
                        {job.params.duration} Detik
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    
                    {/* Model & Date row */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-semibold text-purple-300">{job.modelName}</span>
                      <span>{new Date(job.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Prompt text */}
                    <p className="text-xs text-gray-200 line-clamp-3 leading-relaxed font-normal">
                      "{job.prompt}"
                    </p>

                    {/* Error message if failed */}
                    {isFailed && job.errorMessage && (
                      <div className="p-2.5 bg-rose-950/50 border border-rose-800/40 rounded-xl text-[11px] text-rose-300 flex items-start space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{job.errorMessage}</span>
                      </div>
                    )}

                  </div>

                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-neutral-950/60 border-t border-purple-900/30 flex items-center justify-between gap-1">
                  
                  {/* Left Action: Open video or Re-run prompt */}
                  <div className="flex items-center space-x-1">
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => onOpenVideoPlayer(job)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Putar</span>
                      </button>
                    )}

                    {isFailed && (
                      <button
                        type="button"
                        onClick={() => onRetryJob(job.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Coba Lagi</span>
                      </button>
                    )}

                    {job.status === 'menunggu' && (
                      <button
                        type="button"
                        onClick={() => onCancelJob(job.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 text-gray-400 hover:text-white text-xs font-medium"
                      >
                        Batal
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSendToStudio(job)}
                      title="Gunakan prompt ini di Studio"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-purple-900/30 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right Actions: Copy, Delete */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(job)}
                      title="Salin Prompt"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-purple-900/30 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteJob(job.id)}
                      title="Hapus dari Riwayat"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
