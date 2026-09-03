import {
  Compass,
  Sparkles,
  BrainCircuit,
  Lightbulb,
  Target,
  ArrowLeft
} from 'lucide-react';
import gitAiLogo from '../../assets/logo.png';

export type DashboardTab = 'trends' | 'analyze' | 'models' | 'insights' | 'goals';

interface NavigationBarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onBackToLanding: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onSelectTab,
  onBackToLanding
}) => {
  const tabs: Array<{ id: DashboardTab; label: string; icon: React.ReactNode }> = [
    { id: 'trends', label: 'Technology Trends', icon: <Compass className="w-4 h-4" /> },
    { id: 'analyze', label: 'Analyze', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'models', label: 'Model Benchmark', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> }
  ];

  return (
    <div className="w-full flex items-center justify-between gap-4">
      {/* Left: Home Action + GitAI Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200 transition-all shadow-2xs cursor-pointer"
          title="Return to Landing Page"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2.5">
          <img src={gitAiLogo} alt="GitAI Logo" className="w-8 h-8 object-contain" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900 tracking-tight">GitAI</span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500">
              Repository Data Science
            </span>
          </div>
        </div>
      </div>

      {/* Center: 5-Tab Navigation Pill Container */}
      <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/70 overflow-x-auto max-w-full scrollbar-none shadow-2xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Clean Badge */}
      <div className="hidden md:flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-slate-600 text-xs font-medium">
          2,520 Repositories
        </div>
      </div>
    </div>
  );
};
