import React from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card = ({ children, className, title }: CardProps) => (
  <div className={cn("bg-white border border-[#d1d1d1] shadow-sm", className)}>
    {title && (
      <div className="px-3 py-2 border-b border-[#efefef]">
        <h3 className="text-[13px] font-bold text-[#3c4043] tracking-tight">{title}</h3>
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
);

export const Scorecard = ({ title, value, trend, isPositive, icon }: {
  title: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-col items-start px-4 py-2 border-r border-[#efefef] last:border-r-0 min-w-[120px] group transition-colors hover:bg-slate-50">
    <div className="flex items-center gap-2 mb-1">
      {icon && <div className="p-1.5 bg-slate-100 rounded-md group-hover:bg-white transition-colors">{icon}</div>}
      <span className="text-[12px] text-[#70757a] font-normal whitespace-nowrap">{title}</span>
    </div>
    <span className="text-2xl font-normal text-[#3c4043] leading-tight">{value}</span>
    {trend && (
      <div className={cn("flex items-center gap-1 mt-1 text-[11px] font-medium", isPositive ? "text-[#188038]" : "text-[#d93025]")}>
        {isPositive ? '▲' : '▼'} {trend}
      </div>
    )}
  </div>
);
