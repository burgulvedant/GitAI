import {
  HelpCircle,
  Database,
  Layers,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { MetricBadge } from '../../ui/MetricBadge';

export const GoalsTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto py-1">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 display-title">
              Why GitAI?
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              From thousands of GitHub repositories to measurable patterns in technology popularity.
            </p>
          </div>
          <MetricBadge label="Methodology & Objective" variant="teal" />
        </div>
      </div>

      {/* 1. The Problem */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Research Motivation
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">The Problem</h3>
          </div>
          <HelpCircle className="w-4 h-4 text-teal-600" />
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
          GitHub contains millions of public repositories, making it difficult to understand which technologies are gaining attention and which repositories stand out in popularity.
        </p>

        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-900 block mb-2.5">Specific Questions We Investigate:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              <span className="font-medium">Which programming languages are popular?</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              <span className="font-medium">Which languages have more highly popular repositories?</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              <span className="font-medium">What patterns are visible among highly popular repositories?</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              <span className="font-medium">Can repository characteristics help explain or classify popularity?</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2. The Scale Problem ("We Cannot Analyze Every Repository") */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Dataset Construction Strategy
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">We Cannot Analyze Every Repository</h3>
          </div>
          <Database className="w-4 h-4 text-teal-600" />
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed max-w-3xl">
          GitHub is far too large to analyze repository-by-repository for a focused data science study. Instead of attempting to process every public repository, we constructed a representative dataset of 2,520 public repositories across 10 programming-language ecosystems.
        </p>

        {/* 3 Metric Stat Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-center">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">2,520</div>
            <span className="text-xs font-bold text-teal-800 mt-1 block">Public Repositories</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Collected via GitHub API</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-center">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">10</div>
            <span className="text-xs font-bold text-teal-800 mt-1 block">Programming Languages</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Major Software Ecosystems</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-center">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">252</div>
            <span className="text-xs font-bold text-teal-800 mt-1 block">Repos per Language</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Balanced Stratified Sampling</span>
          </div>
        </div>
      </div>

      {/* 3. Our Approach */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Data Science Methodology
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Our Approach</h3>
          </div>
          <Layers className="w-4 h-4 text-teal-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <span className="text-xs font-bold text-teal-700 block">01 — Collect</span>
            <h4 className="text-sm font-bold text-slate-900">Data Collection</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Collect public GitHub repository metadata across 10 language ecosystems.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <span className="text-xs font-bold text-teal-700 block">02 — Analyze</span>
            <h4 className="text-sm font-bold text-slate-900">Feature Analysis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyze stars, forks, issues, age, topic tags, license, and maintenance signals.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <span className="text-xs font-bold text-teal-700 block">03 — Compare</span>
            <h4 className="text-sm font-bold text-slate-900">Cross-Language Trends</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compare repository popularity distributions across the 10 language groups.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <span className="text-xs font-bold text-teal-700 block">04 — Model</span>
            <h4 className="text-sm font-bold text-slate-900">ML Classification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use machine learning to investigate if measurable features can classify popularity.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 4. What We Found */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Empirical Conclusions
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">What We Found</h3>
          </div>
          <TrendingUp className="w-4 h-4 text-teal-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block text-xs">Popularity is highly uneven across GitHub repositories.</span>
              <span className="text-slate-600 mt-0.5 block leading-relaxed">
                Raw stars exhibit extreme power-law skewness (+4.55), where a small upper tier of mega-repositories attracts outsized attention.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block text-xs">Popularity distributions differ substantially between languages.</span>
              <span className="text-slate-600 mt-0.5 block leading-relaxed">
                Highly starred repositories exist across multiple ecosystems, but Python and TypeScript exhibit elevated mean stars due to upper-tail concentration.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block text-xs">Fork activity shows a strong monotonic relationship with popularity (ρ = 0.896).</span>
              <span className="text-slate-600 mt-0.5 block leading-relaxed">
                Fork counts and annual fork velocity serve as the strongest linear indicators associated with high repository popularity.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block text-xs">Repository age alone does not linearly explain popularity.</span>
              <span className="text-slate-600 mt-0.5 block leading-relaxed">
                Mature repositories do not automatically accumulate high star counts without sustained community adoption and active maintenance.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 md:col-span-2 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-teal-950 block text-xs">
                Repository characteristics can classify popularity with 97.62% test accuracy.
              </span>
              <span className="text-teal-900 mt-0.5 block leading-relaxed">
                Using validated Logistic Regression with zero target leakage, measurable features accurately distinguish high-popularity repositories (&gt;2,000 stars) with 0.9649 F1-score and 0.9954 ROC-AUC.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Our Solution — GitAI */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Application Artifact
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Our Solution — GitAI</h3>
          </div>
          <BrainCircuit className="w-4 h-4 text-teal-600" />
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
          GitAI turns a large collection of GitHub repository data into an interactive data science workspace for understanding technology trends and repository popularity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Explore technology and programming-language trends</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Compare repository popularity across languages</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Explore the 2,520-repository dataset</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Analyze an individual GitHub repository</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Examine repository characteristics associated with popularity</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>View the machine-learning popularity classification</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Compare trained classification models</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Review verified dataset statistical insights</span>
          </div>
        </div>
      </GlassCard>

      {/* 6. Study Scope */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 block mb-0.5">Study Scope</span>
          This project does not attempt to represent every repository on GitHub. Instead, it studies a structured dataset of 2,520 public repositories sampled across 10 programming-language ecosystems to identify measurable patterns in repository popularity and technology trends.
        </div>
      </div>

      {/* 7. Final Goal */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-50/90 via-emerald-50/80 to-white/90 border border-teal-200 p-6 text-center space-y-3 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-2xs">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Our Goal</h3>
        <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed">
          The goal of GitAI is to make GitHub repository data easier to understand — using a focused dataset, exploratory analysis, statistical patterns, and machine learning to answer which programming languages are popular, which languages contain more popular repositories, and what repository characteristics are associated with popularity.
        </p>
        <div className="pt-2 text-xs font-bold text-teal-900 tracking-wide">
          From repository data → to patterns → to insight.
        </div>
      </div>
    </div>
  );
};
