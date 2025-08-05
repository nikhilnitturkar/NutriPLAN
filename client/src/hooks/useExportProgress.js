import { useState } from 'react';

const useExportProgress = () => {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);

  const startExport = () => {
    setExporting(true);
    setExportProgress(0);
    setShowExportModal(true);
  };

  const updateProgress = (progress) => {
    setExportProgress(progress);
  };

  const completeExport = () => {
    setExportProgress(100);
    setTimeout(() => {
      setShowExportModal(false);
      setExporting(false);
    }, 700);
  };

  const animateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5; // random increment for realism
      if (progress >= 90) progress = 90; // cap at 90% until done
      setExportProgress(Math.floor(progress));
    }, 200);
    return interval;
  };

  const handleExportWithProgress = async (exportFunction) => {
    startExport();
    const interval = animateProgress();
    
    try {
      await exportFunction();
      clearInterval(interval);
      completeExport();
    } catch (error) {
      clearInterval(interval);
      completeExport();
      throw error; // Re-throw so the calling component can handle the error
    }
  };

  return {
    exporting,
    exportProgress,
    showExportModal,
    startExport,
    updateProgress,
    completeExport,
    animateProgress,
    handleExportWithProgress
  };
};

export default useExportProgress; 