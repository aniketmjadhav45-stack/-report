import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Card, Scorecard } from './DashboardUI';
import { Transaction } from '../data/transactions';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { parse, format, startOfMonth } from 'date-fns';
import { Package, Tag, TrendingUp, ArrowUpCircle, BarChart3, PieChart as PieIcon, Layers, ListFilter, X } from 'lucide-react';

const TEAL_PRIMARY = '#00A99D';
const TEAL_SECONDARY = '#80CBC4';
const TEAL_DARK = '#00796B';
const COLORS = [TEAL_PRIMARY, '#4285f4', '#FBBC04', '#EA4335', TEAL_SECONDARY, TEAL_DARK, '#B2DFDB', '#E0F2F1'];

export const Products = ({ data }: { data: Transaction[] }) => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  
  const totalRevenue = useMemo(() => data.reduce((acc, t) => acc + t.productPrice, 0), [data]);
  const totalValueReceived = useMemo(() => data.reduce((acc, t) => acc + t.valueReceived, 0), [data]);
  
  const productStats = useMemo(() => {
    const stats = data.reduce((acc: any[], t) => {
      const productName = t.productName || 'Unknown';
      
      // Derive plan and tenure from productName
      let planType = 'PRO';
      if (productName.includes('CFO')) planType = 'CFO';
      if (productName.includes('Special Offer')) planType = 'SPECIAL';
      if (productName.includes('Webinar')) planType = 'WEBINAR';
      if (productName.includes('UPGRADE')) planType = 'UPGRADE';

      let tenure = '1 MONTH';
      if (productName.includes('ANNUAL') || productName.includes('1 YR')) tenure = 'ANNUAL';
      if (productName.includes('2 YRS')) tenure = '2 YRS';
      if (productName.includes('QUARTERLY') || productName.includes('3 MONTHS')) tenure = 'QUARTERLY';

      const existing = acc.find(i => i.name === productName);
      if (existing) {
        existing.revenue += t.productPrice;
        existing.valueReceived += t.valueReceived;
        existing.sales += 1;
      } else {
        acc.push({ 
          name: productName, 
          planType,
          tenure,
          revenue: t.productPrice, 
          valueReceived: t.valueReceived,
          sales: 1
        });
      }
      return acc;
    }, []).map(s => ({
      ...s,
      avgListPrice: s.revenue / s.sales,
      avgRealizedPrice: s.valueReceived / s.sales,
      discount: ((s.revenue - s.valueReceived) / s.revenue) * 100
    })).sort((a, b) => b.revenue - a.revenue);
    return stats;
  }, [data]);

  const planStats = useMemo(() => {
    return productStats.reduce((acc: any[], p) => {
      const existing = acc.find(i => i.name === p.planType);
      if (existing) {
        existing.value += p.revenue;
        existing.count += p.sales;
      } else {
        acc.push({ name: p.planType, value: p.revenue, count: p.sales });
      }
      return acc;
    }, []).sort((a, b) => b.value - a.value);
  }, [productStats]);

  const tenureStats = useMemo(() => {
    return productStats.reduce((acc: any[], p) => {
      const existing = acc.find(i => i.name === p.tenure);
      if (existing) {
        existing.value += p.revenue;
        existing.count += p.sales;
      } else {
        acc.push({ name: p.tenure, value: p.revenue, count: p.sales });
      }
      return acc;
    }, []).sort((a, b) => b.value - a.value);
  }, [productStats]);

  const timeSeriesData = useMemo(() => {
    const trendMap = data.reduce((acc: any, t) => {
      const date = parse(t.date, 'dd-MM-yyyy', new Date());
      const monthKey = format(startOfMonth(date), 'MMM yyyy');
      const productName = t.productName;
      
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey, dateObj: startOfMonth(date) };
      acc[monthKey][productName] = (acc[monthKey][productName] || 0) + t.productPrice;
      return acc;
    }, {});

    return Object.values(trendMap).sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [data]);

  const upgradeVsBase = useMemo(() => {
    const upgradeRev = data.filter(t => t.clientType === 'UPGRADE').reduce((acc, t) => acc + t.productPrice, 0);
    const baseRev = totalRevenue - upgradeRev;
    return [
      { name: 'Base Products', value: baseRev },
      { name: 'Upgrades', value: upgradeRev }
    ];
  }, [data, totalRevenue]);

  const topProducts = productStats.slice(0, 5).map(p => p.name);
  const maxRevenue = Math.max(...productStats.map(s => s.revenue), 1);

  const filteredTransactions = useMemo(() => {
    if (!selectedProduct) return [];
    return data.filter(t => t.productName === selectedProduct);
  }, [data, selectedProduct]);

  const handleChartClick = (state: any) => {
    if (state && state.activeLabel) {
      setSelectedProduct(state.activeLabel);
    }
  };

  return (
    <div className="flex flex-col gap-8 bg-white p-6">
      {/* Page Header / Instruction */}
      <div className="border-l-4 border-[#00A99D] pl-4 py-3 bg-[#f8f9fa] rounded-r-lg">
        <p className="text-[13px] italic text-[#5f6368] font-medium">
          "I want to see which plans sell most, their realized price vs list price, and how that evolves over time."
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Scorecard 
          title="Gross List Revenue" 
          value={formatCurrency(totalRevenue)} 
          trend="Total Potential" 
          isPositive={true} 
          icon={<Layers className="w-4 h-4 text-[#00A99D]" />}
        />
        <Scorecard 
          title="Net Realized Value" 
          value={formatCurrency(totalValueReceived)} 
          trend="Actual Inflow" 
          isPositive={true} 
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
        />
        <Scorecard 
          title="Avg Discount/Tax" 
          value={`${((totalRevenue - totalValueReceived) / totalRevenue * 100).toFixed(1)}%`} 
          trend="Revenue Leakage" 
          isPositive={false} 
          icon={<Tag className="w-4 h-4 text-red-500" />}
        />
        <Scorecard 
          title="Top Product Share" 
          value={`${((productStats[0]?.revenue / totalRevenue) * 100).toFixed(1)}%`} 
          trend={productStats[0]?.name.split(' ')[0]} 
          isPositive={true} 
          icon={<Package className="w-4 h-4 text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Time Series Chart */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[#3c4043] uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00A99D]" /> Revenue Evolution by Product
            </h3>
            <div className="flex gap-2">
              <span className="text-[10px] px-2 py-1 bg-[#f1f3f4] rounded text-[#5f6368] font-bold uppercase">Monthly Trend</span>
            </div>
          </div>
          <div className="h-[400px] bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  {COLORS.map((color, i) => (
                    <linearGradient key={i} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis 
                  dataKey="month" 
                  tick={{fontSize: 10, fill: '#5f6368'}} 
                  axisLine={{stroke: '#dadce0'}}
                  tickLine={false}
                />
                <YAxis 
                  tick={{fontSize: 10, fill: '#5f6368'}} 
                  tickFormatter={(v) => `₹${v/1000}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']} 
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '20px'}} />
                {topProducts.map((name, i) => (
                  <Area 
                    key={name} 
                    type="monotone" 
                    dataKey={name} 
                    stackId="1" 
                    stroke={COLORS[i % COLORS.length]} 
                    fill={`url(#color${i % COLORS.length})`} 
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Metrics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="flex flex-col">
            <h3 className="text-[14px] font-bold text-[#3c4043] mb-4 uppercase tracking-tight flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-[#4285f4]" /> Upgrade vs Base Revenue
            </h3>
            <div className="h-[220px] bg-white p-4 rounded-xl border border-[#dadce0] shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={upgradeVsBase}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={TEAL_PRIMARY} />
                    <Cell fill="#4285f4" />
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#f8f9fa] p-5 rounded-xl border border-[#dadce0]">
            <h4 className="text-[12px] font-bold text-[#3c4043] mb-4 uppercase flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00A99D]" /> Revenue by Plan Type
            </h4>
            <div className="space-y-4">
              {planStats.map((plan, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-semibold text-[#3c4043]">{plan.name}</span>
                    <span className="text-[#5f6368] font-mono">{formatCurrency(plan.value)}</span>
                  </div>
                  <div className="w-full bg-[#e8eaed] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#00A99D] h-full transition-all duration-500" 
                      style={{ width: `${(plan.value / planStats[0].value) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drill-through Table */}
      {selectedProduct && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b-2 border-[#00A99D] pb-1">
            <h3 className="text-[14px] font-bold text-[#3c4043] uppercase flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-[#00A99D]" /> Transactions for {selectedProduct}
            </h3>
            <button 
              onClick={() => setSelectedProduct(null)}
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
                  <th className="p-3 font-bold text-[#5f6368] uppercase">Team Member</th>
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
                    <td className="p-3">{t.userName}</td>
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

      {/* Secondary Row: Tenure & Volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-6 uppercase tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FBBC04]" /> Subscriptions by Tenure
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenureStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f3f4" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: '#3c4043'}} width={100} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8f9fa'}} formatter={(v: number) => formatNumber(v)} />
                <Bar dataKey="count" fill="#FBBC04" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-6 uppercase tracking-tight flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#EA4335]" /> Revenue Share by Plan
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {planStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-[#00A99D] pb-2">
          <h3 className="text-[15px] font-bold text-[#3c4043] uppercase flex items-center gap-2">
            <Package className="w-5 h-5 text-[#00A99D]" /> Product Performance & Pricing Analysis
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] text-[#5f6368] font-bold uppercase">Healthy Margin</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-[10px] text-[#5f6368] font-bold uppercase">High Discount</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden shadow-md rounded-xl border border-[#dadce0]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dadce0] bg-[#f8f9fa]">
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Product Description</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-center">Sales</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Total Revenue</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Avg List Price</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Avg Realized</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-center">Disc/Tax %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {productStats.map((s, i) => (
                <tr 
                  key={i} 
                  className={cn(
                    "hover:bg-[#f8f9fa] text-[13px] text-[#3c4043] transition-colors group cursor-pointer",
                    selectedProduct === s.name ? "bg-[#e0f2f1]" : ""
                  )}
                  onClick={() => setSelectedProduct(s.name === selectedProduct ? null : s.name)}
                >
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold group-hover:text-[#00A99D] transition-colors">{s.name}</span>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold uppercase tracking-tight">{s.planType}</span>
                        <span className="text-[9px] px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full font-bold uppercase tracking-tight">{s.tenure}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono font-medium">{formatNumber(s.sales)}</td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-bold text-[#00A99D]">{formatCurrency(s.revenue)}</span>
                      <div className="w-20 h-1.5 bg-[#e8eaed] rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00A99D] h-full" 
                          style={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-[#70757a]">{formatCurrency(s.avgListPrice)}</td>
                  <td className="p-4 text-right font-bold text-[#3c4043]">{formatCurrency(s.avgRealizedPrice)}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full font-bold text-[11px] min-w-[60px] text-center",
                        s.discount > 15 ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      )}>
                        {s.discount.toFixed(1)}%
                      </span>
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
