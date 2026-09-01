import {
  Lightbulb,
  GitFork,
  Tags,
  FileCode,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { MetricBadge } from '../../ui/MetricBadge';
import type { InsightFinding } from '../../../hooks/useGitAI';

interface DataInsightsTabProps {
  insights: InsightFinding[];
}

export const DataInsightsTab: React.FC<DataInsightsTabProps> = ({ insights }) => {
  const getIcon = (title: string) => {
    if (title.includes('Forks')) return <GitFork className="w-5 h-5 text-teal-600" />;
    if (title.includes('Topic') || title.includes('Metadata')) return <Tags className="w-5 h-5 text-emerald-600" />;
    if (title.includes('Issue') || title.includes('Scale')) return <TrendingUp className="w-5 h-5 text-cyan-600" />;
    if (title.includes('Description') || title.includes('Documentation')) return <FileCode className="w-5 h-5 text-amber-600" />;
    return <ShieldCheck className="w-5 h-5 text-teal-600" />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 display-title">
              Key Empirical Data Insights
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Top statistical findings derived from exploratory data analysis of 2,520 GitHub repositories across 10 language ecosystems.
            </p>
          </div>
          <MetricBadge label="5 Verified Dataset Insights" variant="teal" />
        </div>
      </div>

      {/* 5 Findings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {insights.map((insight, idx) => (
          <GlassCard key={idx} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                  {getIcon(insight.title)}
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80">
                  Insight #{idx + 1}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-3.5 leading-snug">
                {insight.title}
              </h3>

              {/* Big Stat Pill */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-3xl font-bold text-slate-900 tabular-nums">
                  {insight.stat}
                </div>
                <span className="text-xs text-teal-700 font-semibold mt-0.5 block">
                  Statistical Finding
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mt-3.5 leading-relaxed font-normal">
                {insight.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Dataset Ground Truth</span>
              <span className="text-teal-700 font-semibold">EDA Verified</span>
            </div>
          </GlassCard>
        ))}

        {/* Synthesis Card */}
        <div className="rounded-2xl bg-gradient-to-br from-teal-50/90 via-emerald-50/80 to-white/90 border border-teal-200 p-6 flex flex-col justify-between shadow-[0_4px_20px_-2px_rgba(20,184,166,0.1)]">
          <div>
            <div className="p-2 rounded-xl bg-teal-100/70 text-teal-800 w-fit">
              <Lightbulb className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-3.5 leading-snug">
              Strategic Takeaway for Maintainers
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 mt-3.5 leading-relaxed font-normal">
              Achieving high repository popularity requires both active usage (fork volume) and discoverability (rich topic tags). Repositories combining active maintenance with structured topic tags experience up to a <strong>9.9x popularity multiplier</strong>.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-teal-200/60 text-xs font-semibold text-teal-900">
            GitAI Dataset Analytics Summary
          </div>
        </div>
      </div>
    </div>
  );
};
