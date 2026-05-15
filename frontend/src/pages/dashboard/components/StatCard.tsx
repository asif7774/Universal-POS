import React from 'react';
import { StatProps } from 'types/dashboard';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { Sparkline } from './Sparkline';

export const StatCard: React.FC<StatProps> = ({ label, value, change, positive, sparkData, color, icon }) => (
  <div className="card py-5 px-6 relative overflow-hidden transition-[transform,box-shadow] duration-200 cursor-default shadow-sm hover:shadow-md hover:-translate-y-0.5">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="text-[0.7rem] font-bold text-text-muted uppercase tracking-tight mb-1">
          {label}
        </div>
        <div className="text-[1.75rem] font-extrabold text-text-primary tracking-tight">
          {value}
        </div>
      </div>
      <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: `${color}10`, color }}>
        <SvgIcon name={icon} width="20" height="20" />
      </div>
    </div>

    <div className="flex items-end justify-between gap-3">
      <div className={`text-[0.8rem] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${positive ? 'text-status-success bg-status-success/10' : 'text-status-error bg-status-error/10'}`}>
        {positive ? '↑' : '↓'} {change}
        <span className="font-normal opacity-80 text-[0.7rem]">vs last week</span>
      </div>
      <div className="flex-1 h-8 max-w-[100px]">
        <Sparkline data={sparkData} color={color} />
      </div>
    </div>
    
    {/* Subtle bottom border accent */}
    <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
  </div>
);
