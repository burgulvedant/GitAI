import {
  BarChart3,
  Star,
  GitFork,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { MetricBadge } from '../../ui/MetricBadge';
import type { AnalysisResponse } from '../../../hooks/useGitAI';

interface RepositoryAnalyticsTabProps {
  analysisData: AnalysisResponse | null;
  onNavigateToExplorer: () => void;
}

export const RepositoryAnalyticsTab: React.FC<RepositoryAnalyticsTabProps> = ({
  analysisData,
  onNavigateToExplorer
}) => {
  if (!analysisData) {
    return (
      <GlassCard className="p-12 text-center max-w-xl mx-auto space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No Repository Selected for Deep Analytics</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Paste a public GitHub repository URL on the landing hero or select any repository from the Repository Explorer to view detailed metric breakdowns and dataset percentiles.
        </p>
        <button
          onClick={onNavigateToExplorer}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all"
        >
          Open Repository Explorer
        </button>
      </GlassCard>
    );
  }

  const { repository: repo, engineered_metrics: metrics, percentile_benchmarks: percentiles } = analysisData;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 display-title">
              {repo.full_name}
            </h2>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-teal-600 p-1"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            {repo.description || 'No description provided.'}
          </p>
        </div>
        <MetricBadge label={repo.language} variant="teal" />
      </div>

      {/* Percentiles Benchmarking Grid */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Cross-Sectional Dataset Percentile Benchmarks (N = 2,520)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                Stars Percentile
              </span>
              <span className="font-bold text-amber-800 tabular-nums">{percentiles.stars_percentile}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentiles.stars_percentile}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5 block">
              Higher than {percentiles.stars_percentile}% of analyzed repos
            </span>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <GitFork className="w-3.5 h-3.5 text-teal-600" />
                Forks Percentile
              </span>
              <span className="font-bold text-teal-800 tabular-nums">{percentiles.forks_percentile}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${percentiles.forks_percentile}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5 block">
              Higher than {percentiles.forks_percentile}% of analyzed repos
            </span>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-600" />
                Open Issues Percentile
              </span>
              <span className="font-bold text-cyan-800 tabular-nums">{percentiles.issues_percentile}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${percentiles.issues_percentile}%` }} />
            </div>
            <span className="text-[11px] text-slate-500 mt-1.5 block">
              Higher than {percentiles.issues_percentile}% of analyzed repos
            </span>
          </GlassCard>
        </div>
      </div>

      {/* Feature Engineering Breakdown Grid */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium">Feature Engineering Verification</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Exact ML Features Input Vector</h3>
          </div>
          <MetricBadge label="Phase 5B/5C Verified" variant="emerald" size="sm" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium block">log_forks [log1p]</span>
            <div className="text-lg font-bold text-teal-800 tabular-nums mt-0.5">{metrics.log_forks}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium block">log_open_issues [log1p]</span>
            <div className="text-lg font-bold text-cyan-800 tabular-nums mt-0.5">{metrics.log_open_issues}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium block">repo_age_years</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{metrics.repo_age_years} yrs</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium block">days_since_last_push</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{metrics.days_since_last_push.toFixed(0)}d</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium block">forks_per_year [exact]</span>
            <div className="text-lg font-bold text-emerald-800 tabular-nums mt-0.5">{metrics.forks_per_year.toFixed(1)}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium block">issues_per_year [exact]</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{metrics.issues_per_year.toFixed(1)}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium block">topic_count / has_topics</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {metrics.topic_count} ({metrics.has_topics ? 'Yes' : 'No'})
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium block">has_license / length</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
              {metrics.has_license ? 'Licensed' : 'None'} ({metrics.description_length} chars)
            </div>
          </div>
        </div>

        {/* Assigned Topic Tags */}
        <div className="mt-5 pt-4 border-t border-slate-200/70">
          <span className="text-xs font-semibold text-slate-600 block mb-2">
            Repository Topic Tags ({repo.topics.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.length === 0 ? (
              <span className="text-xs text-slate-500">No topic tags assigned</span>
            ) : (
              repo.topics.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-xs rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-medium"
                >
                  #{t}
                </span>
              ))
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
