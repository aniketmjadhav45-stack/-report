import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { Overview } from './components/Overview';
import { SalesTeam } from './components/SalesTeam';
import { Products } from './components/Products';
import { Renewals } from './components/Renewals';
import { Clients } from './components/Clients';
import { Payments } from './components/Payments';
import { Geography } from './components/Geography';
import { GoogleSheetView } from './components/GoogleSheetView';
import { SettingsModal } from './components/SettingsModal';
import { Filters, getFilteredData } from './services/dataService';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Edit3, MoreVertical, RefreshCw, Download, Bell, Settings } from 'lucide-react';
import { cn, exportToCSV } from './lib/utils';
import { fetchGoogleSheetData } from './services/googleSheetService';
import { rawData as initialData, Transaction } from './data/transactions';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'google_sheet_url';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_GOOGLE_SHEET_URL || '';
  });
  const [data, setData] = useState<Transaction[]>(initialData);
  const [newlyAddedCount, setNewlyAddedCount] = useState(0);
  const [lastAddedRows, setLastAddedRows] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>({
    dateRange: { start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) },
    team: '',
    product: '',
    clientType: '',
    paymentType: '',
    city: '',
    gender: '',
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshData = useCallback(async (isAuto = false) => {
    if (!sheetUrl) {
      if (!isAuto) showToast('Google Sheet URL not configured', 'info');
      return;
    }

    setIsRefreshing(true);
    try {
      const newData = await fetchGoogleSheetData(sheetUrl);
      if (newData.length > 0) {
        // Compare with existing data to find new rows
        const existingIds = new Set(data.map(t => t.id));
        const addedRows = newData.filter(t => !existingIds.has(t.id));
        
        if (addedRows.length > 0) {
          setNewlyAddedCount(prev => prev + addedRows.length);
          setLastAddedRows(addedRows);
          showToast(`${addedRows.length} new records found!`, 'success');
        } else if (!isAuto) {
          showToast('Data is up to date');
        }
        
        setData(newData);
      }
    } catch (error: any) {
      console.error('Refresh failed:', error);
      if (!isAuto) showToast(error.message || 'Failed to refresh data', 'info');
    } finally {
      setIsRefreshing(false);
    }
  }, [data, sheetUrl]);

  useEffect(() => {
    // Initial fetch
    refreshData(true);

    // Set up polling
    const interval = setInterval(() => {
      refreshData(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshData]);

  const handleSaveSettings = (url: string) => {
    setSheetUrl(url);
    localStorage.setItem(STORAGE_KEY, url);
    showToast('Settings saved successfully!');
  };

  const filteredData = useMemo(() => getFilteredData(filters, data), [filters, data]);

  const handleRefresh = () => {
    refreshData(false);
  };

  const handleExport = () => {
    exportToCSV(filteredData, `neotrader_sales_report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Exporting CSV...', 'success');
  };

  const handleEdit = () => {
    showToast('Edit mode is only available for administrators.', 'info');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview data={filteredData} lastAddedRows={lastAddedRows} />;
      case 'sales-team': return <SalesTeam data={filteredData} />;
      case 'products': return <Products data={filteredData} />;
      case 'renewals': return <Renewals data={filteredData} />;
      case 'clients': return <Clients data={filteredData} />;
      case 'payments': return <Payments data={filteredData} />;
      case 'geography': return <Geography data={filteredData} />;
      case 'google-sheet': return <GoogleSheetView data={filteredData} />;
      default: return <Overview data={filteredData} lastAddedRows={lastAddedRows} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f4] flex flex-col">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg text-white text-sm font-medium flex items-center gap-2",
              toast.type === 'success' ? "bg-[#188038]" : "bg-[#1a73e8]"
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Looker Top Bar */}
      <header className="h-12 bg-white border-b border-[#dadce0] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#4285f4] rounded flex items-center justify-center text-white font-bold text-lg">L</div>
          <div className="flex flex-col">
            <h1 className="text-[14px] font-medium text-[#3c4043] leading-none mb-0.5">NeoTrader Sales Performance Report</h1>
            <div className="flex items-center gap-2 text-[11px] text-[#70757a]">
              <span className="hover:bg-[#f1f3f4] px-1 rounded cursor-pointer">File</span>
              <span className="hover:bg-[#f1f3f4] px-1 rounded cursor-pointer">Edit</span>
              <span className="hover:bg-[#f1f3f4] px-1 rounded cursor-pointer">View</span>
              <span className="hover:bg-[#f1f3f4] px-1 rounded cursor-pointer">Insert</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {newlyAddedCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200 text-[11px] font-bold animate-pulse">
              <Bell className="w-3 h-3" />
              {newlyAddedCount} NEW
              <button 
                onClick={() => setNewlyAddedCount(0)}
                className="ml-1 hover:text-amber-900"
              >
                ×
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-[#3c4043] hover:bg-[#f8f9fa] rounded border border-[#dadce0]"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-[#3c4043] hover:bg-[#f8f9fa] rounded border border-[#dadce0] disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-[#3c4043] hover:bg-[#f8f9fa] rounded border border-[#dadce0]"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button 
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-1.5 text-[12px] font-medium bg-[#1a73e8] text-white hover:bg-[#1557b0] rounded shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          <MoreVertical className="w-5 h-5 text-[#5f6368] ml-2 cursor-pointer" />
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 ml-60 min-h-screen flex flex-col overflow-x-hidden">
          <div className="p-4 md:p-6 w-full max-w-[1400px] mx-auto">
            <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] min-h-[1200px] p-6 md:p-10 relative overflow-hidden">
              {/* Report Header */}
              <div className="flex flex-wrap justify-between items-start border-b-2 border-[#4285f4] pb-4 mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-normal text-[#202124] capitalize">
                    {activeTab.replace('-', ' ')}
                  </h2>
                  <p className="text-[#70757a] text-xs mt-1">
                    NeoTrader Analytics • Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest">Confidential</div>
                  <div className="text-[12px] text-[#3c4043] font-medium">Founder View</div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>

              {/* Looker Footer */}
              <div className="absolute bottom-4 left-10 right-10 flex justify-between items-center text-[10px] text-[#70757a] border-t border-[#efefef] pt-4">
                <span>Page {
                  activeTab === 'overview' ? '1' : 
                  activeTab === 'sales-team' ? '2' : 
                  activeTab === 'products' ? '3' : 
                  activeTab === 'renewals' ? '4' : 
                  activeTab === 'clients' ? '5' : 
                  activeTab === 'payments' ? '6' : 
                  activeTab === 'geography' ? '7' : 
                  activeTab === 'google-sheet' ? '8' : '1'
                } of 8</span>
                <span>Google Looker Studio Report</span>
              </div>
            </div>
          </div>
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sheetUrl={sheetUrl}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
