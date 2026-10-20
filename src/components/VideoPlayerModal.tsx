import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  Download, 
  Copy, 
  Sparkles, 
  Film, 
  Layers, 
  Coins, 
  Info,
  Check
} from 'lucide-react';
import type { GenerationJob } from '../shared/types.ts';

interface VideoPlayerModalProps {
  job: GenerationJob | null;
  onClose: () => void;
  onSendToImageToVideo?: (imageUrl: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  job,
  onClose,
  onSendToImageToVideo,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
  }, [job]);

  if (!job) return null;

  const isVideo = Boolean(job.videoUrl);
  const mediaUrl = job.videoUrl || job.imageUrl || job.thumbnailUrl;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(job.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0e091d] border border-purple-800/50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-purple-900/40 bg-neutral-950/80">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
              <Film className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Pratinjau Hasil Generasi AI</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                  {job.modelName}
                </span>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (Video Surface + Metadata Drawer) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-0">
          
          {/* Left Column: Media Player */}
          <div className="lg:col-span-2 bg-black flex flex-col justify-center items-center relative group p-2 sm:p-4">
            
            {isVideo ? (
              <div className="relative w-full h-full max-h-[550px] flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={job.videoUrl}
                  autoPlay
                  loop={isLooping}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className={`w-full max-h-[520px] rounded-xl object-contain ${
                    job.params.aspectRatio === '9:16' ? 'max-w-xs' : 'max-w-full'
                  }`}
                />

                {/* Big Center Play/Pause button toggle on click */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-transparent group/btn cursor-pointer"
                >
                  {!isPlaying && (
                    <div className="w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-900/50 group-hover/btn:scale-110 transition-transform">
                      <Play className="w-7 h-7 ml-1 fill-current" />
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full max-h-[520px] flex items-center justify-center p-2">
                <img
                  src={mediaUrl}
                  alt={job.prompt}
                  className="w-full max-h-[520px] rounded-xl object-contain shadow-2xl"
                />
              </div>
            )}

            {/* Video Player Bottom Controls Bar (if Video) */}
            {isVideo && (
              <div className="w-full mt-3 bg-neutral-950/90 border border-purple-900/40 rounded-xl p-2.5 space-y-2">
                
                {/* Progress bar */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-gray-400 font-mono w-9 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 accent-purple-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                  />
                  <span className="text-[10px] text-gray-400 font-mono w-9">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLooping(!isLooping)}
                      title={isLooping ? 'Ulangi Video Aktif' : 'Sekali Putar'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isLooping ? 'text-purple-400 bg-purple-950/70' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Playback speed buttons */}
                  <div className="flex items-center space-x-1 bg-neutral-900 p-0.5 rounded-lg border border-purple-900/30 text-[10px]">
                    {[0.5, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => changeSpeed(spd)}
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          playbackSpeed === spd
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Fullscreen */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Metadata & Action Drawer */}
          <div className="p-4 sm:p-6 bg-neutral-950/40 border-t lg:border-t-0 lg:border-l border-purple-900/40 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Prompt Info */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Prompt Generasi
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-medium"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="p-3 bg-neutral-900/80 rounded-xl border border-purple-900/30 text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
                  "{job.prompt}"
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Parameter Teknis
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-purple-900/30">
                    <p className="text-[10px] text-gray-400">Model Engine</p>
                    <p className="font-bold text-white mt-0.5">{job.modelName}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-purple-900/30">
                    <p className="text-[10px] text-gray-400">Resolusi Output</p>
                    <p className="font-bold text-purple-300 uppercase mt-0.5">{job.params.resolution}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-purple-900/30">
                    <p className="text-[10px] text-gray-400">Aspek Rasio</p>
                    <p className="font-bold text-white mt-0.5">{job.params.aspectRatio}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-purple-900/30">
                    <p className="text-[10px] text-gray-400">Durasi Video</p>
                    <p className="font-bold text-white mt-0.5">
                      {job.params.duration > 0 ? `${job.params.duration} Detik` : 'Gambar Diam'}
                    </p>
                  </div>

                  {job.params.seed !== undefined && (
                    <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-purple-900/30">
                      <p className="text-[10px] text-gray-400">Seed</p>
                      <p className="font-mono text-purple-300 font-bold mt-0.5">{job.params.seed}</p>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-purple-900/30">
                    <p className="text-[10px] text-gray-400">Biaya Kredit</p>
                    <p className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {job.costCredits} Kredit
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Download & Workflow buttons */}
            <div className="space-y-2 pt-4 border-t border-purple-900/40">
              
              {/* If Image, option to transform to video */}
              {!isVideo && onSendToImageToVideo && mediaUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onSendToImageToVideo(mediaUrl);
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/40 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Jadikan Video AI (Image-to-Video)</span>
                </button>
              )}

              {/* Download File */}
              {mediaUrl && (
                <a
                  href={mediaUrl}
                  download={`VIDGEN-${job.id}.${isVideo ? 'mp4' : 'jpg'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-200 hover:text-white font-bold text-xs flex items-center justify-center space-x-2 border border-purple-900/40 transition-colors"
                >
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Unduh File ({isVideo ? 'MP4 HD' : 'Gambar JPEG'})</span>
                </a>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
