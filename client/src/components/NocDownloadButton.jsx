import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, Loader2 } from 'lucide-react';
import { NocDocument } from './NocDocument';

export const NocDownloadButton = ({
  team,
  eventInfo,
  className = '',
  buttonText = 'Download Team NOC',
  variant = 'default', // 'default' | 'admin' | 'custom'
  iconOnly = false,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef(null);

  if (!team) return null;

  const handleDownloadNoc = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      // Brief delay to ensure off-screen container is laid out and images/fonts are loaded
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));

      const page1Element = document.getElementById('noc-page-1');
      const page2Element = document.getElementById('noc-page-2');

      if (!page1Element || !page2Element) {
        throw new Error('NOC document pages could not be found for rendering.');
      }

      const canvasOptions = {
        scale: 2, // High resolution (300 DPI equivalent)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
      };

      // Capture Page 1
      const canvas1 = await html2canvas(page1Element, canvasOptions);
      const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);

      // Capture Page 2
      const canvas2 = await html2canvas(page2Element, canvasOptions);
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);

      // Initialize A4 Portrait jsPDF (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Add Page 1
      pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Add Page 2
      pdf.addPage();
      pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Clean filename
      const safeRegnId = (team.regnId || 'TEAM').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeTeamName = (team.teamName || 'NOC').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `TNX-NOC-${safeRegnId}-${safeTeamName}.pdf`;

      // Trigger download
      pdf.save(fileName);
    } catch (err) {
      console.error('NOC generation failed:', err);
      alert('Failed to generate the NOC PDF. Please try again or contact support.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Default styling classes based on variant
  let btnClasses = className;
  if (variant === 'default' && !className) {
    btnClasses = 'w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs uppercase tracking-widest font-bold rounded-lg flex items-center justify-center gap-2.5 shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98] border border-purple-500/30';
  } else if (variant === 'admin' && !className) {
    btnClasses = 'px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-2 transition-all shadow-md shadow-purple-900/20';
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDownloadNoc}
        disabled={isGenerating}
        className={`${btnClasses} ${isGenerating ? 'opacity-75 cursor-wait' : ''}`}
        title={`Download official NOC for ${team.teamName}`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Generating NOC...</span>
          </>
        ) : iconOnly ? (
          <FileText className="w-4 h-4 text-purple-300" />
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Hidden off-screen render container for html2canvas */}
      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          height: 'auto',
          overflow: 'visible',
          opacity: 1,
          zIndex: -999,
          pointerEvents: 'none',
        }}
      >
        <NocDocument team={team} eventInfo={eventInfo} />
      </div>
    </>
  );
};
