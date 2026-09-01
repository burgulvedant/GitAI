import { useState } from 'react';
import { Search, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

interface RepositoryUrlInputProps {
  onAnalyze: (url: string) => Promise<any>;
  isAnalyzing: boolean;
  error: string | null;
  onClearError: () => void;
}

const SAMPLE_REPOS = [
  { label: 'facebook/react', url: 'https://github.com/facebook/react' },
  { label: 'fastapi/fastapi', url: 'https://github.com/fastapi/fastapi' },
  { label: 'rust-lang/rust', url: 'https://github.com/rust-lang/rust' },
  { label: 'microsoft/vscode', url: 'https://github.com/microsoft/vscode' },
  { label: 'golang/go', url: 'https://github.com/golang/go' }
];

export const RepositoryUrlInput: React.FC<RepositoryUrlInputProps> = ({
  onAnalyze,
  isAnalyzing,
  error,
  onClearError
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      await onAnalyze(url.trim());
    } catch {
      // Handled via error prop
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    onClearError();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-3.5 relative z-10">
      {/* Primary URL Input Form */}
      <form onSubmit={handleSubmit} className="w-full relative group">
        <div className="relative flex items-center rounded-2xl bg-white/90 backdrop-blur-2xl border border-slate-200/90 p-1.5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 focus-within:border-teal-500 focus-within:shadow-[0_8px_35px_-4px_rgba(20,184,166,0.22)]">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-4 h-4 group-focus-within:text-teal-600 transition-colors" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) onClearError();
            }}
            placeholder="Paste a public GitHub repository URL (e.g. https://github.com/facebook/react)"
            className="w-full bg-transparent px-2 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            disabled={isAnalyzing || !url.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_16px_-2px_rgba(20,184,166,0.35)] flex items-center gap-2 shrink-0"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Repository
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="w-full px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 backdrop-blur-md shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Sample Repository Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
        <span className="text-xs text-slate-500">
          Try sample:
        </span>
        {SAMPLE_REPOS.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            className="px-2.5 py-1 text-xs rounded-lg bg-white/80 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 transition-all font-normal shadow-2xs"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
