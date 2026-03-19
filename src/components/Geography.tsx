import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, ComposedChart, Line
} from 'recharts';
import { Card, Scorecard } from './DashboardUI';
import { Transaction } from '../data/transactions';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { MapPin, Users, Globe, TrendingUp, X, Filter, User, BarChart3 } from 'lucide-react';

const TEAL_PRIMARY = '#00A99D';
const TEAL_SECONDARY = '#80CBC4';
const TEAL_DARK = '#00796B';

export const Geography = ({ data }: { data: Transaction[] }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // 1. Aggregate City Stats
  const cityStats = useMemo(() => {
    const stats = data.reduce((acc: any, t) => {
      const city = t.city || 'NA';
      if (!acc[city]) {
        acc[city] = { name: city, revenue: 0, clients: new Set(), transactions: 0 };
      }
      acc[city].revenue += t.productPrice;
      acc[city].clients.add(t.email || t.mobile);
      acc[city].transactions += 1;
      return acc;
    }, {});

    return Object.values(stats)
      .map((s: any) => ({ ...s, clientCount: s.clients.size }))
      .sort((a: any, b: any) => b.revenue - a.revenue);
  }, [data]);

  // 2. Aggregate Gender Stats
  const genderStats = useMemo(() => {
    const stats = data.reduce((acc: any, t) => {
      const gender = t.gender || 'Unknown';
      if (!acc[gender]) acc[gender] = { name: gender, revenue: 0, count: 0 };
      acc[gender].revenue += t.productPrice;
      acc[gender].count += 1;
      return acc;
    }, {});
    return Object.values(stats);
  }, [data]);

  const totalRevenue = data.reduce((acc, t) => acc + t.productPrice, 0);
  const totalClients = new Set(data.map(t => t.email || t.mobile)).size;

  // 3. Filtered Table Data (Drill-through)
  const filteredTableData = useMemo(() => {
    if (!selectedCity) return data;
    return data.filter(t => t.city === selectedCity);
  }, [data, selectedCity]);

  const handleBarClick = (data: any) => {
    if (data && data.name) {
      setSelectedCity(selectedCity === data.name ? null : data.name);
    }
  };

  return (
    <div className="flex flex-col gap-8 bg-white p-6">
      {/* Page Header / Instruction */}
      <div className="border-l-4 border-[#00A99D] pl-4 py-3 bg-[#f8f9fa] rounded-r-lg">
        <p className="text-[13px] italic text-[#5f6368] font-medium">
          "Geography & demographics page: Revenue by city, number of clients by city. Drill-through: Ability to click on a bar and see the detailed transaction table filtered for that selection."
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Scorecard 
          title="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          trend="Global" 
          isPositive={true} 
          icon={<Globe className="w-4 h-4 text-[#4285f4]" />}
        />
        <Scorecard 
          title="Active Cities" 
          value={formatNumber(cityStats.length)} 
          trend="Coverage" 
          isPositive={true} 
          icon={<MapPin className="w-4 h-4 text-[#EA4335]" />}
        />
        <Scorecard 
          title="Unique Clients" 
          value={formatNumber(totalClients)} 
          trend="Total" 
          isPositive={true} 
          icon={<Users className="w-4 h-4 text-[#00A99D]" />}
        />
        <Scorecard 
          title="Top Market" 
          value={cityStats[0]?.name || 'N/A'} 
          trend="Leader" 
          isPositive={true} 
          icon={<TrendingUp className="w-4 h-4 text-indigo-500" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Revenue & Clients by City */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[#3c4043] uppercase tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00A99D]" /> Revenue & Client Count by City
            </h3>
            {selectedCity && (
              <button 
                onClick={() => setSelectedCity(null)}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 hover:bg-rose-100 transition-colors"
              >
                <X className="w-3 h-3" /> Clear Filter: {selectedCity}
              </button>
            )}
          </div>
          <div className="h-[400px] bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cityStats.slice(0, 12)} onClick={handleBarClick}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fontSize: 10}} tickFormatter={(v) => `₹${v/1000}k`} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any, name: string) => name === 'revenue' ? formatCurrency(v) : v} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '20px'}} />
                <Bar 
                  yAxisId="left" 
                  dataKey="revenue" 
                  name="Revenue" 
                  fill={TEAL_PRIMARY} 
                  radius={[4, 4, 0, 0]} 
                  barSize={35}
                  className="cursor-pointer"
                >
                  {cityStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={selectedCity === entry.name ? TEAL_DARK : TEAL_PRIMARY}
                      fillOpacity={selectedCity && selectedCity !== entry.name ? 0.3 : 1}
                    />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="clientCount" name="Clients" stroke="#4285f4" strokeWidth={3} dot={{ r: 4, fill: '#4285f4' }} />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-center text-[#70757a] mt-2 italic">Tip: Click on a bar to filter the transaction table below</p>
          </div>
        </div>

        {/* Gender Demographics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-4 uppercase tracking-tight flex items-center gap-2">
            <User className="w-4 h-4 text-[#EA4335]" /> Gender Demographics
          </h3>
          <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm h-full">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderStats}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="name"
                    stroke="none"
                  >
                    {genderStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Male' ? '#4285f4' : '#EA4335'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 mt-auto">
              <h4 className="text-[11px] font-bold text-[#5f6368] uppercase border-b border-[#efefef] pb-1">Revenue Contribution</h4>
              {genderStats.map((g, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-medium text-[#3c4043]">{g.name}</span>
                    <span className="font-bold text-[#3c4043]">{((g.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#f1f3f4] h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-500", g.name === 'Male' ? "bg-[#4285f4]" : "bg-[#EA4335]")}
                      style={{ width: `${(g.revenue / totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Transaction Table (Drill-through) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-[#00A99D] pb-2">
          <h3 className="text-[15px] font-bold text-[#3c4043] uppercase flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#00A99D]" /> Detailed Transactions {selectedCity ? `for ${selectedCity}` : '(All Cities)'}
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-[#70757a] uppercase tracking-wider">{filteredTableData.length} Transactions Found</span>
          </div>
        </div>
        
        <div className="overflow-hidden shadow-md rounded-xl border border-[#dadce0]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dadce0] bg-[#f8f9fa]">
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Date</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Client Name</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Product</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">City</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Gender</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {filteredTableData.slice(0, 20).map((t, i) => (
                <tr key={i} className="hover:bg-[#f8f9fa] text-[13px] text-[#3c4043] transition-colors group">
                  <td className="p-4 font-mono text-[#5f6368]">{t.date}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold group-hover:text-[#00A99D] transition-colors">{t.clientName}</span>
                      <span className="text-[11px] text-[#70757a]">{t.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#5f6368]">{t.productName}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[11px] font-medium",
                      selectedCity === t.city ? "bg-teal-100 text-teal-700 font-bold" : "bg-slate-100 text-slate-600"
                    )}>
                      {t.city}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[11px] font-medium",
                      t.gender === 'Male' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {t.gender}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-[#00A99D]">{formatCurrency(t.productPrice)}</td>
                </tr>
              ))}
              {filteredTableData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[#70757a] italic">No transactions found for this selection.</td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredTableData.length > 20 && (
            <div className="p-3 bg-[#f8f9fa] text-center border-t border-[#dadce0]">
              <span className="text-[11px] text-[#70757a]">Showing top 20 transactions. Use filters to narrow down.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
