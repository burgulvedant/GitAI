import { motion } from 'motion/react';
import { ArrowUpRight, Activity, TrendingUp, BarChart2, Compass } from 'lucide-react';

interface DashboardPreviewCardProps {
  onExpand: () => void;
}

export const DashboardPreviewCard: React.FC<DashboardPreviewCardProps> = ({ onExpand }) => {
  return (
    <motion.div
      layoutId="gitai-dashboard-frame"
      onClick={onExpand}
      className="w-full max-w-5xl mx-auto rounded-[32px] bg-[#F8FAFC]/95 backdrop-blur-2xl border border-white/80 p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.14)] cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_70px_-10px_rgba(20,184,166,0.18)] hover:-translate-y-0.5"
      transition={{
        type: 'spring',
        damping: 24,
        stiffness: 260,
        mass: 0.8
      }}
    >
      {/* Floating Action Pill */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs group-hover:scale-105 transition-transform">
          <span>Open Dashboard</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>

      {/* Internal Workspace Shell Glimpse */}
      <div className="space-y-4 opacity-95 group-hover:opacity-100 transition-opacity">
        {/* Top Header Row Matching Shell Nav */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">GitAI</span>
          </div>

          {/* 5 Nav Pills Glimpse */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60 text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white shadow-xs">Technology Trends</span>
            <span className="px-2.5 py-1 text-slate-600">Analyze</span>
            <span className="px-2.5 py-1 text-slate-600">Model Benchmark</span>
            <span className="px-2.5 py-1 text-slate-600">Insights</span>
            <span className="px-2.5 py-1 text-slate-600">Goals</span>
          </div>

          <div className="w-28 hidden md:block" />
        </div>

        {/* Subheader Glimpse */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Technology & Programming Language Trends</h3>
            <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200">10 Language Ecosystems</span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200">2,520 Repositories</span>
          </div>
        </div>

        {/* 3-Column Bento Cards Glimpse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-2">
          {/* Card 1 */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">Language Popularity Patterns</span>
            <div className="text-2xl font-bold text-slate-900 pt-1 tabular-nums">Mean vs. Median</div>
            <p className="text-xs text-slate-500 pt-0.5">Empirical Stars Distribution Across 10 Languages</p>
            <div className="pt-3 flex items-center gap-1.5 text-xs font-semibold text-teal-700">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Skewed Power-Law Dynamics</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold">Repository Dataset Baseline</span>
            <div className="text-2xl font-bold text-slate-900 pt-1 tabular-nums">2,520 Repos</div>
            <p className="text-xs text-slate-500 pt-0.5">252 Repositories per Language Ecosystem</p>
            <div className="pt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Stratified Cross-Sectional Sample</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-50 via-emerald-50 to-white border border-teal-200 p-4 shadow-xs">
            <span className="text-xs text-teal-800 font-semibold">Empirical Finding #1</span>
            <div className="text-2xl font-bold text-slate-900 pt-1 tabular-nums">9.9x</div>
            <p className="text-xs text-slate-700 pt-0.5">Median Stars with Structured Topic Tags</p>
            <div className="pt-3 text-[11px] font-semibold text-teal-800">
              Topic Tags & Discoverability Impact
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
