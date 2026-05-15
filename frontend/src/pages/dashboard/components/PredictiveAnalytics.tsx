import React from 'react';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface ProjectionData {
  category: string;
  currentStock: number;
  projectedDemand: number;
  risk: 'low' | 'medium' | 'high';
}

const PROJECTIONS: ProjectionData[] = [
  { category: 'Classic Tuxedos', currentStock: 42, projectedDemand: 58, risk: 'high' },
  { category: 'Wedding Suits', currentStock: 85, projectedDemand: 72, risk: 'low' },
  { category: 'Slim Fit Suits', currentStock: 15, projectedDemand: 28, risk: 'high' },
  { category: 'Accessories', currentStock: 120, projectedDemand: 150, risk: 'medium' },
];

export const PredictiveAnalytics: React.FC = () => {
  return (
    <div className="card p-6 bg-gradient-to-br from-surface-card to-surface-bg border-none shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-tux-gold/20 flex items-center justify-center text-tux-gold">
          <SvgIcon name="dashboard" width="20" height="20" />
        </div>
        <div>
          <h3 className="font-display text-[1.1rem] text-text-primary m-0">Predictive Demand</h3>
          <p className="text-[0.7rem] text-text-muted m-0">Next 14-day inventory forecast</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {PROJECTIONS.map((p) => (
          <div key={p.category} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[0.8rem] font-semibold text-text-primary">{p.category}</span>
              <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                p.risk === 'high' ? 'bg-status-error/10 text-status-error' :
                p.risk === 'medium' ? 'bg-status-warning/10 text-status-warning' :
                'bg-status-success/10 text-status-success'
              }`}>
                {p.risk} risk
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-surface-border rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    p.risk === 'high' ? 'bg-status-error' :
                    p.risk === 'medium' ? 'bg-status-warning' :
                    'bg-tux-navy'
                  }`}
                  style={{ width: `${Math.min(100, (p.currentStock / p.projectedDemand) * 100)}%` }}
                />
              </div>
              <div className="flex flex-col items-end shrink-0 min-w-[50px]">
                <span className="text-[0.75rem] font-bold text-text-primary">{p.currentStock}</span>
                <span className="text-[0.6rem] text-text-muted">vs {p.projectedDemand} needed</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-surface-border">
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-status-info/5 border border-status-info/10">
          <SvgIcon name="warning" width="16" height="16" className="text-status-info mt-0.5 shrink-0" />
          <p className="text-[0.72rem] text-text-secondary leading-relaxed m-0">
            <strong>AI Insight:</strong> Prom demand for <span className="font-bold text-text-primary">Slim Fit Suits</span> is tracking 45% higher than last year. Restock recommended.
          </p>
        </div>
      </div>
    </div>
  );
};
