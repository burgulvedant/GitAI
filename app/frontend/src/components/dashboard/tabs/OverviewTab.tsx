import { useState } from 'react';
import {
  Sparkles,
  GitFork,
  Star,
  AlertCircle,
  Clock,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Link2,
  Layers
} from 'lucide-react';
import type { AnalysisResponse, DatasetSummary, InsightFinding } from '../../../hooks/useGitAI';

interface OverviewTabProps {
  analysisData: AnalysisResponse | null;
  datasetSummary: DatasetSummary | null;
  insights: InsightFinding[];
  onNavigateToTab: (tab: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  analysisData,
  datasetSummary,
  insights,
  onNavigateToTab
}) => {
  const [insightIndex, setInsightIndex] = useState(0);

  const repo = analysisData?.repository;
  const metrics = analysisData?.engineered_metrics;
  const prediction = analysisData?.prediction;

  const currentInsight = insights[insightIndex] || {
    title: 'Topic Tags & Repository Discoverability',
    stat: '9.9x',
    description: 'Repositories with structured topic tags demonstrate a median of 1,985 stars compared to 200 stars for untagged repositories across the dataset.'
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subheader Matching Reference Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Page Title with Link Icon */}
        <div className="flex items-center gap-2.5">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 display-title">
            {repo ? repo.name : 'Overview'}
          </h2>
          {repo ? (
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 transition-colors shadow-2xs"
              title="Open on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Link2 className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Right: Date / Filter Context Controls (Reference Style) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Dataset Snapshot: 2026-09-01</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs">
            <span>2,520 Repositories</span>
          </div>

          <button
            onClick={() => onNavigateToTab('prediction')}
            className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>ML Popularity Prediction</span>
          </button>
        </div>
      </div>

      {/* Main Bento Grid Matching Reference Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* TOP-LEFT: Primary Analytics Module */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-500 font-medium">
                  {repo ? 'Analyzed Repository Profile' : 'Dataset Aggregate Baseline'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {repo ? repo.full_name : 'Repository Engagement & Activity Metrics'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {repo ? repo.language : '10 Programming Languages'}
                </span>
              </div>
            </div>

            {/* 4-Metric Horizontal Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              {/* Stars */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Star className="w-3 h-3 text-amber-500" />
                  GitHub Stars
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {repo ? repo.stars.toLocaleString() : (datasetSummary?.metrics.stars.median.toLocaleString() || '1,960')}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {repo ? `${analysisData?.percentile_benchmarks.stars_percentile}% percentile` : 'Median across dataset'}
                </span>
              </div>

              {/* Forks */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <GitFork className="w-3 h-3 text-teal-600" />
                  Total Forks
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {repo ? repo.forks.toLocaleString() : (datasetSummary?.metrics.forks.median.toLocaleString() || '231')}
                </div>
                <span className="text-[11px] text-teal-700 font-medium mt-0.5 block">
                  {repo ? `${analysisData?.percentile_benchmarks.forks_percentile}% percentile` : 'Top Model Feature'}
                </span>
              </div>

              {/* Open Issues */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 text-cyan-600" />
                  Open Issues
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {repo ? repo.open_issues.toLocaleString() : (datasetSummary?.metrics.open_issues.median.toLocaleString() || '27')}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {repo ? `${analysisData?.percentile_benchmarks.issues_percentile}% percentile` : 'Active community scale'}
                </span>
              </div>

              {/* Repository Age */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  Repository Age
                </span>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {metrics ? `${metrics.repo_age_years} yrs` : '8.71 yrs'}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {metrics ? `${metrics.days_since_last_push.toFixed(0)}d since push` : 'Dataset median age'}
                </span>
              </div>
            </div>

            {/* Stepped Visual Distribution Bars */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-600 mb-2 font-medium">
                <span>Distribution Range across 2,520 Repositories</span>
                <span className="text-teal-700 font-semibold">Normalized Dataset Max</span>
              </div>
              <div className="grid grid-cols-4 gap-2 h-20 items-end">
                <div className="bg-amber-100 hover:bg-amber-200 rounded-lg p-2 flex flex-col justify-end transition-all h-[95%]">
                  <span className="text-[10px] font-bold text-amber-900">Stars</span>
                  <span className="text-xs font-bold text-amber-800">474k Peak</span>
                </div>
                <div className="bg-teal-100 hover:bg-teal-200 rounded-lg p-2 flex flex-col justify-end transition-all h-[75%]">
                  <span className="text-[10px] font-bold text-teal-900">Forks</span>
                  <span className="text-xs font-bold text-teal-800">81.5k Peak</span>
                </div>
                <div className="bg-cyan-100 hover:bg-cyan-200 rounded-lg p-2 flex flex-col justify-end transition-all h-[55%]">
                  <span className="text-[10px] font-bold text-cyan-900">Issues</span>
                  <span className="text-xs font-bold text-cyan-800">32.9k Peak</span>
                </div>
                <div className="bg-emerald-100 hover:bg-emerald-200 rounded-lg p-2 flex flex-col justify-end transition-all h-[40%]">
                  <span className="text-[10px] font-bold text-emerald-900">Age</span>
                  <span className="text-xs font-bold text-emerald-800">18.2y Max</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Explorer Bar */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Explore records and filter all 2,520 GitHub repositories</span>
            </div>
            <button
              onClick={() => onNavigateToTab('explorer')}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold transition-all shadow-2xs shrink-0"
            >
              Explore Repositories →
            </button>
          </div>
        </div>

        {/* TOP-RIGHT: High-Impact KPI Card */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/80 p-6 flex flex-col justify-between shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 font-medium">
                Popularity Classification Score
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                97.62% Test Acc
              </span>
            </div>

            {/* Headline Metric */}
            <div className="mt-5">
              <div className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 display-title tabular-nums">
                {prediction ? `${(prediction.p_high * 100).toFixed(1)}%` : '1,960'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {prediction
                  ? (prediction.is_high_popularity ? 'High Popularity Classification (>2,000 stars)' : 'Lower Popularity Classification (≤2,000 stars)')
                  : 'Median Stars Baseline across 2,520 repositories'}
              </p>
            </div>

            {/* Progress Breakdown Meters */}
            <div className="space-y-3 mt-6">
              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                  <span>Annual Fork Rate (forks_per_year)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {metrics ? `${metrics.forks_per_year.toFixed(1)}/yr` : '33.1/yr'}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                  <span>Annual Issue Rate (issues_per_year)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {metrics ? `${metrics.issues_per_year.toFixed(1)}/yr` : '4.0/yr'}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1 font-medium">
                  <span>Topic Tag Coverage</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {metrics ? `${metrics.topic_count} tags` : '66.55% rate'}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('models')}
            className="w-full mt-5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>Model Benchmark Matrix</span>
            <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
          </button>
        </div>

        {/* BOTTOM ROW CARD 1: Stratification */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/80 p-5 flex flex-col justify-between shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 font-medium">Ecosystem Stratification</span>
              <span className="text-xs text-teal-700 font-semibold">10 Languages</span>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                252 <span className="text-xs font-normal text-slate-500">repos / language</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stratified sampling across Python, JS, TS, Rust, Go, Java, C++, C#, Ruby, PHP.
              </p>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mt-4">
              {['Py', 'JS', 'TS', 'Rust', 'Go'].map((lang, idx) => (
                <div key={lang} className="text-center">
                  <div className="h-14 bg-slate-50 rounded-lg p-1 flex items-end justify-center">
                    <div
                      className="w-full bg-teal-500/80 rounded-md"
                      style={{ height: `${60 + idx * 8}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1 block font-semibold">
                    {lang}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('trends')}
            className="text-xs text-teal-700 hover:text-teal-900 mt-3 flex items-center gap-1 font-semibold transition-colors"
          >
            <span>Explore Trends →</span>
          </button>
        </div>

        {/* BOTTOM ROW CARD 2: Dual Velocity Meters */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/80 p-5 flex flex-col justify-between shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
          <div className="space-y-4">
            {/* Meter 1: Fork Rate */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Fork Velocity (Forks / Year)</span>
                <span className="text-emerald-700 font-semibold tabular-nums">+33.1/yr median</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {metrics ? `${metrics.forks_per_year.toFixed(1)}` : '33.1'}
                </div>
                <span className="text-[11px] text-slate-500">annualized velocity</span>
              </div>
              {/* Dot Matrix Meter */}
              <div className="flex items-center gap-1 mt-2">
                {[4, 8, 12, 16, 20, 14, 10, 6, 3, 2].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500 rounded-xs"
                    style={{ height: `${val * 1.2}px`, opacity: 0.3 + (val / 20) * 0.7 }}
                  />
                ))}
              </div>
            </div>

            {/* Meter 2: Issue Scale */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Active Issue Backlog</span>
                <span className="text-cyan-700 font-semibold tabular-nums">27 median</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {repo ? repo.open_issues.toLocaleString() : '27'}
                </div>
                <span className="text-[11px] text-slate-500">open issues</span>
              </div>
              {/* Dot Matrix Meter */}
              <div className="flex items-center gap-1 mt-2">
                {[3, 6, 10, 15, 18, 12, 8, 5, 2, 1].map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-500 rounded-xs"
                    style={{ height: `${val * 1.2}px`, opacity: 0.3 + (val / 18) * 0.7 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW CARD 3: Insight Card */}
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-br from-teal-50 via-emerald-50 to-white border border-teal-200/80 p-5 flex flex-col justify-between shadow-[0_4px_16px_-2px_rgba(20,184,166,0.1)] relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-100/80 text-teal-800 border border-teal-200">
                Dataset Insight #{insightIndex + 1}
              </span>
              <Layers className="w-4 h-4 text-teal-600" />
            </div>

            <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight display-title mt-3 tabular-nums">
              {currentInsight.stat}
            </div>

            <h4 className="text-sm font-bold text-slate-900 mt-1">
              {currentInsight.title}
            </h4>

            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {currentInsight.description}
            </p>
          </div>

          {/* Carousel Pagination */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-teal-200/60">
            <div className="flex items-center gap-1">
              {insights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setInsightIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === insightIndex ? 'w-5 bg-teal-600' : 'w-1.5 bg-slate-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setInsightIndex((prev) => (prev + 1) % (insights.length || 1))}
              className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
