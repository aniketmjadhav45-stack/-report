import React, { useState } from 'react';
import { X, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetUrl: string;
  onSave: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, sheetUrl, onSave }) => {
  const [url, setUrl] = useState(sheetUrl);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (inputUrl: string) => {
    if (!inputUrl) return true;
    
    // Check if it's a standard Google Sheet link instead of a CSV export
    if (inputUrl.includes('docs.google.com/spreadsheets') && !inputUrl.includes('export?format=csv') && !inputUrl.includes('pub?output=csv')) {
      setError("This looks like a standard Google Sheet link. Please use the 'Publish to web' CSV link instead.");
      return false;
    }

    try {
      new URL(inputUrl);
      setError(null);
      return true;
    } catch (e) {
      setError("Please enter a valid URL.");
      return false;
    }
  };

  const handleSave = () => {
    if (validateUrl(url)) {
      onSave(url);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard Settings</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Google Sheet CSV URL
                  <Info className="w-4 h-4 text-gray-400 cursor-help" title="The URL must be a publicly accessible CSV export link." />
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all text-sm ${
                    error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">How to get the correct link:</p>
                  <ol className="text-xs text-gray-600 space-y-2 list-decimal pl-4">
                    <li>Open your Google Sheet.</li>
                    <li>Go to <strong>File</strong> &gt; <strong>Share</strong> &gt; <strong>Publish to web</strong>.</li>
                    <li>Select <strong>Entire Document</strong> (or a specific sheet) and <strong>Comma-separated values (.csv)</strong>.</li>
                    <li>Click <strong>Publish</strong> and copy the generated link.</li>
                  </ol>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex gap-3">
                  <ExternalLink className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">Why use a proxy?</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      We've implemented a server-side proxy to bypass common connection issues (CORS). 
                      This ensures your dashboard stays connected even when browsers try to block the direct link.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
