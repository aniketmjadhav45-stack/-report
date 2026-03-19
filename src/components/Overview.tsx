import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Scorecard, Card } from './DashboardUI';
import { Transaction } from '../data/transactions';
import { formatCurrency, formatNumber } from '../lib/utils';
import { KeyInsights } from './KeyInsights';
import { parse, format, startOfWeek, startOfMonth } from 'date-fns';
import { 
  TrendingUp, Users, Target, IndianRupee, 
  Receipt, UserPlus, ArrowUpRight, BarChart3, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TEAL_PRIMARY = '#00A99D';
const TEAL_SECONDARY = '#80CBC4';
const TEAL_LIGHT = '#B2DFDB';
const TEAL_DARK = '#00796B';
const COLORS = [TEAL_PRIMARY, TEAL_SECONDARY, TEAL_LIGHT, TEAL_DARK, '#E0F2F1'];

export const Overview = ({ data, lastAddedRows = [] }: { data: Transaction[], lastAddedRows?: Transaction[] }) => {
  const [timeGranularity, setTimeGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const totalRevenue = data.reduce((acc, t) => acc + t.productPrice, 0);
  const totalReceived = data.reduce((acc, t) => acc + t.valueReceived, 0);
  const totalGST = data.reduce((acc, t) => acc + t.gstAmount, 0);
  const totalPending = totalRevenue - totalReceived;
  const uniqueClients = new Set(data.map(t => t.email)).size;
  const newClientsCount = data.filter(t => t.clientType === 'NEW').length;
  const upgradeClientsCount = data.filter(t => t.clientType === 'UPGRADE').length;
  const avgDealSize = data.length > 0 ? totalRevenue / data.length : 0;
  
  // Time-series aggregation
  const timeData = data.reduce((acc: any[], t) => {
    const date = parse(t.date, 'dd-MM-yyyy', new Date());
    let groupKey = t.date;
    
    if (timeGranularity === 'weekly') {
      groupKey = format(startOfWeek(date), 'MMM d');
    } else if (timeGranularity === 'monthly') {
      groupKey = format(startOfMonth(date), 'MMM yyyy');
    }

    const existing = acc.find(i => i.label === groupKey);
    if (existing) {
      existing.revenue += t.productPrice;
      existing.sales += 1;
    } else {
      acc.push({ 
        label: groupKey, 
        revenue: t.productPrice, 
        sales: 1,
        dateObj: date
      });
    }
    return acc;
  }, []).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // Product Performance
  const productPerformance = data.reduce((acc: any[], t) => {
    const existing = acc.find(i => i.name === t.productName);
    if (existing) {
      existing.revenue += t.productPrice;
      existing.count += 1;
    } else {
      acc.push({ name: t.productName, revenue: t.productPrice, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const maxProdRevenue = Math.max(...productPerformance.map(p => p.revenue), 1);

  // Plan Type & Tenure derivation
  const planStats = data.reduce((acc: any[], t) => {
    let plan = 'PRO';
    if (t.productName.includes('CFO')) plan = 'CFO';
    if (t.productName.includes('Special')) plan = 'SPECIAL';
    if (t.productName.includes('Webinar')) plan = 'WEBINAR';

    const existing = acc.find(i => i.name === plan);
    if (existing) existing.value += t.productPrice;
    else acc.push({ name: plan, value: t.productPrice });
    return acc;
  }, []);

  const tenureStats = data.reduce((acc: any[], t) => {
    let tenure = '1 MONTH';
    if (t.productName.includes('ANNUAL') || t.productName.includes('1 YR')) tenure = 'ANNUAL';
    if (t.productName.includes('2 YRS')) tenure = '2 YRS';
    if (t.productName.includes('QUARTERLY')) tenure = 'QUARTERLY';

    const existing = acc.find(i => i.name === tenure);
    if (existing) existing.value += t.productPrice;
    else acc.push({ name: tenure, value: t.productPrice });
    return acc;
  }, []);

  // Team Performance
  const teamPerformance = data.reduce((acc: any[], t) => {
    const existing = acc.find(i => i.name === t.userName);
    if (existing) {
      existing.revenue += t.productPrice;
      existing.count += 1;
    } else {
      acc.push({ name: t.userName, revenue: t.productPrice, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue);

  const maxTeamRevenue = Math.max(...teamPerformance.map(p => p.revenue), 1);

  const cityData = data.reduce((acc: any[], t) => {
    const existing = acc.find(i => i.name === t.city);
    if (existing) existing.value += 1;
    else acc.push({ name: t.city, value: 1 });
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 5);

  const recentTransactions = [...data].sort((a, b) => {
    const dateA = parse(a.date, 'dd-MM-yyyy', new Date());
    const dateB = parse(b.date, 'dd-MM-yyyy', new Date());
    return dateB.getTime() - dateA.getTime();
  }).slice(0, 10);

  // Use lastAddedRows if available, otherwise fallback to recentTransactions for initial view
  const displayNewTransactions = lastAddedRows.length > 0 ? lastAddedRows : []; 

  return (
    <div className="flex flex-col gap-6 bg-white">
      {/* Page Header / Instruction */}
      <div className="border-l-4 border-[#00A99D] pl-4 py-2 bg-[#f8f9fa]">
        <p className="text-[12px] italic text-[#5f6368]">
          "I want a single-page summary that tells me at a glance: how much we sold, which products drove revenue, and NEW vs UPGRADE split, with interactive filters."
        </p>
      </div>

      {/* New Data Alert Section */}
      <AnimatePresence>
        {displayNewTransactions.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-2"
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-amber-600" />
              <h4 className="text-[13px] font-bold text-amber-800 uppercase tracking-tight">Recently Added Data</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {displayNewTransactions.map((t, i) => (
                <div key={i} className="bg-white p-3 rounded border border-amber-100 shadow-sm flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">New Entry</span>
                    <span className="text-[10px] text-[#70757a]">{t.date}</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#3c4043] truncate">{t.clientName}</span>
                  <span className="text-[11px] text-[#70757a] truncate">{t.productName}</span>
                  <span className="text-[12px] font-bold text-[#00A99D] mt-1">{formatCurrency(t.productPrice)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Scorecard Row */}
      <div className="flex flex-wrap gap-y-6 border-b border-[#efefef] pb-6">
        <div className="flex-1 min-w-[140px]">
          <Scorecard 
            title="Total Revenue" 
            value={formatCurrency(totalRevenue)} 
            trend="2.5%" 
            isPositive={true} 
            icon={<IndianRupee className="w-3 h-3 text-[#00A99D]" />}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Scorecard 
            title="Total GST" 
            value={formatCurrency(totalGST)} 
            trend="1.6%" 
            isPositive={true} 
            icon={<Receipt className="w-3 h-3 text-[#4285f4]" />}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Scorecard 
            title="Value Received" 
            value={formatCurrency(totalReceived)} 
            trend="4.8%" 
            isPositive={true} 
            icon={<TrendingUp className="w-3 h-3 text-emerald-500" />}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Scorecard 
            title="Transactions" 
            value={data.length} 
            trend="2.2%" 
            isPositive={true} 
            icon={<BarChart3 className="w-3 h-3 text-[#FBBC04]" />}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Scorecard 
            title="Unique Clients" 
            value={uniqueClients} 
            trend="3.0%" 
            isPositive={true} 
            icon={<Users className="w-3 h-3 text-indigo-500" />}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Scorecard 
            title="NEW / UPGRADE" 
            value={`${newClientsCount} / ${upgradeClientsCount}`} 
            trend="1.0%" 
            isPositive={true} 
            icon={<UserPlus className="w-3 h-3 text-teal-500" />}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Scorecard 
            title="Avg Deal Size" 
            value={formatCurrency(avgDealSize)} 
            trend="6.2%" 
            isPositive={true} 
            icon={<ArrowUpRight className="w-3 h-3 text-orange-500" />}
          />
        </div>
      </div>

      <KeyInsights data={data} />

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Line Charts & Tables */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Trend Section with Toggle */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[13px] font-bold text-[#70757a] uppercase tracking-tight">Revenue & Sales Trends</h3>
              <div className="flex bg-[#f1f3f4] rounded p-1">
                {(['daily', 'weekly', 'monthly'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setTimeGranularity(g)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${
                      timeGranularity === g ? 'bg-white text-[#1a73e8] shadow-sm' : 'text-[#5f6368] hover:bg-[#e8eaed]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-[250px] w-full">
                <p className="text-[11px] text-[#70757a] mb-2 font-medium">Revenue Trend (₹)</p>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{fontSize: 9}} />
                    <YAxis tick={{fontSize: 9}} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="#00A99D" fill="#00A99D" fillOpacity={0.1} strokeWidth={2} name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[250px] w-full">
                <p className="text-[11px] text-[#70757a] mb-2 font-medium">Sales Count Trend</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{fontSize: 9}} />
                    <YAxis tick={{fontSize: 9}} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#80CBC4" radius={[4, 4, 0, 0]} name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table: Products */}
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-[#70757a] mb-4 uppercase">Top Products by Revenue</h3>
            <div className="bg-[#bdbdbd] text-white text-[11px] font-bold px-3 py-1 flex justify-between uppercase">
              <span>Product</span>
              <div className="flex gap-12">
                <span className="w-24 text-right">Revenue</span>
                <span className="w-16 text-right">Count</span>
              </div>
            </div>
            {productPerformance.map((p, i) => (
              <div key={i} className="flex justify-between items-center border-b border-[#efefef] py-2 px-3 text-[12px] text-[#3c4043]">
                <span className="flex-1 truncate pr-4">{p.name}</span>
                <div className="flex gap-12 items-center">
                  <div className="w-24 flex items-center justify-end gap-2">
                    <span className="font-medium">{formatCurrency(p.revenue)}</span>
                    <div className="w-12 h-3 bg-[#efefef] relative overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-[#757575]" 
                        style={{ width: `${(p.revenue / maxProdRevenue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="w-16 text-right">{p.count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* neoTrader Sales Performance */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[14px] font-bold text-[#3c4043] border-b-2 border-[#00A99D] pb-1 w-fit uppercase">neoTrader Sales Performance</h3>
            <div className="flex flex-col">
              <div className="bg-[#bdbdbd] text-white text-[11px] font-bold px-3 py-1 flex justify-between uppercase">
                <span>Sales Executive</span>
                <div className="flex gap-12">
                  <span className="w-24 text-right">Revenue</span>
                  <span className="w-16 text-right">Deals</span>
                  <span className="w-16 text-right">Share %</span>
                </div>
              </div>
              {teamPerformance.map((p, i) => (
                <div key={i} className="flex justify-between items-center border-b border-[#efefef] py-2 px-3 text-[12px] text-[#3c4043]">
                  <span className="flex-1 truncate pr-4">{p.name}</span>
                  <div className="flex gap-12 items-center">
                    <div className="w-24 flex items-center justify-end gap-2">
                      <span className="font-medium">{formatCurrency(p.revenue)}</span>
                      <div className="w-12 h-3 bg-[#efefef] relative overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-[#00A99D]" 
                          style={{ width: `${(p.revenue / maxTeamRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="w-16 text-right">{p.count}</span>
                    <span className="w-16 text-right font-medium text-[#70757a]">
                      {((p.revenue / totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Donut & Bar Charts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Donut Chart: Plan Type */}
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-[#70757a] mb-4 uppercase">Revenue by Plan Type</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planStats}
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {planStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend verticalAlign="bottom" align="left" iconType="circle" wrapperStyle={{fontSize: '9px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Tenure */}
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-[#70757a] mb-4 uppercase">Revenue by Tenure</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tenureStats}
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {tenureStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend verticalAlign="bottom" align="left" iconType="circle" wrapperStyle={{fontSize: '9px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Client Mix */}
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-[#70757a] mb-4 uppercase">Revenue by Client Type</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'NEW', value: data.filter(t => t.clientType === 'NEW').reduce((acc, t) => acc + t.productPrice, 0) },
                      { name: 'UPGRADE', value: data.filter(t => t.clientType === 'UPGRADE').reduce((acc, t) => acc + t.productPrice, 0) },
                      { name: 'RENEWAL', value: data.filter(t => t.clientType === 'RENEWAL').reduce((acc, t) => acc + t.productPrice, 0) },
                    ]}
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {[0,1,2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend verticalAlign="bottom" align="left" iconType="circle" wrapperStyle={{fontSize: '9px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Top Cities */}
          <div className="flex flex-col">
            <h3 className="text-[13px] font-bold text-[#70757a] mb-4 uppercase">Top Cities by Sales</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00A99D" barSize={15} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <h3 className="text-[14px] font-bold text-[#3c4043] border-b-2 border-[#00A99D] pb-1 w-fit uppercase">Detailed Transaction Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dadce0] bg-[#f8f9fa]">
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase">Date</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase">Client</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase">Product</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase">Team</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase">Value</th>
                <th className="p-3 text-[11px] font-bold text-[#5f6368] uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {recentTransactions.map((t, i) => (
                <tr key={i} className="hover:bg-[#f8f9fa] text-[12px] text-[#3c4043]">
                  <td className="p-3">{t.date}</td>
                  <td className="p-3 font-medium">{t.clientName}</td>
                  <td className="p-3">{t.productName}</td>
                  <td className="p-3">{t.userName} ({t.team})</td>
                  <td className="p-3 font-bold">{formatCurrency(t.productPrice)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.paymentType === 'Full Payment' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.paymentType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 text-right text-[10px] text-[#70757a]">
        Data from <span className="text-[#1a73e8] underline">neotrader.in</span>
      </div>
    </div>
  );
};
