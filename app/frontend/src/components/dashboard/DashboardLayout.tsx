import { motion } from 'motion/react';
import { NavigationBar } from './NavigationBar';
import type { DashboardTab } from './NavigationBar';
import { TechnologyTrendsTab } from './tabs/TechnologyTrendsTab';
import { AnalyzeTab } from './tabs/AnalyzeTab';
import { ModelPerformanceTab } from './tabs/ModelPerformanceTab';
import { DataInsightsTab } from './tabs/DataInsightsTab';
import { GoalsTab } from './tabs/GoalsTab';
import type { AnalysisResponse, DatasetSummary, ModelBenchmarks, InsightFinding } from '../../hooks/useGitAI';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onBackToLanding: () => void;
  analysisData: AnalysisResponse | null;
  datasetSummary: DatasetSummary | null;
  modelBenchmarks: ModelBenchmarks | null;
  insights: InsightFinding[];
  onAnalyzeRepo: (url: string) => Promise<any>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onSelectTab,
  onBackToLanding,
  analysisData,
  datasetSummary,
  modelBenchmarks,
  insights,
  onAnalyzeRepo
}) => {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden">
      {/* FIXED Large White Dashboard Shell (Consistent Height Across All Tabs) */}
      <motion.div
        layoutId="gitai-dashboard-frame"
        className="w-full max-w-7xl h-[88vh] max-h-[920px] min-h-[580px] rounded-[32px] bg-[#F8FAFC]/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_70px_-12px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden text-slate-900"
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 260,
          mass: 0.8
        }}
      >
        {/* Fixed Top Header / Navigation Inside Shell */}
        <div className="shrink-0 px-6 sm:px-8 pt-5 sm:pt-6 pb-4 border-b border-slate-200/80 bg-white/40">
          <NavigationBar
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            onBackToLanding={onBackToLanding}
          />
        </div>

        {/* Internally Scrollable Tab Content Viewport */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 scrollbar-thin">
          {activeTab === 'trends' && (
            <TechnologyTrendsTab datasetSummary={datasetSummary} />
          )}

          {activeTab === 'analyze' && (
            <AnalyzeTab
              analysisData={analysisData}
              onAnalyzeRepo={onAnalyzeRepo}
            />
          )}

          {activeTab === 'models' && (
            <ModelPerformanceTab modelBenchmarks={modelBenchmarks} />
          )}

          {activeTab === 'insights' && (
            <DataInsightsTab insights={insights} />
          )}

          {activeTab === 'goals' && (
            <GoalsTab />
          )}
        </main>
      </motion.div>
    </div>
  );
};
