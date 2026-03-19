import React from 'react';
import { Transaction } from '../data/transactions';
import { formatCurrency } from '../lib/utils';
import { Table, Database, Search, Download, Filter } from 'lucide-react';

export const GoogleSheetView = ({ data }: { data: Transaction[] }) => {
  return (
    <div className="flex flex-col gap-6 bg-white p-6">
      {/* Page Header / Instruction */}
      <div className="border-l-4 border-[#00A99D] pl-4 py-3 bg-[#f8f9fa] rounded-r-lg">
        <p className="text-[13px] italic text-[#5f6368] font-medium">
          "Direct Google Sheet Data: This view displays all raw transaction data fetched from the connected Google Sheet, updated every 5 minutes."
        </p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <Database className="w-5 h-5 text-[#00A99D]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#3c4043]">Raw Google Sheet Data</h2>
            <p className="text-xs text-[#70757a]">Showing {data.length} total records from the source</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]" />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="pl-9 pr-4 py-1.5 text-xs border border-[#dadce0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A99D] w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#3c4043] border border-[#dadce0] rounded-md hover:bg-[#f8f9fa]">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#00A99D] text-white rounded-md hover:bg-[#00796B]">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-[#dadce0] rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[2000px]">
          <thead>
            <tr className="bg-[#f8f9fa] border-b border-[#dadce0] sticky top-0 z-10">
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Date</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Client Name</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Email</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Mobile</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Product</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Team</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">User</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Client Type</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">From Date</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">To Date</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Payment Mode</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Payment Type</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0] text-right">Price</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0] text-right">GST</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0] text-right">Received</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">City</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider border-r border-[#dadce0]">Gender</th>
              <th className="p-3 text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efefef]">
            {data.map((t, i) => (
              <tr key={t.id || i} className="hover:bg-[#f1f3f4] transition-colors text-[11px] text-[#3c4043]">
                <td className="p-3 border-r border-[#efefef] font-mono whitespace-nowrap">{t.date}</td>
                <td className="p-3 border-r border-[#efefef] font-bold whitespace-nowrap">{t.clientName}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">{t.email}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">{t.mobile}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">{t.productName}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">{t.team}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">{t.userName}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    t.clientType === 'NEW' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {t.clientType}
                  </span>
                </td>
                <td className="p-3 border-r border-[#efefef] font-mono whitespace-nowrap">{t.fromDate}</td>
                <td className="p-3 border-r border-[#efefef] font-mono whitespace-nowrap">{t.toDate}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">{t.paymentMode}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    t.paymentType === 'Full Payment' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {t.paymentType}
                  </span>
                </td>
                <td className="p-3 border-r border-[#efefef] text-right font-bold whitespace-nowrap">{formatCurrency(t.productPrice)}</td>
                <td className="p-3 border-r border-[#efefef] text-right whitespace-nowrap text-[#70757a]">{formatCurrency(t.gstAmount)}</td>
                <td className="p-3 border-r border-[#efefef] text-right font-bold whitespace-nowrap text-[#00A99D]">{formatCurrency(t.valueReceived)}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">{t.city}</td>
                <td className="p-3 border-r border-[#efefef] whitespace-nowrap">{t.gender}</td>
                <td className="p-3 italic text-[#70757a] max-w-[300px] truncate" title={t.remarks}>{t.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between text-[11px] text-[#70757a] mt-4">
        <p>Showing {data.length} records</p>
        <div className="flex items-center gap-4">
          <p>Source: Google Sheets CSV Export</p>
          <p>Last Sync: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};
