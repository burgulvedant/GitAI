import { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { MetricBadge } from '../../ui/MetricBadge';

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

interface RepositoryExplorerTabProps {
  onAnalyzeRepo: (url: string) => Promise<any>;
}

const LANGUAGES = ['All', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP'];

export const RepositoryExplorerTab: React.FC<RepositoryExplorerTabProps> = ({ onAnalyzeRepo }) => {
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('All');
  const [selectedTier, setSelectedTier] = useState('all');
  const [sortBy, setSortBy] = useState('stars');
  const [order] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchRepos() {
      setIsLoading(true);
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
        console.error('Failed to fetch repository dataset:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchRepos();
    return () => {
      active = false;
    };
  }, [page, search, selectedLang, selectedTier, sortBy, order]);

  const handle1ClickAnalyze = (fullName: string) => {
    const url = `https://github.com/${fullName}`;
    onAnalyzeRepo(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 display-title">
            Repository Explorer
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and inspect {total.toLocaleString()} public repositories from the collected dataset
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MetricBadge label={`${total.toLocaleString()} Repositories Filtered`} variant="teal" size="sm" />
        </div>
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
            {/* Language Filter */}
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none font-medium"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-white text-slate-900">
                  Language: {l}
                </option>
              ))}
            </select>

            {/* Star Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => {
                setSelectedTier(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none font-medium"
            >
              <option value="all" className="bg-white text-slate-900">All Star Strata</option>
              <option value="high" className="bg-white text-slate-900">High (&gt;2,000 stars)</option>
              <option value="mid" className="bg-white text-slate-900">Mid (201–2,000 stars)</option>
              <option value="low" className="bg-white text-slate-900">Low (10–200 stars)</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none font-medium"
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    Querying repository records...
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
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm">
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
                        onClick={() => handle1ClickAnalyze(repo.full_name)}
                        className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-semibold text-teal-800 flex items-center gap-1.5 mx-auto transition-all shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>Analyze</span>
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
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-all shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-all shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
