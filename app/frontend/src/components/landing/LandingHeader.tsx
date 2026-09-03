import { ArrowRight } from 'lucide-react';
import gitAiLogo from '../../assets/logo.png';

interface LandingHeaderProps {
  onOpenDashboard: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onOpenDashboard }) => {
  return (
    <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10 relative">
      {/* Brand Logo & Wordmark */}
      <div className="flex items-center gap-3">
        <img src={gitAiLogo} alt="GitAI Logo" className="w-8 h-8 object-contain" />
        <span className="text-base font-semibold tracking-tight text-slate-900">
          GitAI
        </span>
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
