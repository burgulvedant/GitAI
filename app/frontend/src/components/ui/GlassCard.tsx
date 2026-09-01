import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  activeGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverEffect = true,
  activeGlow = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-2xl bg-white/90 backdrop-blur-xl border border-black/[0.06] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-5 overflow-hidden transition-all duration-300',
          hoverEffect && 'hover:border-teal-500/30 hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-[1px]',
          activeGlow && 'border-teal-500/40 shadow-[0_4px_25px_-2px_rgba(20,184,166,0.18)]',
          className
        )
      )}
      {...props}
    >
      {/* Light specular top border */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
