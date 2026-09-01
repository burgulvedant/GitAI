import { useState, useEffect, useCallback } from 'react';

export interface RepositoryMetadata {
  name: string;
  owner: string;
  full_name: string;
  html_url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  open_issues: number;
  topics: string[];
  license: string;
  created_at: string;
  pushed_at: string;
}

export interface EngineeredMetrics {
  log_forks: number;
  log_open_issues: number;
  repo_age_days: number;
  repo_age_years: number;
  days_since_last_push: number;
  forks_per_year: number;
  issues_per_year: number;
  topic_count: number;
  has_topics: boolean;
  has_description: boolean;
  description_length: number;
  has_license: boolean;
}

export interface PredictionResult {
  popularity_class: number;
  popularity_label: string;
  p_high: number;
  p_low: number;
  confidence_percentage: number;
  is_high_popularity: boolean;
  model_used: string;
}

export interface FeatureContribution {
  feature: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface AnalysisResponse {
  repository: RepositoryMetadata;
  engineered_metrics: EngineeredMetrics;
  prediction: PredictionResult;
  feature_contributions: FeatureContribution[];
  percentile_benchmarks: {
    stars_percentile: number;
    forks_percentile: number;
    issues_percentile: number;
  };
}

export interface DatasetSummary {
  total_repositories: number;
  language_distribution: Record<string, number>;
  metrics: {
    stars: { min: number; median: number; mean: number; max: number; skewness: number };
    forks: { min: number; median: number; mean: number; max: number; skewness: number };
    open_issues: { min: number; median: number; mean: number; max: number; skewness: number };
  };
  top_topics: Record<string, number>;
  top_licenses: Record<string, number>;
  language_comparison: Array<{
    language: string;
    count: number;
    median_stars: number;
    mean_stars: number;
    median_forks: number;
    mean_forks: number;
    median_issues: number;
    median_age_years: number;
  }>;
}

export interface ModelBenchmarks {
  best_model: string;
  benchmarks: Array<{
    Model: string;
    Accuracy: number;
    Precision: number;
    Recall: number;
    F1: number;
    'ROC-AUC': number;
    Train_F1: number;
    Train_AUC: number;
    Overfit_Gap_F1: number;
  }>;
  feature_weights: Record<string, number>;
  intercept: number;
}

export interface InsightFinding {
  title: string;
  category: string;
  stat: string;
  description: string;
}

export function useGitAI() {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);
  const [modelBenchmarks, setModelBenchmarks] = useState<ModelBenchmarks | null>(null);
  const [insights, setInsights] = useState<InsightFinding[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Load summary and benchmarks on mount
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setIsLoadingSummary(true);
        const [summaryRes, benchRes, insightsRes] = await Promise.all([
          fetch('/api/dataset/summary'),
          fetch('/api/models/benchmarks'),
          fetch('/api/insights')
        ]);

        if (summaryRes.ok && benchRes.ok && insightsRes.ok) {
          const sData = await summaryRes.json();
          const bData = await benchRes.json();
          const iData = await insightsRes.json();

          if (mounted) {
            setDatasetSummary(sData);
            setModelBenchmarks(bData);
            setInsights(iData.findings || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial dataset metadata:', err);
      } finally {
        if (mounted) setIsLoadingSummary(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const analyzeRepository = useCallback(async (url: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Failed to analyze repository' }));
        throw new Error(errorData.detail || `Server returned ${res.status}`);
      }

      const data: AnalysisResponse = await res.json();
      setAnalysisData(data);
      return data;
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during repository analysis.';
      setAnalysisError(msg);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analysisData,
    setAnalysisData,
    isAnalyzing,
    analysisError,
    setAnalysisError,
    datasetSummary,
    modelBenchmarks,
    insights,
    isLoadingSummary,
    analyzeRepository
  };
}
