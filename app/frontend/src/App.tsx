import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { SilkCascadeBackground } from './components/background/SilkCascadeBackground';
import { LandingHero } from './components/landing/LandingHero';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import type { DashboardTab } from './components/dashboard/NavigationBar';
import { useGitAI } from './hooks/useGitAI';

export function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<DashboardTab>('trends');

  const {
    analysisData,
    isAnalyzing,
    analysisError,
    setAnalysisError,
    datasetSummary,
    modelBenchmarks,
    insights,
    analyzeRepository
  } = useGitAI();

  const handleAnalyzeFromLanding = async (url: string) => {
    try {
      await analyzeRepository(url);
      setActiveTab('analyze');
      setViewMode('dashboard');
    } catch {
      // Handled in hook state
    }
  };

  const handleExploreDashboard = () => {
    setActiveTab('trends');
    setViewMode('dashboard');
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
  };

  return (
    <div
      className={`relative ${
        viewMode === 'dashboard' ? 'h-screen overflow-hidden' : 'min-h-screen'
      } text-slate-900 selection:bg-teal-500/20 selection:text-teal-900`}
    >
      {/* Exact Live WebGL Silk Cascade Animated Background (Direct Shader Output) */}
      <SilkCascadeBackground />

      {/* Unified Spatial View Coordinator */}
      <AnimatePresence mode="wait">
        {viewMode === 'landing' ? (
          <LandingHero
            key="landing-hero"
            onAnalyze={handleAnalyzeFromLanding}
            isAnalyzing={isAnalyzing}
            error={analysisError}
            onClearError={() => setAnalysisError(null)}
            onExploreDashboard={handleExploreDashboard}
          />
        ) : (
          <DashboardLayout
            key="dashboard-layout"
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onBackToLanding={handleBackToLanding}
            analysisData={analysisData}
            datasetSummary={datasetSummary}
            modelBenchmarks={modelBenchmarks}
            insights={insights}
            onAnalyzeRepo={analyzeRepository}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
