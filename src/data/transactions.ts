import { parse, isValid, differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';

export interface Transaction {
  id: string;
  date: string;
  team: string;
  userName: string;
  clientType: 'NEW' | 'UPGRADE' | 'RENEWAL' | 'Cross Sell';
  clientName: string;
  email: string;
  mobile: string;
  productName: string;
  fromDate: string;
  toDate: string;
  paymentMode: string;
  productPrice: number;
  gstAmount: number;
  valueReceived: number;
  paymentType: 'Full Payment' | 'Part Payment' | 'Final Payment' | 'Token Payment';
  city: string;
  gender: string;
  extraDays: number;
  remarks?: string;
}

// Helper to parse currency strings like "19,492" or "23600"
const parseCurrency = (val: string): number => {
  if (!val) return 0;
  return parseFloat(val.replace(/,/g, '')) || 0;
};

// Helper to parse dates like "01-01-2026"
const parseDate = (dateStr: string): Date => {
  return parse(dateStr, 'dd-MM-yyyy', new Date());
};

export const rawData = ([
  {
    date: "01-01-2026",
    team: "Priya",
    userName: "PRIYA",
    clientType: "UPGRADE",
    clientName: "harshal mistry",
    email: "harshalmistry1988@gmail.com",
    mobile: "9724369393",
    productName: "NEO TRADER PRO 2 YRS UPGRADE",
    fromDate: "15-09-2025",
    toDate: "27-11-2027",
    paymentMode: "CC Avenue",
    productPrice: 23000,
    gstAmount: 3508,
    valueReceived: 19492,
    paymentType: "Final Payment",
    city: "VADODRA",
    gender: "Male",
    extraDays: 60
  },
  {
    date: "02-01-2026",
    team: "Rahul",
    userName: "RAHUL",
    clientType: "NEW",
    clientName: "Amit Shah",
    email: "amit.shah@gmail.com",
    mobile: "9876543210",
    productName: "NEO TRADER LITE 1 YR",
    fromDate: "01-01-2026",
    toDate: "01-01-2027",
    paymentMode: "UPI",
    productPrice: 15000,
    gstAmount: 2700,
    valueReceived: 12300,
    paymentType: "Full Payment",
    city: "MUMBAI",
    gender: "Male",
    extraDays: 0
  },
  {
    date: "03-01-2026",
    team: "Sneha",
    userName: "SNEHA",
    clientType: "RENEWAL",
    clientName: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    mobile: "9123456789",
    productName: "NEO TRADER PRO 1 YR",
    fromDate: "03-01-2026",
    toDate: "03-01-2027",
    paymentMode: "Net Banking",
    productPrice: 18000,
    gstAmount: 3240,
    valueReceived: 14760,
    paymentType: "Full Payment",
    city: "DELHI",
    gender: "Female",
    extraDays: 30
  },
  {
    date: "04-01-2026",
    team: "Priya",
    userName: "PRIYA",
    clientType: "Cross Sell",
    clientName: "Rajesh Kumar",
    email: "rajesh.kumar@gmail.com",
    mobile: "9988776655",
    productName: "NEO TRADER PRO 3 YRS",
    fromDate: "04-01-2026",
    toDate: "04-01-2029",
    paymentMode: "Debit Card",
    productPrice: 35000,
    gstAmount: 6300,
    valueReceived: 28700,
    paymentType: "Part Payment",
    city: "BANGALORE",
    gender: "Male",
    extraDays: 90
  },
  {
    date: "05-01-2026",
    team: "Rahul",
    userName: "RAHUL",
    clientType: "NEW",
    clientName: "Suresh Raina",
    email: "suresh.raina@gmail.com",
    mobile: "8877665544",
    productName: "NEO TRADER PRO 1 YR",
    fromDate: "05-01-2026",
    toDate: "05-01-2027",
    paymentMode: "Cash",
    productPrice: 18000,
    gstAmount: 3240,
    valueReceived: 14760,
    paymentType: "Full Payment",
    city: "CHENNAI",
    gender: "Male",
    extraDays: 0
  }
].map((t, i) => ({ ...t, id: `initial-${i}` }))) as Transaction[];
