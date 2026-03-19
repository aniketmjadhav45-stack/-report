import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { Card, Scorecard } from './DashboardUI';
import { Transaction } from '../data/transactions';
import { formatCurrency, formatNumber } from '../lib/utils';
import { CreditCard, Wallet, AlertCircle, CheckCircle2, BarChart3, PieChart as PieIcon, Info } from 'lucide-react';

const TEAL_PRIMARY = '#00A99D';
const COLORS = [TEAL_PRIMARY, '#4285f4', '#FBBC04', '#EA4335', '#8e24aa', '#00796B'];

export const Payments = ({ data }: { data: Transaction[] }) => {
  // 1. Calculate KPIs
  const metrics = useMemo(() => {
    const totalDeals = data.length;
    const partPaymentDeals = data.filter(t => t.paymentType === 'Part Payment' || t.paymentType === 'Token Payment');
    const partPaymentPercent = (partPaymentDeals.length / totalDeals) * 100;
    
    const totalPending = data.reduce((acc, t) => acc + (t.productPrice - t.valueReceived), 0);
    
    const modeCounts = data.reduce((acc: any, t) => {
      acc[t.paymentMode] = (acc[t.paymentMode] || 0) + 1;
      return acc;
    }, {});
    
    const topMode = Object.entries(modeCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      partPaymentPercent,
      totalPending,
      topMode,
      totalDeals,
      partPaymentCount: partPaymentDeals.length
    };
  }, [data]);

  // 2. Revenue & Count by Payment Mode
  const modeData = useMemo(() => {
    const stats = data.reduce((acc: any, t) => {
      if (!acc[t.paymentMode]) {
        acc[t.paymentMode] = { mode: t.paymentMode, revenue: 0, count: 0 };
      }
      acc[t.paymentMode].revenue += t.productPrice;
      acc[t.paymentMode].count += 1;
      return acc;
    }, {});
    return Object.values(stats).sort((a: any, b: any) => b.revenue - a.revenue);
  }, [data]);

  // 3. Part Payment Table Data
  const partPayments = useMemo(() => {
    return data
      .filter(t => t.paymentType === 'Part Payment' || t.paymentType === 'Token Payment' || (t.productPrice - t.valueReceived > 0))
      .map(t => ({
        ...t,
        pending: t.productPrice - t.valueReceived
      }))
      .filter(t => t.pending > 0)
      .sort((a, b) => b.pending - a.pending);
  }, [data]);

  return (
    <div className="flex flex-col gap-8 bg-white p-6">
      {/* Page Header / Instruction */}
      <div className="border-l-4 border-[#00A99D] pl-4 py-3 bg-[#f8f9fa] rounded-r-lg">
        <p className="text-[13px] italic text-[#5f6368] font-medium">
          "I want to easily see what % of deals are part payments, how much balance is pending, and which channels/modes we rely on."
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Scorecard 
          title="Part Payment %" 
          value={`${metrics.partPaymentPercent.toFixed(1)}%`} 
          trend={`${metrics.partPaymentCount} Deals`} 
          isPositive={metrics.partPaymentPercent < 20} 
          icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
        />
        <Scorecard 
          title="Total Pending" 
          value={formatCurrency(metrics.totalPending)} 
          trend="Balance Owed" 
          isPositive={metrics.totalPending < 100000} 
          icon={<Wallet className="w-4 h-4 text-rose-500" />}
        />
        <Scorecard 
          title="Top Payment Mode" 
          value={metrics.topMode} 
          trend="Highest Volume" 
          isPositive={true} 
          icon={<CreditCard className="w-4 h-4 text-[#4285f4]" />}
        />
        <Scorecard 
          title="Full Payments" 
          value={formatNumber(data.filter(t => t.paymentType === 'Full Payment' || t.paymentType === 'Final Payment').length)} 
          trend="Completed" 
          isPositive={true} 
          icon={<CheckCircle2 className="w-4 h-4 text-[#00A99D]" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Revenue by Payment Mode */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-4 uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00A99D]" /> Revenue by Payment Mode
          </h3>
          <div className="h-[350px] bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f3f4" />
                <XAxis type="number" tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <YAxis dataKey="mode" type="category" tick={{fontSize: 10}} axisLine={false} tickLine={false} width={100} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill={TEAL_PRIMARY} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Count by Mode */}
        <div className="col-span-12 lg:col-span-5 flex flex-col">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-4 uppercase tracking-tight flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#4285f4]" /> Transaction Volume by Mode
          </h3>
          <div className="h-[350px] bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="mode"
                  stroke="none"
                >
                  {modeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Part Payment Tracking Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-rose-500 pb-2">
          <h3 className="text-[15px] font-bold text-[#3c4043] uppercase flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" /> Part-Payment & Pending Balance Tracking
          </h3>
          <div className="flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Total Pending:</span>
            <span className="text-[13px] font-bold text-rose-700">{formatCurrency(metrics.totalPending)}</span>
          </div>
        </div>
        
        <div className="overflow-hidden shadow-md rounded-xl border border-[#dadce0]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dadce0] bg-[#f8f9fa]">
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Client & Team</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Product Price</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Value Received</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Balance Pending</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {partPayments.length > 0 ? (
                partPayments.map((t, i) => (
                  <tr key={i} className="hover:bg-rose-50/30 text-[13px] text-[#3c4043] transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold group-hover:text-rose-600 transition-colors">{t.clientName}</span>
                        <span className="text-[11px] text-[#70757a]">Rep: {t.userName} ({t.team})</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono text-[#5f6368]">{formatCurrency(t.productPrice)}</td>
                    <td className="p-4 text-right font-mono text-[#00A99D] font-medium">{formatCurrency(t.valueReceived)}</td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-rose-600">{formatCurrency(t.pending)}</span>
                        <div className="w-20 h-1 bg-[#e8eaed] rounded-full overflow-hidden">
                          <div 
                            className="bg-rose-500 h-full" 
                            style={{ width: `${(t.pending / t.productPrice) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#70757a] italic">
                        <Info className="w-3 h-3" />
                        {t.paymentType === 'Token Payment' ? 'Token received, awaiting balance' : 'Partial payment received'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#70757a] italic">
                    No pending part-payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
