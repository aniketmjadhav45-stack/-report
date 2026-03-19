import React from 'react';
import { Filters, getUniqueValues } from '../services/dataService';
import { Transaction } from '../data/transactions';
import { Calendar, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

export const FilterBar = ({ filters, setFilters, data }: { filters: Filters; setFilters: (f: Filters) => void; data: Transaction[] }) => {
  const teams = getUniqueValues('team', data);
  const products = getUniqueValues('productName', data);
  const clientTypes = getUniqueValues('clientType', data);
  const paymentTypes = getUniqueValues('paymentType', data);
  const cities = getUniqueValues('city', data);
  const genders = getUniqueValues('gender', data);

  const handleChange = (key: keyof Filters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setFilters({
      dateRange: { start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) },
      team: '',
      product: '',
      clientType: '',
      paymentType: '',
      city: '',
      gender: '',
    });
  };

  return (
    <div className="bg-white border-b border-[#dadce0] sticky top-0 z-10 px-8 py-3 flex flex-wrap items-center gap-3 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded border border-[#dadce0] hover:border-[#70757a] cursor-pointer transition-colors">
        <Calendar className="w-3.5 h-3.5 text-[#5f6368]" />
        <span className="text-[12px] text-[#3c4043]">
          {format(filters.dateRange.start, 'MMM d')} - {format(filters.dateRange.end, 'MMM d, yyyy')}
        </span>
      </div>

      <select 
        className="text-[12px] bg-white border border-[#dadce0] rounded px-3 py-1.5 outline-none focus:border-[#4285f4] text-[#3c4043] min-w-[140px]"
        value={filters.team}
        onChange={(e) => handleChange('team', e.target.value)}
      >
        <option value="">Team: All</option>
        {teams.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <select 
        className="text-[12px] bg-white border border-[#dadce0] rounded px-3 py-1.5 outline-none focus:border-[#4285f4] text-[#3c4043] min-w-[140px]"
        value={filters.product}
        onChange={(e) => handleChange('product', e.target.value)}
      >
        <option value="">Product: All</option>
        {products.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <select 
        className="text-[12px] bg-white border border-[#dadce0] rounded px-3 py-1.5 outline-none focus:border-[#4285f4] text-[#3c4043] min-w-[140px]"
        value={filters.clientType}
        onChange={(e) => handleChange('clientType', e.target.value)}
      >
        <option value="">Client Type: All</option>
        {clientTypes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select 
        className="text-[12px] bg-white border border-[#dadce0] rounded px-3 py-1.5 outline-none focus:border-[#4285f4] text-[#3c4043] min-w-[140px]"
        value={filters.paymentType}
        onChange={(e) => handleChange('paymentType', e.target.value)}
      >
        <option value="">Payment: All</option>
        {paymentTypes.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <select 
        className="text-[12px] bg-white border border-[#dadce0] rounded px-3 py-1.5 outline-none focus:border-[#4285f4] text-[#3c4043] min-w-[140px]"
        value={filters.city}
        onChange={(e) => handleChange('city', e.target.value)}
      >
        <option value="">City: All</option>
        {cities.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select 
        className="text-[12px] bg-white border border-[#dadce0] rounded px-3 py-1.5 outline-none focus:border-[#4285f4] text-[#3c4043] min-w-[140px]"
        value={filters.gender}
        onChange={(e) => handleChange('gender', e.target.value)}
      >
        <option value="">Gender: All</option>
        {genders.map(g => <option key={g} value={g}>{g}</option>)}
      </select>

      <button 
        onClick={resetFilters}
        className="ml-auto text-[11px] font-bold text-[#4285f4] hover:underline uppercase tracking-wider"
      >
        Reset Filters
      </button>
    </div>
  );
};
