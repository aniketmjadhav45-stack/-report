import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Card, Scorecard } from './DashboardUI';
import { Transaction } from '../data/transactions';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { 
  parse, isAfter, startOfDay, format, differenceInDays, addDays, 
  isBefore, startOfMonth, endOfMonth, eachMonthOfInterval, addMonths,
  isWithinInterval
} from 'date-fns';
import { 
  Calendar, Clock, AlertCircle, CheckCircle2, 
  BarChart3, PieChart as PieIcon, TrendingUp, History 
} from 'lucide-react';

const TEAL_PRIMARY = '#00A99D';
const TEAL_SECONDARY = '#80CBC4';
const TEAL_DARK = '#00796B';
const COLORS = [TEAL_PRIMARY, '#4285f4', '#FBBC04', '#EA4335', TEAL_SECONDARY, TEAL_DARK, '#B2DFDB', '#E0F2F1'];

export const Renewals = ({ data }: { data: Transaction[] }) => {
  const today = startOfDay(new Date());
  const endOfWeek = addDays(today, 7);
  const endOfMonthDate = endOfMonth(today);
  
  // 1. Active Subscriptions Today
  const activeToday = useMemo(() => data.filter(t => {
    const toDate = parse(t.toDate, 'dd-MM-yyyy', new Date());
    const fromDate = parse(t.fromDate, 'dd-MM-yyyy', new Date());
    return !isAfter(fromDate, today) && !isBefore(toDate, today);
  }), [data, today]);

  // 2. Expiring this week/month
  const expiringThisWeek = useMemo(() => data.filter(t => {
    const toDate = parse(t.toDate, 'dd-MM-yyyy', new Date());
    return isAfter(toDate, today) && !isAfter(toDate, endOfWeek);
  }), [data, today, endOfWeek]);

  const expiringThisMonth = useMemo(() => data.filter(t => {
    const toDate = parse(t.toDate, 'dd-MM-yyyy', new Date());
    return isAfter(toDate, today) && !isAfter(toDate, endOfMonthDate);
  }), [data, today, endOfMonthDate]);

  const valueAtRisk = expiringThisMonth.reduce((acc, t) => acc + t.productPrice, 0);

  // 3. Expected Active Count per Month (Next 6 Months)
  const expectedActiveTrend = useMemo(() => {
    const months = eachMonthOfInterval({
      start: today,
      end: addMonths(today, 5)
    });

    return months.map(month => {
      const mStart = startOfMonth(month);
      const mEnd = endOfMonth(month);
      const activeCount = data.filter(t => {
        const from = parse(t.fromDate, 'dd-MM-yyyy', new Date());
        const to = parse(t.toDate, 'dd-MM-yyyy', new Date());
        return !isAfter(from, mEnd) && !isBefore(to, mStart);
      }).length;

      return {
        month: format(month, 'MMM yyyy'),
        count: activeCount
      };
    });
  }, [data, today]);

  // 4. Renewal Calendar (Expirations by Month)
  const renewalCalendar = useMemo(() => {
    const trendMap = data.reduce((acc: any, t) => {
      const toDate = parse(t.toDate, 'dd-MM-yyyy', new Date());
      const monthKey = format(startOfMonth(toDate), 'MMM yyyy');
      
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey, count: 0, value: 0, dateObj: startOfMonth(toDate) };
      acc[monthKey].count += 1;
      acc[monthKey].value += t.productPrice;
      return acc;
    }, {});

    return Object.values(trendMap)
      .sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime())
      .filter((i: any) => isAfter(i.dateObj, addMonths(today, -1))); // Show current and future
  }, [data, today]);

  // 5. Tenure Analysis
  const tenureAnalysis = useMemo(() => {
    const buckets = [
      { name: '1 Month', min: 0, max: 31, count: 0 },
      { name: '3 Months', min: 32, max: 95, count: 0 },
      { name: '6 Months', min: 96, max: 185, count: 0 },
      { name: '1 Year', min: 186, max: 370, count: 0 },
      { name: '2+ Years', min: 371, max: Infinity, count: 0 },
    ];

    data.forEach(t => {
      const from = parse(t.fromDate, 'dd-MM-yyyy', new Date());
      const to = parse(t.toDate, 'dd-MM-yyyy', new Date());
      const days = differenceInDays(to, from);
      const bucket = buckets.find(b => days >= b.min && days <= b.max);
      if (bucket) bucket.count += 1;
    });

    return buckets;
  }, [data]);

  // 6. Cohort View (Starts by Month)
  const cohortData = useMemo(() => {
    const trendMap = data.reduce((acc: any, t) => {
      const fromDate = parse(t.fromDate, 'dd-MM-yyyy', new Date());
      const monthKey = format(startOfMonth(fromDate), 'MMM yyyy');
      
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey, totalValue: 0, count: 0, dateObj: startOfMonth(fromDate) };
      acc[monthKey].totalValue += t.productPrice;
      acc[monthKey].count += 1;
      return acc;
    }, {});

    return Object.values(trendMap).sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [data]);

  return (
    <div className="flex flex-col gap-8 bg-white p-6">
      {/* Page Header / Instruction */}
      <div className="border-l-4 border-[#00A99D] pl-4 py-3 bg-[#f8f9fa] rounded-r-lg">
        <p className="text-[13px] italic text-[#5f6368] font-medium">
          "Build a ‘Renewals’ page where I can see how many subscriptions are active right now, what is expiring this week/month, and the value at risk."
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Scorecard 
          title="Active Subscriptions" 
          value={formatNumber(activeToday.length)} 
          trend="Current" 
          isPositive={true} 
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        />
        <Scorecard 
          title="Expiring (7 Days)" 
          value={formatNumber(expiringThisWeek.length)} 
          trend="Immediate" 
          isPositive={false} 
          icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
        />
        <Scorecard 
          title="Expiring (30 Days)" 
          value={formatNumber(expiringThisMonth.length)} 
          trend="Near Term" 
          isPositive={false} 
          icon={<Calendar className="w-4 h-4 text-rose-500" />}
        />
        <Scorecard 
          title="Value at Risk" 
          value={formatCurrency(valueAtRisk)} 
          trend="30d Potential" 
          isPositive={false} 
          icon={<TrendingUp className="w-4 h-4 text-rose-500" />}
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Expected Active Trend */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-4 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00A99D]" /> Expected Active Subscriptions Trend
          </h3>
          <div className="h-[350px] bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expectedActiveTrend}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TEAL_PRIMARY} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={TEAL_PRIMARY} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke={TEAL_PRIMARY} fillOpacity={1} fill="url(#colorActive)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenure Histogram */}
        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-4 uppercase tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-[#4285f4]" /> Subscription Tenure Analysis
          </h3>
          <div className="h-[350px] bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenureAnalysis} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f3f4" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 10}} width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8f9fa'}} />
                <Bar dataKey="count" fill="#4285f4" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Renewal Calendar */}
        <div className="bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-6 uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#EA4335]" /> Renewal Calendar (Expirations)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={renewalCalendar}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#EA4335" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort View */}
        <div className="bg-white p-6 rounded-xl border border-[#dadce0] shadow-sm">
          <h3 className="text-[14px] font-bold text-[#3c4043] mb-6 uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#FBBC04]" /> Cohort View (Starts by Month)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                <XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="step" dataKey="totalValue" stroke="#FBBC04" fill="#FBBC04" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-[#00A99D] pb-2">
          <h3 className="text-[15px] font-bold text-[#3c4043] uppercase flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00A99D]" /> Subscription & Renewal Pipeline
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] text-[#5f6368] font-bold uppercase">Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-[10px] text-[#5f6368] font-bold uppercase">Expiring Soon</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
              <span className="text-[10px] text-[#5f6368] font-bold uppercase">Expired</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden shadow-md rounded-xl border border-[#dadce0]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dadce0] bg-[#f8f9fa]">
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Client & Product</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">Expiry Date</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Days Left</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-right">Value</th>
                <th className="p-4 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {data.sort((a, b) => {
                const dateA = parse(a.toDate, 'dd-MM-yyyy', new Date());
                const dateB = parse(b.toDate, 'dd-MM-yyyy', new Date());
                return dateA.getTime() - dateB.getTime();
              }).map((t, i) => {
                const toDate = parse(t.toDate, 'dd-MM-yyyy', new Date());
                const daysRemaining = differenceInDays(toDate, today);
                const isActive = daysRemaining > 0;
                const isUpcoming = daysRemaining > 0 && daysRemaining <= 30;
                
                return (
                  <tr key={i} className="hover:bg-[#f8f9fa] text-[13px] text-[#3c4043] transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold group-hover:text-[#00A99D] transition-colors">{t.clientName}</span>
                        <span className="text-[11px] text-[#70757a]">{t.productName}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[#5f6368]">{t.toDate}</td>
                    <td className="p-4 text-right">
                      <span className={cn(
                        "font-mono font-bold",
                        daysRemaining <= 0 ? 'text-rose-500' : daysRemaining <= 30 ? 'text-amber-500' : 'text-emerald-500'
                      )}>
                        {daysRemaining > 0 ? daysRemaining : 0}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold">{formatCurrency(t.productPrice)}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold border min-w-[80px] text-center",
                          isUpcoming ? "bg-amber-50 text-amber-600 border-amber-100" :
                          isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                          "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          {isUpcoming ? 'UPCOMING' : isActive ? 'ACTIVE' : 'EXPIRED'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
