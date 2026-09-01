import { useState, useEffect } from 'react';
import {
  Database,
  Link as LinkIcon,
  ArrowLeft,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  GitFork,
  AlertCircle,
  Clock,
  CheckCircle2,
  Info,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { MetricBadge } from '../../ui/MetricBadge';
import type { AnalysisResponse } from '../../../hooks/useGitAI';

export type AnalyzeState = 'OPTIONS' | 'DATASET' | 'REPOSITORY_ANALYSIS';

interface RepositoryItem {
  id: number;
  repository_name: string;
  owner: string;
  full_name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  open_issues: number;
  topics: string;
  license: string;
  created_at: string;
}

interface AnalyzeTabProps {
  analysisData: AnalysisResponse | null;
  onAnalyzeRepo: (url: string) => Promise<any>;
  initialState?: AnalyzeState;
}

const LANGUAGES = ['All', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP'];

export const AnalyzeTab: React.FC<AnalyzeTabProps> = ({
  analysisData,
  onAnalyzeRepo,
  initialState = 'OPTIONS'
}) => {
  const [internalState, setInternalState] = useState<AnalyzeState>(
    analysisData ? 'REPOSITORY_ANALYSIS' : initialState
  );
  const [sourceWasDataset, setSourceWasDataset] = useState(false);

  // URL Input State
  const [urlInput, setUrlInput] = useState('');
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Dataset Table State
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [total, setTotal] = useState(2520);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(168);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('All');
  const [selectedTier, setSelectedTier] = useState('all');
  const [sortBy, setSortBy] = useState('stars');
  const [order] = useState('desc');
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);
  const [analyzingFullName, setAnalyzingFullName] = useState<string | null>(null);

  // When analysisData changes externally (e.g. from Landing Hero), switch to REPOSITORY_ANALYSIS
  useEffect(() => {
    if (analysisData) {
      setInternalState('REPOSITORY_ANALYSIS');
    }
  }, [analysisData]);

  // Fetch repositories when in DATASET state
  useEffect(() => {
    if (internalState !== 'DATASET') return;

    let active = true;
    async function fetchRepos() {
      setIsLoadingDataset(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: '15',
          sort_by: sortBy,
          order: order
        });
        if (search.trim()) params.append('q', search.trim());
        if (selectedLang !== 'All') params.append('language', selectedLang);
        if (selectedTier !== 'all') params.append('tier', selectedTier);

        const res = await fetch(`/api/dataset/repositories?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setRepositories(data.items);
            setTotal(data.total);
            setTotalPages(data.total_pages);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dataset:', err);
      } finally {
        if (active) setIsLoadingDataset(false);
      }
    }

    fetchRepos();
    return () => {
      active = false;
    };
  }, [internalState, page, search, selectedLang, selectedTier, sortBy, order]);

  // Handle URL Form Submission
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsSubmittingUrl(true);
    setUrlError(null);
    try {
      await onAnalyzeRepo(urlInput.trim());
      setSourceWasDataset(false);
      setInternalState('REPOSITORY_ANALYSIS');
    } catch (err: any) {
      setUrlError(err.message || 'Failed to analyze repository URL.');
    } finally {
      setIsSubmittingUrl(false);
    }
  };

  // Handle 1-Click Analyze from Dataset Table
  const handleDatasetRowAnalyze = async (fullName: string) => {
    setAnalyzingFullName(fullName);
    try {
      await onAnalyzeRepo(`https://github.com/${fullName}`);
      setSourceWasDataset(true);
      setInternalState('REPOSITORY_ANALYSIS');
    } catch (err) {
      console.error('Failed to analyze dataset repo:', err);
    } finally {
      setAnalyzingFullName(null);
    }
  };

  // =========================================================================
  // STATE 1: OPTIONS (Initial Selection Screen)
  // =========================================================================
  if (internalState === 'OPTIONS') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-2 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 display-title">
            Analyze a GitHub Repository
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Choose how you want to explore and analyze repository characteristics.
          </p>
        </div>

        {/* 2 Primary Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* OPTION 1: Explore 2,520 Public Repositories */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-7 flex flex-col justify-between shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:border-teal-500/40 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Explore 2,520 Public Repositories
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Browse and analyze repositories from our collected GitHub dataset.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>10 programming language ecosystems indexed</span>
              </div>
            </div>

            <button
              onClick={() => setInternalState('DATASET')}
              className="w-full mt-6 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>Explore Repository Dataset →</span>
            </button>
          </div>

          {/* OPTION 2: Paste a GitHub Repository URL */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-7 flex flex-col justify-between shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:border-teal-500/40 hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shadow-xs">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Paste a GitHub Repository URL
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Analyze a GitHub repository using its URL.
                </p>
              </div>

              <form onSubmit={handleUrlSubmit} className="space-y-3 pt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                  />
                </div>

                {urlError && (
                  <p className="text-xs text-red-600 font-medium">{urlError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingUrl || !urlInput.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  {isSubmittingUrl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Repository...</span>
                    </>
                  ) : (
                    <span>Analyze Repository →</span>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-4 text-xs text-slate-400 text-center font-medium">
              Live server-side metadata extraction & ML scoring
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: DATASET (Explore 2,520 Repositories Table)
  // =========================================================================
  if (internalState === 'DATASET') {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInternalState('OPTIONS')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Analyze Options</span>
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 display-title">
                Repository Dataset
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                2,520 public repositories from the collected dataset across 10 programming-language ecosystems.
              </p>
            </div>
          </div>

          <MetricBadge label={`${total.toLocaleString()} Repositories`} variant="teal" />
        </div>

        {/* Filter and Search Bar */}
        <GlassCard className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by repo, owner, topic..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none font-semibold cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} className="bg-white text-slate-900">
                    Language: {l}
                  </option>
                ))}
              </select>

              <select
                value={selectedTier}
                onChange={(e) => {
                  setSelectedTier(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none font-semibold cursor-pointer"
              >
                <option value="all" className="bg-white text-slate-900">All Star Strata</option>
                <option value="high" className="bg-white text-slate-900">High (&gt;2,000 stars)</option>
                <option value="mid" className="bg-white text-slate-900">Mid (201–2,000 stars)</option>
                <option value="low" className="bg-white text-slate-900">Low (10–200 stars)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none font-semibold cursor-pointer"
              >
                <option value="stars" className="bg-white text-slate-900">Sort: Stars</option>
                <option value="forks" className="bg-white text-slate-900">Sort: Forks</option>
                <option value="open_issues" className="bg-white text-slate-900">Sort: Issues</option>
                <option value="created_at" className="bg-white text-slate-900">Sort: Created Date</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Repositories Table */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Repository</th>
                  <th className="py-3 px-3">Language</th>
                  <th className="py-3 px-3 text-right">Stars</th>
                  <th className="py-3 px-3 text-right">Forks</th>
                  <th className="py-3 px-3 text-right">Open Issues</th>
                  <th className="py-3 px-3">License</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingDataset ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      Loading dataset records...
                    </td>
                  </tr>
                ) : repositories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No matching repositories found.
                    </td>
                  </tr>
                ) : (
                  repositories.map((repo) => (
                    <tr key={repo.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                          <span>{repo.full_name}</span>
                          <a
                            href={`https://github.com/${repo.full_name}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-teal-600 transition-colors"
                            title="Open on GitHub"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5 font-normal">
                          {repo.description || 'No description provided'}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs">
                          {repo.language}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums">
                        {repo.stars.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-teal-700 tabular-nums">
                        {repo.forks.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-cyan-700 tabular-nums">
                        {repo.open_issues.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600 truncate max-w-[120px]">
                        {repo.license}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDatasetRowAnalyze(repo.full_name)}
                          disabled={analyzingFullName === repo.full_name}
                          className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-semibold text-teal-800 flex items-center gap-1.5 mx-auto transition-all shadow-2xs cursor-pointer"
                        >
                          {analyzingFullName === repo.full_name ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                              <span>Analyze →</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
            <span className="font-medium">
              Page {page} of {totalPages} ({total.toLocaleString()} repositories)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-all shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-all shadow-2xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // =========================================================================
  // STATE 3: REPOSITORY_ANALYSIS (Complete Overview + Dataset Benchmark + ML Prediction)
  // =========================================================================
  if (!analysisData) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-600">No repository analyzed yet.</p>
        <button
          onClick={() => setInternalState('OPTIONS')}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Back to Analyze Options
        </button>
      </div>
    );
  }

  const {
    repository: repo,
    engineered_metrics: metrics,
    percentile_benchmarks: percentiles,
    prediction,
    feature_contributions: impacts
  } = analysisData;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Breadcrumb / Return Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInternalState(sourceWasDataset ? 'DATASET' : 'OPTIONS')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>{sourceWasDataset ? '← Back to Repository Dataset' : '← Back to Analyze Options'}</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 display-title">
                {repo.full_name}
              </h2>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 transition-colors shadow-2xs"
                title="Open on GitHub"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Analyzed repository profile & machine learning popularity estimation ($N = 2,520$ benchmark).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MetricBadge label={repo.language} variant="teal" />
          <MetricBadge label={prediction.model_used} variant="emerald" />
        </div>
      </div>

      {/* SECTION 1: Repository Overview Metrics (4-Metric Bar) */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Repository Characteristics & Metadata
          </span>
          <span className="text-xs font-medium text-slate-500">
            {metrics.days_since_last_push.toFixed(0)}d since last push
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              GitHub Stars
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {repo.stars.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
              {percentiles.stars_percentile}% dataset percentile
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <GitFork className="w-3.5 h-3.5 text-teal-600" />
              Total Forks
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {repo.forks.toLocaleString()}
            </div>
            <span className="text-[11px] text-teal-700 mt-0.5 block font-medium">
              {percentiles.forks_percentile}% dataset percentile
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-600" />
              Open Issues
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {repo.open_issues.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
              {percentiles.issues_percentile}% dataset percentile
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Repository Age
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {metrics.repo_age_years} yrs
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
              Created {repo.created_at.slice(0, 10)}
            </span>
          </div>
        </div>

        {/* Description & Topic Tags */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
            {repo.description || 'No repository description provided.'}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
              {repo.license}
            </span>
            {repo.topics.slice(0, 4).map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Dataset Percentiles & Derived Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              Stars Benchmark
            </span>
            <span className="font-bold text-amber-800 tabular-nums">{percentiles.stars_percentile}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentiles.stars_percentile}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1.5 block">
            Higher than {percentiles.stars_percentile}% of 2,520 repos
          </span>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-teal-600" />
              Fork Velocity
            </span>
            <span className="font-bold text-teal-800 tabular-nums">{metrics.forks_per_year.toFixed(1)}/yr</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(100, percentiles.forks_percentile)}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1.5 block">
            {percentiles.forks_percentile}% forks percentile
          </span>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-600" />
              Issue Activity Rate
            </span>
            <span className="font-bold text-cyan-800 tabular-nums">{metrics.issues_per_year.toFixed(1)}/yr</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, percentiles.issues_percentile)}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1.5 block">
            {percentiles.issues_percentile}% issues percentile
          </span>
        </GlassCard>
      </div>

      {/* SECTION 3: ML Popularity Prediction & Feature Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <GlassCard
          className="lg:col-span-8 p-6 flex flex-col justify-between"
          activeGlow={prediction.is_high_popularity}
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Machine Learning Popularity Prediction
              </span>
              <span className="text-xs font-semibold text-teal-700">Threshold: stars &gt; 2,000</span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  prediction.is_high_popularity
                    ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm'
                    : 'bg-slate-100 border border-slate-300 text-slate-700'
                }`}
              >
                {prediction.is_high_popularity ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                ) : (
                  <Info className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight display-title">
                  {prediction.popularity_label}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {prediction.is_high_popularity
                    ? 'The model classifies this repository into the High Popularity category (>2,000 stars) based on its structural engagement metrics.'
                    : 'The model classifies this repository into the Lower Popularity category (≤2,000 stars).'}
                </p>
              </div>
            </div>

            {/* Probability Scale */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-700 mb-2 font-medium">
                <span>Class Probabilities:</span>
                <span className="tabular-nums font-semibold">
                  P(High): {(prediction.p_high * 100).toFixed(1)}% | P(Lower): {(prediction.p_low * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-emerald-500 h-full transition-all duration-700"
                  style={{ width: `${prediction.p_high * 100}%` }}
                />
                <div
                  className="bg-slate-300 h-full transition-all duration-700"
                  style={{ width: `${prediction.p_low * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Zero Target Leakage: stars were strictly excluded from model feature inputs.</span>
          </div>
        </GlassCard>

        {/* Confidence & Accuracy Metric Card */}
        <GlassCard className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Prediction Confidence
            </span>
            <div className="mt-3">
              <div className="text-4xl font-bold text-teal-700 display-title tabular-nums">
                {prediction.confidence_percentage}%
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">Estimated Confidence</span>
            </div>

            <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Model F1-Score:</span>
                <span className="font-bold text-slate-900 tabular-nums">0.9649</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Model Test Accuracy:</span>
                <span className="font-bold text-slate-900 tabular-nums">97.62%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">ROC-AUC:</span>
                <span className="font-bold text-slate-900 tabular-nums">0.9954</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Generalization Gap:</span>
                <span className="font-bold text-emerald-700">0.0000 (No Overfit)</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 font-medium">
            Validated on Stratified Test Partition ($N = 504$)
          </div>
        </GlassCard>
      </div>

      {/* Feature Contributions Breakdown */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Model Interpretability & Feature Contributions
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Feature Impact on Popularity Class</h3>
          </div>
          <MetricBadge label="Standardized Linear Attribution" variant="teal" size="sm" />
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
          Standardized linear contributions ($w_i \cdot x_i$) showing how each repository characteristic elevated or lowered the log-odds of high popularity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {impacts.map((feat) => (
            <div
              key={feat.feature}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    feat.direction === 'positive'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {feat.direction === 'positive' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-700" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900">{feat.feature}</span>
                  <span className="text-[11px] text-slate-500 block">
                    {feat.direction === 'positive' ? 'Elevated high popularity' : 'Reduced high popularity'}
                  </span>
                </div>
              </div>

              <div className="text-xs font-bold tabular-nums">
                <span className={feat.direction === 'positive' ? 'text-emerald-700' : 'text-red-700'}>
                  {feat.impact > 0 ? `+${feat.impact}` : feat.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
