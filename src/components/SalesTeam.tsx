import React, { useMemo, useState, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell
} from 'recharts';
import { Card, Scorecard } from './DashboardUI';
import { Transaction } from '../data/transactions';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { parse, format, startOfMonth } from 'date-fns';
import { Trophy, TrendingUp, Users, Target, ListFilter, X } from 'lucide-react';

const TEAL_PRIMARY = '#00A99D';
const TEAL_SECONDARY = '#80CBC4';
const TEAL_DARK = '#00796B';
const COLORS = [TEAL_PRIMARY, TEAL_SECONDARY, TEAL_DARK, '#B2DFDB', '#E0F2F1', '#4285f4', '#FBBC04', '#EA4335'];

export const SalesTeam = ({ data }: { data: Transaction[] }) => {
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  
  const totalOverallRevenue = useMemo(() => data.reduce((acc, t) => acc + t.productPrice, 0) || 1, [data]);
  const totalDeals = data.length;

  const teamStats = useMemo(() => {
    const stats = data.reduce((acc: any[], t) => {
      const existing = acc.find(i => i.name === t.userName);
      if (existing) {
        existing.revenue += t.productPrice;
        existing.deals += 1;
        existing.newClients += t.clientType === 'NEW' ? 1 : 0;
        existing.upgradeClients += t.clientType === 'UPGRADE' ? 1 : 0;
      } else {
        acc.push({ 
          name: t.userName, 
          team: t.team,
          revenue: t.productPrice, 
          deals: 1,
          newClients: t.clientType === 'NEW' ? 1 : 0,
          upgradeClients: t.clientType === 'UPGRADE' ? 1 : 0
        });
      }
      return acc;
    }, []).map(s => ({
      ...s,
      avgTicket: s.deals > 0 ? s.revenue / s.deals : 0,
      share: (s.revenue / totalOverallRevenue) * 100
    })).sort((a, b) => b.revenue - a.revenue);
    return stats;
  }, [data, totalOverallRevenue]);

  const maxRevenue = Math.max(...teamStats.map(s => s.revenue), 1);
  const maxDeals = Math.max(...teamStats.map(s => s.deals), 1);

  // Monthly Trend per Rep
  const monthlyTrend = useMemo(() => {
    const trendMap = data.reduce((acc: any, t) => {
      const date = parse(t.date, 'dd-MM-yyyy', new Date());
      const monthKey = format(startOfMonth(date), 'MMM yyyy');
      const rep = t.userName;
      
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey, dateObj: startOfMonth(date) };
      acc[monthKey][rep] = (acc[monthKey][rep] || 0) + t.productPrice;
      return acc;
    }, {});

    return Object.values(trendMap).sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [data]);

  const topReps = teamStats.slice(0, 5).map(s => s.name);

  const filteredTransactions = useMemo(() => {
    if (!selectedRep) return [];
    return data.filter(t => t.userName === selectedRep);
  }, [data, selectedRep]);

  const handleChartClick = (state: any) => {
    if (state && state.activeLabel) {
      setSelectedRep(state.activeLabel);
    }
  };

  return (
    <div className="flex flex-col gap-8 bg-white">
      {/* Page Header / Instruction */}
      <div className="border-l-4 border-[#00A99D] pl-4 py-2 bg-[#f8f9fa]">
        <p className="text-[12px] italic text-[#5f6368]">
          "Build a ‘Sales Team’ page that lets me compare executives on revenue, deal count, avg ticket, and NEW vs UPGRADE mix, over any date range."
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Scorecard 
          title="Top Performer" 
          value={teamStats[0]?.name || 'N/A'} 
          trend="Leader" 
          isPositive={true} 
          icon={<Trophy className="w-4 h-4 text-[#FBBC04]" />}
        />
        <Scorecard 
          title="Avg Rev / Rep" 
          value={formatCurrency(totalOverallRevenue / (teamStats.length || 1))} 
          trend="Overall" 
          isPositive={true} 
          icon={<TrendingUp className="w-4 h-4 text-[#00A99D]" />}
        />
        <Scorecard 
          title="Avg Deals / Rep" 
          value={formatNumber(totalDeals / (teamStats.length || 1))} 
          trend="Efficiency" 
          isPositive={true} 
          icon={<Target className="w-4 h-4 text-[#EA4335]" />}
        />
        <Scorecard 
          title="Total Active Reps" 
          value={formatNumber(teamStats.length)} 
          trend="Team Size" 
          isPositive={true} 
          icon={<Users className="w-4 h-4 text-[#4285f4]" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-[#70757a] mb-4 uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Revenue by Team Member
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={teamStats.slice(0, 10)} 
                  layout="vertical" 
                  margin={{ left: 20 }}
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} width={80} />
                  <Tooltip cursor={{fill: '#f8f9fa'}} formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="revenue" fill={TEAL_PRIMARY} barSize={15} radius={[0, 4, 4, 0]} className="cursor-pointer">
                    {teamStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={selectedRep === entry.name ? TEAL_DARK : (index === 0 ? TEAL_DARK : TEAL_PRIMARY)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-[#70757a] mb-4 uppercase tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4" /> Number of Sales by Team Member
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={teamStats.slice(0, 10)} 
                  layout="vertical" 
                  margin={{ left: 20 }}
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} width={80} />
                  <Tooltip cursor={{fill: '#f8f9fa'}} formatter={(v: number) => formatNumber(v)} />
                  <Bar dataKey="deals" fill={TEAL_SECONDARY} barSize={15} radius={[0, 4, 4, 0]} className="cursor-pointer">
                    {teamStats.map((entry, index) => (
                      <Cell 
                        key={`cell-deals-${index}`} 
                        fill={selectedRep === entry.name ? TEAL_DARK : TEAL_SECONDARY} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="text-[13px] font-bold text-[#70757a] mb-4 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Monthly Revenue Trend per Rep (Top 5)
          </h3>
          <div className="h-[530px] bg-[#f8f9fa] p-4 rounded-lg border border-[#dadce0]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dee2e6" />
                <XAxis dataKey="month" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '20px'}} />
                {topReps.map((rep, i) => (
                  <Line 
                    key={rep} 
                    type="monotone" 
                    dataKey={rep} 
                    stroke={COLORS[i % COLORS.length]} 
                    strokeWidth={selectedRep === rep ? 5 : 3} 
                    dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Drill-through Table */}
      {selectedRep && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b-2 border-[#00A99D] pb-1">
            <h3 className="text-[14px] font-bold text-[#3c4043] uppercase flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-[#00A99D]" /> Transactions for {selectedRep}
            </h3>
            <button 
              onClick={() => setSelectedRep(null)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="overflow-x-auto shadow-sm rounded-lg border border-[#dadce0]">
            <table className="w-full text-[12px] text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#dadce0]">
                  <th className="p-3 font-bold text-[#5f6368] uppercase">Date</th>
                  <th className="p-3 font-bold text-[#5f6368] uppercase">Client</th>
                  <th className="p-3 font-bold text-[#5f6368] uppercase">Product</th>
                  <th className="p-3 font-bold text-[#5f6368] uppercase">Type</th>
                  <th className="p-3 font-bold text-[#5f6368] uppercase text-right">Value</th>
                  <th className="p-3 font-bold text-[#5f6368] uppercase">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efefef]">
                {filteredTransactions.map((t, i) => (
                  <tr key={i} className="hover:bg-[#f1f3f4]">
                    <td className="p-3">{t.date}</td>
                    <td className="p-3 font-medium">{t.clientName}</td>
                    <td className="p-3">{t.productName}</td>
                    <td className="p-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        t.clientType === 'NEW' ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
                      )}>
                        {t.clientType}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#00A99D]">{formatCurrency(t.productPrice)}</td>
                    <td className="p-3 text-[#70757a]">{t.paymentMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-[#00A99D] pb-1">
          <h3 className="text-[14px] font-bold text-[#3c4043] uppercase flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FBBC04]" /> Sales Performance Leaderboard
          </h3>
          <span className="text-[10px] font-bold text-[#70757a] uppercase">Sorted by Total Revenue</span>
        </div>
        
        <div className="overflow-x-auto shadow-sm rounded-lg border border-[#dadce0]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dadce0] bg-[#f8f9fa]">
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase sticky left-0 bg-[#f8f9fa] z-10 w-12 text-center">Rank</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase sticky left-12 bg-[#f8f9fa] z-10">Team Member</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase text-right">Deals</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase text-right">Total Revenue</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase text-right">Avg Ticket</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase text-right">NEW</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase text-right">UPGRADE</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase text-right">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {teamStats.map((s, i) => (
                <tr 
                  key={i} 
                  className={cn(
                    "hover:bg-[#f1f3f4] text-[12px] text-[#3c4043] transition-colors cursor-pointer",
                    selectedRep === s.name ? "bg-[#e0f2f1]" : ""
                  )}
                  onClick={() => setSelectedRep(s.name === selectedRep ? null : s.name)}
                >
                  <td className="p-3 text-center font-bold text-[#70757a] sticky left-0 bg-inherit">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="p-3 font-medium sticky left-12 bg-inherit">
                    <div className="flex flex-col">
                      <span>{s.name}</span>
                      <span className="text-[10px] text-[#70757a] uppercase tracking-wider">{s.team}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono">
                    <span className={cn(
                      "px-2 py-1 rounded",
                      s.deals >= maxDeals * 0.8 ? "bg-emerald-50 text-emerald-700 font-bold" : ""
                    )}>
                      {s.deals}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-[#00A99D]">{formatCurrency(s.revenue)}</span>
                      <div className="w-24 h-1 bg-[#efefef] rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00A99D] h-full" 
                          style={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono">{formatCurrency(s.avgTicket)}</td>
                  <td className="p-3 text-right">
                    <span className="text-emerald-600 font-bold">{s.newClients}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-indigo-600 font-bold">{s.upgradeClients}</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-[#5f6368]">{s.share.toFixed(1)}%</span>
                      <div className="w-8 h-8 rounded-full border-2 border-[#efefef] flex items-center justify-center text-[9px] font-bold text-[#00A99D]">
                        {Math.round(s.share)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
