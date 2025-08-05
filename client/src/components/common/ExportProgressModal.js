import React from 'react';
import { Download } from 'lucide-react';

const ExportProgressModal = ({ show, progress, title = "Exporting...", message = "Please wait while we generate your file." }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 w-80 flex flex-col items-center">
        <Download className="w-10 h-10 text-green-400 mb-4 animate-bounce" />
        <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
        <div className="w-full bg-gray-800 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-white text-lg font-mono">{progress}%</div>
        <div className="text-gray-400 text-xs mt-2">{message}</div>
      </div>
    </div>
  );
};

export default ExportProgressModal; 