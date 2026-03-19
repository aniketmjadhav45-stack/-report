import React from 'react';
import { 
  FileText,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { id: 'overview', label: '1. Executive Summary' },
  { id: 'sales-team', label: '2. Sales Performance' },
  { id: 'products', label: '3. Product Analytics' },
  { id: 'renewals', label: '4. Renewal Pipeline' },
  { id: 'clients', label: '5. Client LTV' },
  { id: 'payments', label: '6. Payment Modes' },
  { id: 'geography', label: '7. Regional Data' },
  { id: 'google-sheet', label: '8. Raw Google Sheet Data' },
];

export const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (id: string) => void }) => {
  return (
    <div className="w-60 bg-white h-[calc(100vh-48px)] fixed left-0 top-12 border-r border-[#dadce0] py-4 flex flex-col">
      <div className="px-4 mb-4">
        <h2 className="text-[11px] font-bold text-[#70757a] uppercase tracking-wider">Pages</h2>
      </div>
      
      <nav className="flex flex-col">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center justify-between px-4 py-2 text-[13px] transition-colors group",
              activeTab === item.id 
                ? "bg-[#e8f0fe] text-[#1967d2] font-medium border-r-4 border-[#1967d2]" 
                : "text-[#3c4043] hover:bg-[#f8f9fa]"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className={cn("w-4 h-4", activeTab === item.id ? "text-[#1967d2]" : "text-[#5f6368]")} />
              {item.label}
            </div>
            {activeTab === item.id && <ChevronRight className="w-3 h-3 text-[#1967d2]" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-[#efefef]">
        <div className="text-[10px] text-[#70757a] mb-2">LAST UPDATED</div>
        <div className="text-[11px] text-[#3c4043] font-medium">{new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
};
