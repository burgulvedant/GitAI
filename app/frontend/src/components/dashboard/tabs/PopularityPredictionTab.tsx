import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Info
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { MetricBadge } from '../../ui/MetricBadge';
import type { AnalysisResponse } from '../../../hooks/useGitAI';

interface PopularityPredictionTabProps {
  analysisData: AnalysisResponse | null;
  onNavigateToExplorer: () => void;
}

export const PopularityPredictionTab: React.FC<PopularityPredictionTabProps> = ({
  analysisData,
  onNavigateToExplorer
}) => {
  if (!analysisData) {
    return (
      <GlassCard className="p-12 text-center max-w-xl mx-auto space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No Repository Analyzed Yet</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Submit a public GitHub repository URL on the landing page or select a repository from the Repository Explorer to estimate popularity class using the trained machine-learning model.
        </p>
        <button
          onClick={onNavigateToExplorer}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all"
        >
          Select from Repository Explorer
        </button>
      </GlassCard>
    );
  }

  const { repository: repo, prediction, feature_contributions: impacts } = analysisData;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Machine Learning Popularity Classification
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 display-title mt-0.5">
            {repo.full_name}
          </h2>
        </div>
        <MetricBadge label={`Model: ${prediction.model_used}`} variant="teal" />
      </div>

      {/* Primary Classification Result Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <GlassCard
          className="lg:col-span-8 p-6 flex flex-col justify-between"
          activeGlow={prediction.is_high_popularity}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Binary Classification Target: popularity_class
              </span>
              <span className="text-xs font-semibold text-teal-700">Class Threshold: stars &gt; 2,000</span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
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
                <p className="text-xs text-slate-600 mt-1">
                  {prediction.is_high_popularity
                    ? 'The model classifies this repository into the High Popularity category (>2,000 stars) based on its measurable structural features.'
                    : 'The model classifies this repository into the Lower Popularity category (≤2,000 stars).'}
                </p>
              </div>
            </div>

            {/* Probability Scale */}
            <div className="mt-6 pt-5 border-t border-slate-200/70">
              <div className="flex justify-between text-xs text-slate-700 mb-2 font-medium">
                <span>Estimated Class Probabilities:</span>
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

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Zero Target Leakage: stars were strictly excluded from model feature inputs.</span>
          </div>
        </GlassCard>

        {/* Confidence & Accuracy Metric Card */}
        <GlassCard className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">
              Classification Confidence
            </span>
            <div className="mt-4">
              <div className="text-4xl sm:text-5xl font-bold text-teal-700 display-title tabular-nums">
                {prediction.confidence_percentage}%
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Prediction Confidence Score</span>
            </div>

            <div className="mt-6 space-y-3 pt-4 border-t border-slate-200/70 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Model F1-Score:</span>
                <span className="font-bold text-slate-900 tabular-nums">0.9649</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Model Test Accuracy:</span>
                <span className="font-bold text-slate-900 tabular-nums">97.62%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ROC-AUC:</span>
                <span className="font-bold text-slate-900 tabular-nums">0.9954</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Generalization Gap:</span>
                <span className="font-bold text-emerald-700">0.0000 (No Overfit)</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-200/70 font-medium">
            Evaluated on Stratified 80/20 Test Partition ($N = 504$)
          </div>
        </GlassCard>
      </div>

      {/* Feature Contributions Breakdown */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-medium">
              Model Interpretability & Feature Contributions
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Feature Impact on Popularity Class</h3>
          </div>
          <MetricBadge label="Standardized Linear Attribution" variant="teal" size="sm" />
        </div>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">
          Standardized linear contributions ($w_i \cdot x_i$) showing how each repository characteristic elevated or lowered the log-odds of high popularity.
        </p>

        <div className="space-y-3 mt-5">
          {impacts.map((feat) => (
            <div
              key={feat.feature}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg ${
                    feat.direction === 'positive'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {feat.direction === 'positive' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-700" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900">{feat.feature}</span>
                  <span className="text-[11px] text-slate-500 block">
                    {feat.direction === 'positive'
                      ? 'Elevated high-popularity likelihood'
                      : 'Reduced high-popularity likelihood'}
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
