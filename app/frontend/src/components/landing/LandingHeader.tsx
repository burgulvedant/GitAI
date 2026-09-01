import { Activity, ArrowRight } from 'lucide-react';

interface LandingHeaderProps {
  onOpenDashboard: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onOpenDashboard }) => {
  return (
    <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
      {/* Brand Logo & Wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md">
          <Activity className="w-4 h-4 text-white stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-slate-900">
            GitAI
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-slate-600 border border-slate-200/80 shadow-xs">
            v1.0
          </span>
        </div>
      </div>

      {/* Minimal Landing Action */}
      <button
        onClick={onOpenDashboard}
        className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-full transition-all flex items-center gap-1.5 shadow-xs"
      >
        <span>Open Dashboard</span>
        <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
      </button>
    </header>
  );
};
