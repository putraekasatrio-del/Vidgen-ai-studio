import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { PromptStudio } from './components/PromptStudio.tsx';
import { GenerationHistory } from './components/GenerationHistory.tsx';
import { CreditsDashboard } from './components/CreditsDashboard.tsx';
import { AdminApiSettings } from './components/AdminApiSettings.tsx';
import { VideoPlayerModal } from './components/VideoPlayerModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PwaInstallModal } from './components/PwaInstallModal.tsx';
import type { ModelCapability, ProviderApiStatus, UserProfile, GenerationJob } from './shared/types.ts';
import { AI_MODELS } from './shared/models.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('studio');
  const [models, setModels] = useState<ModelCapability[]>(AI_MODELS);
  const [providers, setProviders] = useState<ProviderApiStatus[]>([]);
  const [user, setUser] = useState<UserProfile>({
    id: 'user-kreator',
    name: 'Kreator Studio',
    email: 'kreator@vidgen.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'kreator',
    creditBalance: 120,
    tier: 'Creator Pro',
    generationsCount: 14,
  });

  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [countsByStatus, setCountsByStatus] = useState({
    menunggu: 0,
    memproses: 0,
    berhasil: 0,
    gagal: 0,
  });

  const [selectedJobForModal, setSelectedJobForModal] = useState<GenerationJob | null>(null);
  const [prefilledImageForVideo, setPrefilledImageForVideo] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [pwaModalOpen, setPwaModalOpen] = useState<boolean>(false);

  // Fetch models & provider status from backend
  const fetchModelsAndProviders = useCallback(async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        if (data.models) setModels(data.models);
        if (data.providers) setProviders(data.providers);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) setJobs(data.jobs);
        if (data.countsByStatus) setCountsByStatus(data.countsByStatus);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, []);

  useEffect(() => {
    fetchModelsAndProviders();
    fetchUserProfile();
    fetchJobs();
  }, [fetchModelsAndProviders, fetchUserProfile, fetchJobs]);

  // Polling for active jobs
  useEffect(() => {
    const hasActiveJobs = jobs.some(j => j.status === 'memproses' || j.status === 'menunggu');
    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      fetchJobs();
      fetchUserProfile();
    }, 2500);

    return () => clearInterval(interval);
  }, [jobs, fetchJobs, fetchUserProfile]);

  // Handlers
  const handleJobCreated = (newJob: GenerationJob) => {
    setJobs(prev => [newJob, ...prev]);
    fetchUserProfile();
    // Auto switch to history to see generation in progress
    setActiveTab('history');
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/retry`, { method: 'POST' });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error('Retry error:', err);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleTopupCredits = async (amount: number, planName: string) => {
    try {
      const res = await fetch('/api/user/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount, planName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch (err) {
      console.error('Topup error:', err);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/user/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Switch user error:', err);
    }
  };

  const handleSendToImageToVideo = (imageUrl: string) => {
    setPrefilledImageForVideo(imageUrl);
    setActiveTab('studio');
  };

  const handleSendJobToStudio = (job: GenerationJob) => {
    setActiveTab('studio');
  };

  const pendingCount = countsByStatus.memproses + countsByStatus.menunggu;

  return (
    <div className="min-h-screen bg-[#090514] text-gray-100 flex flex-col selection:bg-purple-600 selection:text-white pb-20 md:pb-8">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        providers={providers}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenInstallModal={() => setPwaModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'studio' && (
          <PromptStudio
            models={models}
            user={user}
            onJobCreated={handleJobCreated}
            onOpenAdminSettings={() => setActiveTab('admin')}
            onOpenVideoPlayer={(job) => setSelectedJobForModal(job)}
            prefilledImageForVideo={prefilledImageForVideo}
            onClearPrefilledImage={() => setPrefilledImageForVideo(null)}
          />
        )}

        {activeTab === 'history' && (
          <GenerationHistory
            jobs={jobs}
            onOpenVideoPlayer={(job) => setSelectedJobForModal(job)}
            onRetryJob={handleRetryJob}
            onCancelJob={handleCancelJob}
            onDeleteJob={handleDeleteJob}
            onSendToStudio={handleSendJobToStudio}
            countsByStatus={countsByStatus}
          />
        )}

        {activeTab === 'credits' && (
          <CreditsDashboard
            user={user}
            models={models}
            onTopupCredits={handleTopupCredits}
            onNavigateToStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminApiSettings
            providers={providers}
            onRefreshStatus={fetchModelsAndProviders}
          />
        )}

      </main>

      {/* Video Player & Inspector Modal */}
      <VideoPlayerModal
        job={selectedJobForModal}
        onClose={() => setSelectedJobForModal(null)}
        onSendToImageToVideo={handleSendToImageToVideo}
      />

      {/* Auth / Role Switcher Modal */}
      <AuthModal
        currentUser={user}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSwitchUser={handleSwitchUser}
      />

      {/* PWA Android Install Modal */}
      <PwaInstallModal
        isOpen={pwaModalOpen}
        onClose={() => setPwaModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (Android & Mobile touch) */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingJobsCount={pendingCount}
      />

    </div>
  );
}
