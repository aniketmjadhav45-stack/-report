import { Transaction, rawData } from '../data/transactions';
import { parse, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';

export interface Filters {
  dateRange: { start: Date; end: Date };
  team: string;
  product: string;
  clientType: string;
  paymentType: string;
  city: string;
  gender: string;
}

export const getFilteredData = (filters: Filters, data: Transaction[]): Transaction[] => {
  return data.filter((t) => {
    const tDate = parse(t.date, 'dd-MM-yyyy', new Date());
    
    const inDateRange = isWithinInterval(tDate, {
      start: startOfDay(filters.dateRange.start),
      end: endOfDay(filters.dateRange.end),
    });

    const matchesTeam = !filters.team || t.team === filters.team;
    const matchesProduct = !filters.product || t.productName === filters.product;
    const matchesClientType = !filters.clientType || t.clientType === filters.clientType;
    const matchesPaymentType = !filters.paymentType || t.paymentType === filters.paymentType;
    const matchesCity = !filters.city || t.city === filters.city;
    const matchesGender = !filters.gender || t.gender === filters.gender;

    return inDateRange && matchesTeam && matchesProduct && matchesClientType && matchesPaymentType && matchesCity && matchesGender;
  });
};

export const getUniqueValues = (key: keyof Transaction, data: Transaction[]) => {
  const values = data.map((t) => t[key] as string);
  return Array.from(new Set(values)).filter(Boolean).sort();
};
