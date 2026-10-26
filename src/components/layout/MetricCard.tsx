import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'neutral' | 'warning' | 'indigo';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  tooltip,
  badge,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const badgeColorClasses = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <div className="relative bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          {tooltip && (
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(p => !p)}
                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                aria-label="More information"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg z-50 pointer-events-none leading-relaxed">
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className="p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
          {value}
        </div>
        {badge && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              badgeColorClasses[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
