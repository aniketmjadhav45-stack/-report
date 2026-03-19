import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Card, Scorecard } from './DashboardUI';
import { Transaction } from '../data/transactions';
import { formatCurrency, formatNumber } from '../lib/utils';
import { parse, format, startOfMonth, isAfter, isBefore } from 'date-fns';
import { Users, UserPlus, ArrowUpCircle, Heart, TrendingUp, BarChart3, Filter, UserCheck, PieChart as PieIcon } from 'lucide-react';

const TEAL_PRIMARY = '#00A99D';
const TEAL_SECONDARY = '#80CBC4';
const TEAL_DARK = '#00796B';
const COLORS = [TEAL_PRIMARY, '#4285f4', '#FBBC04', '#EA4335', TEAL_SECONDARY, TEAL_DARK, '#B2DFDB', '#E0F2F1'];

export const Clients = ({ data }: { data: Transaction[] }) => {
  // 1. Aggregate Client Stats (LTV, First/Last Purchase)
  const clientStats = useMemo(() => {
    const stats = data.reduce((acc: any, t) => {
      const key = t.email || t.mobile;
      if (!acc[key]) {
        acc[key] = { 
          name: t.clientName,
          email: t.email,
          mobile: t.mobile,
          transactions: 0, 
          ltv: 0, 
          firstPurchase: t.date,
          latestPurchase: t.date,
          firstPurchaseDate: parse(t.date, 'dd-MM-yyyy', new Date()),
          latestPurchaseDate: parse(t.date, 'dd-MM-yyyy', new Date()),
          types: new Set(),
          city: t.city,
          gender: t.gender
        };
      }
      
      const currentFirst = acc[key].firstPurchaseDate;
      const currentLatest = acc[key].latestPurchaseDate;
      const tDate = parse(t.date, 'dd-MM-yyyy', new Date());

      if (isBefore(tDate, currentFirst)) {
        acc[key].firstPurchase = t.date;
        acc[key].firstPurchaseDate = tDate;
      }
      if (isAfter(tDate, currentLatest)) {
        acc[key].latestPurchase = t.date;
        acc[key].latestPurchaseDate = tDate;
      }

      acc[key].transactions += 1;
      acc[key].ltv += t.productPrice;
      acc[key].types.add(t.clientType);
      return acc;
    }, {});

    return Object.values(stats).sort((a: any, b: any) => b.ltv - a.ltv);
  }, [data]);

  const totalUnique = clientStats.length;
  const totalRevenue = data.reduce((acc, t) => acc + t.productPrice, 0);

  // 2. Funnel Logic: NEW -> UPGRADE
  const funnelMetrics = useMemo(() => {
    const newClients = clientStats.filter((c: any) => c.types.has('NEW'));
    const newThenUpgrade = newClients.filter((c: any) => c.types.has('UPGRADE'));
    const upgradeRevenueFromNew = data
      .filter(t => t.clientType === 'UPGRADE' && newClients.some(nc => nc.email === t.email))
      .reduce((acc, t) => acc + t.productPrice, 0);

    return {
      totalNew: newClients.length,
      convertedToUpgrade: newThenUpgrade.length,
      conversionRate: newClients.length > 0 ? (newThenUpgrade.length / newClients.length) * 100 : 0,
      upgradeRevenue: upgradeRevenueFromNew
    };
  }, [clientStats, data]);

  // 3. Time Series: NEW vs UPGRADE vs RENEWAL
  const typeTrendData = useMemo(() => {
    const trendMap = data.reduce((acc: any, t) => {
      const date = parse(t.date, 'dd-MM-yyyy', new Date());
      const monthKey = format(startOfMonth(date), 'MMM yyyy');
      const type = t.clientType || 'OTHER';
      
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey, dateObj: startOfMonth(date), NEW: 0, UPGRADE: 0, RENEWAL: 0 };
      acc[monthKey][type] = (acc[monthKey][type] || 0) + t.productPrice;
      acc[monthKey][`${type}_count`] = (acc[monthKey][`${type}_count`] || 0) + 1;
      return acc;
    }, {});

    return Object.values(trendMap).sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [data]);

  // 4. Client Type Mix for Pie
  const clientTypeMix = useMemo(() => {
    const counts = data.reduce((acc: any, t) => {
      acc[t.clientType] = (acc[t.clientType] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="flex flex-col gap-8 bg-white p-6">
      {/* Page Header / Instruction */}
      <div className="border-l-4 border-[#00A99D] pl-4 py-3 bg-[#f8f9fa] rounded-r-lg">
        <p className="text-[13px] italic text-[#5f6368] font-medium">
          "A client-centric page that shows NEW vs UPGRADE revenue over time and a client LTV table (aggregated by client email/phone)."
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Scorecard 
          title="Total Unique Clients" 
          value={formatNumber(totalUnique)} 
          trend="Lifetime" 
          isPositive={true} 
          icon={<Users className="w-4 h-4 text-[#4285f4]" />}
        />
        <Scorecard 
          title="Average LTV" 
          value={formatCurrency(totalRevenue / totalUnique)} 
          trend="Per Client" 
          isPositive={true} 
          icon={<Heart className="w-4 h-4 text-rose-500" />}
        />
        <Scorecard 
          title="New Client Base" 
          value={formatNumber(funnelMetrics.totalNew)} 
          trend="Acquisition" 
          isPositive={true} 
          icon={<UserPlus className="w-4 h-4 text-[#00A99D]" />}
        />
        <Scorecard 
          title="Upgrade Conversion" 
          value={`${funnelMetrics.conversionRate.toFixed(1)}%`} 
          trend="NEW to UPGRADE" 
          isPositive={true} 
          icon={<ArrowUpCircle className="w-4 h-4 text-indigo-500" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Revenue by Client Type Over Time */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-4 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00A99D]" /> Revenue Mix Over Time (NEW vs UPGRADE)
          </h3>
          <div className="h-[350px] bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={typeTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} tickFormatter={(v) => `₹${v/1000}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '20px'}} />
                <Area type="monotone" dataKey="NEW" stackId="1" stroke="#00A99D" fill="#00A99D" fillOpacity={0.6} />
                <Area type="monotone" dataKey="UPGRADE" stackId="1" stroke="#4285f4" fill="#4285f4" fillOpacity={0.6} />
                <Area type="monotone" dataKey="RENEWAL" stackId="1" stroke="#FBBC04" fill="#FBBC04" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upgrade Funnel Visual */}
        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-4 uppercase tracking-tight flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-500" /> Upgrade Funnel
          </h3>
          <div className="flex flex-col gap-4 bg-[#f8f9fa] p-6 rounded-xl border border-[#dadce0] h-full justify-center">
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-teal-100 shadow-sm">
              <span className="text-[11px] font-bold text-[#5f6368] uppercase mb-1">Total New Clients</span>
              <span className="text-2xl font-bold text-[#00A99D]">{formatNumber(funnelMetrics.totalNew)}</span>
            </div>
            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-slate-300"></div>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-indigo-100 shadow-sm relative">
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {funnelMetrics.conversionRate.toFixed(1)}%
              </div>
              <span className="text-[11px] font-bold text-[#5f6368] uppercase mb-1">Later Upgraded</span>
              <span className="text-2xl font-bold text-indigo-600">{formatNumber(funnelMetrics.convertedToUpgrade)}</span>
            </div>
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-indigo-700 uppercase">Upgrade Revenue</span>
                <span className="text-[14px] font-bold text-indigo-700">{formatCurrency(funnelMetrics.upgradeRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Deal Count Over Time */}
        <div className="bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-6 uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#FBBC04]" /> Deal Volume by Type
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                <Bar dataKey="NEW_count" name="New" fill="#00A99D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="UPGRADE_count" name="Upgrade" fill="#4285f4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Type Mix */}
        <div className="bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-6 uppercase tracking-tight flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#EA4335]" /> Overall Client Type Mix
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientTypeMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {clientTypeMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '11px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Client LTV Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-[#00A99D] pb-2">
          <h3 className="text-[15px] font-bold text-[#3c4043] uppercase flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#00A99D]" /> Client Lifetime Value (LTV) Table
          </h3>
          <span className="text-[10px] font-bold text-[#70757a] uppercase tracking-wider">Aggregated by Email/Mobile</span>
        </div>
        
        <div className="overflow-hidden shadow-md rounded-xl border border-[#dadce0]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dadce0] bg-[#f8f9fa]">
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Client Details</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">First Purchase</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Latest Purchase</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-center">Transactions</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Lifetime Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {clientStats.slice(0, 25).map((c: any, i: number) => (
                <tr key={i} className="hover:bg-[#f8f9fa] text-[13px] text-[#3c4043] transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold group-hover:text-[#00A99D] transition-colors">{c.name}</span>
                      <span className="text-[11px] text-[#70757a]">{c.email || c.mobile}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[#5f6368]">{c.firstPurchase}</td>
                  <td className="p-4 font-mono text-[#5f6368]">{c.latestPurchase}</td>
                  <td className="p-4 text-center font-mono font-bold">
                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">{c.transactions}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-[#00A99D]">{formatCurrency(c.ltv)}</span>
                      <div className="w-24 h-1.5 bg-[#e8eaed] rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00A99D] h-full" 
                          style={{ width: `${(c.ltv / clientStats[0].ltv) * 100}%` }}
                        ></div>
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
