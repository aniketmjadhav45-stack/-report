import React from 'react';
import { Transaction } from '../data/transactions';
import { formatCurrency, formatNumber } from '../lib/utils';
import { Lightbulb, TrendingUp, Users, Target, Zap } from 'lucide-react';

export const KeyInsights = ({ data }: { data: Transaction[] }) => {
  const totalRevenue = data.reduce((acc, t) => acc + t.productPrice, 0);
  const totalValueReceived = data.reduce((acc, t) => acc + t.valueReceived, 0);
  const avgDealSize = totalRevenue / (data.length || 1);
  const newClientRatio = (data.filter(t => t.clientType === 'NEW').length / (data.length || 1)) * 100;
  const collectionRatio = (totalValueReceived / totalRevenue) * 100;
  
  const topProduct = data.reduce((acc: any, t) => {
    acc[t.productName] = (acc[t.productName] || 0) + t.productPrice;
    return acc;
  }, {});
  const bestProduct = Object.entries(topProduct).sort((a: any, b: any) => b[1] - a[1])[0];

  const topPerformer = data.reduce((acc: any, t) => {
    acc[t.userName] = (acc[t.userName] || 0) + t.productPrice;
    return acc;
  }, {});
  const bestPerformer = Object.entries(topPerformer).sort((a: any, b: any) => b[1] - a[1])[0];

  const insights = [
    {
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
      title: "Revenue Performance",
      description: `Total revenue of ${formatCurrency(totalRevenue)} achieved across ${data.length} deals, with an average deal size of ${formatCurrency(avgDealSize)}.`,
      color: "bg-emerald-50 border-emerald-100"
    },
    {
      icon: <Users className="w-4 h-4 text-blue-600" />,
      title: "Client Acquisition",
      description: `${newClientRatio.toFixed(1)}% of revenue is driven by new acquisitions, showing strong market expansion and sales momentum.`,
      color: "bg-blue-50 border-blue-100"
    },
    {
      icon: <Target className="w-4 h-4 text-purple-600" />,
      title: "Product Excellence",
      description: `${bestProduct?.[0]} remains the flagship product, contributing ${formatCurrency(bestProduct?.[1] as number)} to the total revenue.`,
      color: "bg-purple-50 border-purple-100"
    },
    {
      icon: <Zap className="w-4 h-4 text-amber-600" />,
      title: "Operational Efficiency",
      description: `Collection efficiency stands at ${collectionRatio.toFixed(1)}%, with ${bestPerformer?.[0]} leading as the top sales executive.`,
      color: "bg-amber-50 border-amber-100"
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#00A99D] p-1.5 rounded-lg shadow-sm">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-[14px] font-bold text-[#202124] uppercase tracking-tight">Executive Summary & Strategic Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className={`${insight.color} border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-center gap-2 mb-2">
              {insight.icon}
              <span className="text-[11px] font-bold text-[#3c4043] uppercase tracking-wider">{insight.title}</span>
            </div>
            <p className="text-[12px] text-[#5f6368] leading-relaxed font-medium">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
