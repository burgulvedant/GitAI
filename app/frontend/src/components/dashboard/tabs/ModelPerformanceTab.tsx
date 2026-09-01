import { Award, BarChart2 } from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { MetricBadge } from '../../ui/MetricBadge';
import type { ModelBenchmarks } from '../../../hooks/useGitAI';

interface ModelPerformanceTabProps {
  modelBenchmarks: ModelBenchmarks | null;
}

export const ModelPerformanceTab: React.FC<ModelPerformanceTabProps> = ({ modelBenchmarks }) => {
  const benchmarks = modelBenchmarks?.benchmarks || [
    { Model: 'Majority Baseline (Predict 0)', Accuracy: 0.6667, Precision: 0.0, Recall: 0.0, F1: 0.0, 'ROC-AUC': 0.5000, Overfit_Gap_F1: 0.0 },
    { Model: 'Logistic Regression', Accuracy: 0.9762, Precision: 0.9483, Recall: 0.9821, F1: 0.9649, 'ROC-AUC': 0.9954, Overfit_Gap_F1: -0.0001 },
    { Model: 'Random Forest', Accuracy: 0.9702, Precision: 0.9527, Recall: 0.9583, F1: 0.9555, 'ROC-AUC': 0.9958, Overfit_Gap_F1: 0.0423 },
    { Model: 'XGBoost', Accuracy: 0.9702, Precision: 0.9527, Recall: 0.9583, F1: 0.9555, 'ROC-AUC': 0.9969, Overfit_Gap_F1: 0.0445 }
  ];

  const weights = modelBenchmarks?.feature_weights || {
    log_forks: 6.153,
    language_Ruby: 1.966,
    language_PHP: 1.340,
    language_Csharp: 0.740,
    language_Rust: 0.584,
    has_description: 0.354,
    topic_count: 0.281,
    repo_age_years: 0.125,
    language_Python: -0.821,
    language_JavaScript: -0.875,
    days_since_last_push: -1.056,
    language_TypeScript: -1.071,
    language_Java: -1.281
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 display-title">
              Machine Learning Model Benchmarks & Comparison
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Rigorous test-set evaluation across candidate architectures ($N = 504$ test partition) comparing popularity classification metrics.
            </p>
          </div>
          <MetricBadge label="Logistic Regression Selected" variant="emerald" />
        </div>
      </div>

      {/* Benchmark Table Card */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Stratified Test Set Benchmarking
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Model Comparison Matrix</h3>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-md">
            4 Candidate Models
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-3 text-right">Accuracy</th>
                <th className="py-3 px-3 text-right">Precision</th>
                <th className="py-3 px-3 text-right">Recall</th>
                <th className="py-3 px-3 text-right">F1-Score</th>
                <th className="py-3 px-3 text-right">ROC-AUC</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.map((row) => {
                const isSelected = row.Model === 'Logistic Regression';
                return (
                  <tr
                    key={row.Model}
                    className={`transition-colors ${
                      isSelected ? 'bg-teal-50/70 font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      {isSelected && <Award className="w-4 h-4 text-teal-600 shrink-0" />}
                      <span className="text-xs font-semibold">{row.Model}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums">
                      {(row.Accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums">
                      {(row.Precision * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums">
                      {(row.Recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-teal-700 tabular-nums">
                      {row.F1.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-emerald-700 tabular-nums">
                      {row['ROC-AUC'].toFixed(4)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isSelected ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                          Best Model (Selected)
                        </span>
                      ) : row.Model.includes('Baseline') ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                          Baseline
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[11px] font-medium">
                          Evaluated
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Grid: Confusion Matrix & Feature Weights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Confusion Matrix Visualizer */}
        <GlassCard className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Error Breakdown (Test Set: N = 504)
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Logistic Regression Confusion Matrix</h3>
            </div>
            <MetricBadge label="12 Total Errors" variant="teal" size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs text-slate-600 font-medium block">True Negatives (TN)</span>
              <div className="text-3xl font-bold text-emerald-700 mt-1 tabular-nums">327</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Correctly classified Lower Pop</span>
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
              <span className="text-xs text-slate-600 font-medium block">False Positives (FP)</span>
              <div className="text-3xl font-bold text-red-600 mt-1 tabular-nums">9</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Lower Pop classified as High</span>
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
              <span className="text-xs text-slate-600 font-medium block">False Negatives (FN)</span>
              <div className="text-3xl font-bold text-red-600 mt-1 tabular-nums">3</div>
              <span className="text-[11px] text-slate-500 mt-1 block">High Pop classified as Lower</span>
            </div>

            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-xs text-slate-600 font-medium block">True Positives (TP)</span>
              <div className="text-3xl font-bold text-teal-700 mt-1 tabular-nums">165</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Correctly classified High Pop</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 text-center font-semibold">
            High-Popularity Capture Rate (Recall): 98.21% (165 / 168)
          </p>
        </GlassCard>

        {/* Standardized Weights Breakdown */}
        <GlassCard className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Linear Coefficients (Log-Odds)
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Top Feature Weights</h3>
            </div>
            <BarChart2 className="w-4 h-4 text-teal-600" />
          </div>

          <div className="space-y-2 mt-4 max-h-64 overflow-y-auto pr-1">
            {Object.entries(weights).map(([feat, w]) => (
              <div key={feat} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                <span className="text-slate-800 font-medium">{feat}</span>
                <span
                  className={`font-bold tabular-nums ${
                    w > 0 ? 'text-teal-700' : 'text-red-600'
                  }`}
                >
                  {w > 0 ? `+${w.toFixed(3)}` : w.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
