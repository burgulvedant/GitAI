import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { ShieldCheck, TrendingUp, HelpCircle, Info, Star } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { MetricBadge } from '../../ui/MetricBadge';
import type { DatasetSummary } from '../../../hooks/useGitAI';

interface TechnologyTrendsTabProps {
  datasetSummary: DatasetSummary | null;
}

interface TopRepoItem {
  full_name: string;
  language: string;
  stars: number;
}

export const TechnologyTrendsTab: React.FC<TechnologyTrendsTabProps> = ({ datasetSummary }) => {
  const [starMetricView, setStarMetricView] = useState<'both' | 'mean' | 'median'>('both');
  const [topRepos, setTopRepos] = useState<TopRepoItem[]>([
    { full_name: 'public-apis/public-apis', language: 'Python', stars: 474001 },
    { full_name: 'freeCodeCamp/freeCodeCamp', language: 'TypeScript', stars: 454817 },
    { full_name: 'EbookFoundation/free-programming-books', language: 'Python', stars: 395713 },
    { full_name: 'openclaw/openclaw', language: 'TypeScript', stars: 388422 },
    { full_name: 'donnemartin/system-design-primer', language: 'Python', stars: 367144 }
  ]);

  useEffect(() => {
    let active = true;
    async function fetchTopRepos() {
      try {
        const res = await fetch('/api/dataset/repositories?page=1&page_size=5&sort_by=stars&order=desc');
        if (res.ok) {
          const data = await res.json();
          if (active && data.items && data.items.length > 0) {
            setTopRepos(
              data.items.map((r: any) => ({
                full_name: r.full_name,
                language: r.language,
                stars: r.stars
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch top repos:', err);
      }
    }
    fetchTopRepos();
    return () => {
      active = false;
    };
  }, []);

  if (!datasetSummary) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Loading verified technology trend datasets...
      </div>
    );
  }

  // Format language metrics for charts
  const langData = datasetSummary.language_comparison.map((item) => ({
    name: item.language,
    'Median Stars': item.median_stars,
    'Mean Stars': item.mean_stars,
    'Median Forks': item.median_forks,
    'Median Issues': item.median_issues,
    'Median Age (Yrs)': item.median_age_years
  }));

  // Top licenses
  const licenseData = Object.entries(datasetSummary.top_licenses).map(([license, count]) => ({
    license: license === 'No license specified' ? 'Unlicensed' : license,
    count
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Research Introduction Header */}
      <div className="border-b border-slate-100 pb-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 display-title">
              Technology & Programming Language Trends
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Using 2,520 public GitHub repositories across 10 programming languages, we analyzed repository popularity to identify which languages are most represented and which ecosystems contain more highly-starred repositories.
            </p>
          </div>
          <MetricBadge label="10 Languages • 252 Repos Each" variant="teal" />
        </div>

        {/* Guiding Research Questions Banner */}
        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-950">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-teal-900">Two Core Research Questions Guide This Analysis:</span>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-0.5 text-teal-800 font-medium">
                <span>1. Which programming languages are popular?</span>
                <span>2. Which languages have more popular repositories?</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-white/80 px-2.5 py-1 rounded-md shrink-0 border border-teal-200/60">
            Dataset Ground Truth
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Chart: Cross-Language Popularity Comparison */}
        <GlassCard className="lg:col-span-8 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">
                  Primary Research Investigation
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Repository Popularity Across Languages (Mean vs. Median Stars)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setStarMetricView('both')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    starMetricView === 'both' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => setStarMetricView('mean')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    starMetricView === 'mean' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mean Stars
                </button>
                <button
                  onClick={() => setStarMetricView('median')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    starMetricView === 'median' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Median Stars
                </button>
              </div>
            </div>

            {/* Statistical Interpretation Narrative */}
            <div className="mt-3 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <p>
                We compare mean and median GitHub stars across the 10 language groups to understand how repository popularity differs between ecosystems.
              </p>
              <p className="text-slate-500">
                Mean stars can be strongly influenced by a small number of extremely popular repositories (e.g., Python and TypeScript mega-repos), while the median provides a more representative view of a typical repository.
              </p>
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={langData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [Number(value).toLocaleString(), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#475569' }} />
                  {(starMetricView === 'both' || starMetricView === 'mean') && (
                    <Bar dataKey="Mean Stars" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  )}
                  {(starMetricView === 'both' || starMetricView === 'median') && (
                    <Bar dataKey="Median Stars" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WHAT WE FOUND Section */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">What We Found:</span>{' '}
              Repository popularity is highly skewed—a small number of repositories attract extreme numbers of stars. Comparing language groups shows where highly popular repositories are concentrated (Python mean: 38.8k, TypeScript mean: 32.7k), while median stars (~1,950) provide a stable comparison of typical repository popularity across all 10 language strata.
            </div>
          </div>
        </GlassCard>

        {/* Right Card: Most Popular Repositories */}
        <GlassCard className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">
                  Repository Popularity
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Most Popular Repositories</h3>
              </div>
              <Star className="w-4 h-4 text-amber-500" />
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Highest-starred repositories in the analyzed dataset.
            </p>

            {/* Top 5 Leaderboard from Dataset */}
            <div className="space-y-2 mt-3">
              {topRepos.map((repo, idx) => (
                <div key={repo.full_name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100/80 last:border-0">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-[11px] font-bold text-slate-400 w-3.5 shrink-0">#{idx + 1}</span>
                    <div className="min-w-0">
                      <span className="text-slate-900 font-semibold truncate block max-w-[145px]">{repo.full_name}</span>
                      <span className="text-[10px] text-teal-800 font-semibold px-1.5 py-0.5 rounded-sm bg-teal-50 border border-teal-200/60 inline-block mt-0.5">
                        {repo.language}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 tabular-nums text-xs">
                      {repo.stars.toLocaleString()}
                    </span>
                    <span className="text-amber-500 text-[10px] ml-0.5">★</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Why do these repositories stand out? */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block mb-1">Why do these repositories stand out?</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Highly popular repositories tend to combine large community engagement with strong repository activity, reflected through stars, forks, issues, topics, and maintenance signals.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            Several of the highest-starred repositories belong to Python and TypeScript ecosystems.
          </div>
        </GlassCard>

        {/* Chart 3: Median Forks & Issues Across Ecosystems */}
        <GlassCard className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-500 font-medium">
                Community Activity Patterns
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Median Forks & Open Issues</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Comparing community fork usage and open issue backlogs across each programming language group.
          </p>

          <div className="h-60 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={langData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [Number(value).toLocaleString(), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#475569' }} />
                <Bar dataKey="Median Forks" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Median Issues" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 4: Open Source License Distribution */}
        <GlassCard className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-500 font-medium">
                Open-Source Governance
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">License Distribution (2,520 Repositories)</h3>
            </div>
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Permissive licensing prevalence across the 10 language ecosystems in the dataset.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5">
            {licenseData.map((lic) => (
              <div key={lic.license} className="rounded-xl bg-slate-50/80 border border-slate-200/70 p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-600 font-semibold truncate block">{lic.license}</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">{lic.count.toLocaleString()}</div>
                </div>
                <span className="text-[11px] text-teal-700 font-semibold mt-2 block">
                  {((lic.count / 2520) * 100).toFixed(1)}% of dataset
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
