import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MetricBadgeProps {
  label: string;
  variant?: 'teal' | 'emerald' | 'cyan' | 'slate' | 'amber';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  label,
  variant = 'teal',
  size = 'md',
  icon,
  className
}) => {
  const variantStyles = {
    teal: 'bg-teal-50/90 border-teal-200/80 text-teal-800 shadow-sm',
    emerald: 'bg-emerald-50/90 border-emerald-200/80 text-emerald-800 shadow-sm',
    cyan: 'bg-cyan-50/90 border-cyan-200/80 text-cyan-800 shadow-sm',
    slate: 'bg-slate-100/90 border-slate-200 text-slate-700 shadow-sm',
    amber: 'bg-amber-50/90 border-amber-200/80 text-amber-800 shadow-sm'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-medium'
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full font-medium border backdrop-blur-md transition-colors',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      {icon && <span className="text-current opacity-90">{icon}</span>}
      {label}
    </span>
  );
};
