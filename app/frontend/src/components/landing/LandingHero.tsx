import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { LandingHeader } from './LandingHeader';
import { RepositoryUrlInput } from './RepositoryUrlInput';
import { DashboardPreviewCard } from './DashboardPreviewCard';

interface LandingHeroProps {
  onAnalyze: (url: string) => Promise<any>;
  isAnalyzing: boolean;
  error: string | null;
  onClearError: () => void;
  onExploreDashboard: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onAnalyze,
  isAnalyzing,
  error,
  onClearError,
  onExploreDashboard
}) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between z-10">
      {/* Minimal Top Header */}
      <LandingHeader onOpenDashboard={onExploreDashboard} />

      {/* Main Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-6 pt-8 pb-8 flex flex-col items-center text-center">
        {/* Subtle Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-slate-200/80 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              GitHub Repository Data Science Project
            </span>
          </div>
        </motion.div>

        {/* Large Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 display-title max-w-4xl"
        >
          Explore GitHub. <br className="hidden sm:inline" />
          Discover Which Technologies Lead in Popularity.
        </motion.h1>

        {/* Research Project Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 max-w-2xl space-y-2 text-slate-600 font-normal leading-relaxed text-sm sm:text-base"
        >
          <p>
            We analyzed 2,520 public GitHub repositories across 10 programming-language ecosystems to uncover patterns in technology popularity and repository engagement.
          </p>
          <p className="text-xs sm:text-sm font-medium text-teal-800">
            Which programming languages are popular? Which languages have more popular repositories?
          </p>
        </motion.div>

        {/* Primary Repository URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full mt-8"
        >
          <RepositoryUrlInput
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
            error={error}
            onClearError={onClearError}
          />
        </motion.div>

        {/* Dashboard Preview Card (Spatial Motion Anchor) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full mt-12"
        >
          <DashboardPreviewCard onExpand={onExploreDashboard} />
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/50">
        <div className="flex items-center gap-2 font-medium">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>GitAI • GitHub Repository Data Science Platform</span>
        </div>
        <div className="flex items-center gap-4 font-medium">
          <span>2,520 Repositories Analyzed</span>
          <span>10 Language Ecosystems</span>
        </div>
      </footer>
    </div>
  );
};
