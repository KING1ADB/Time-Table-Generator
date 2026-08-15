'use client';

import { useState } from 'react';
import { X, Printer, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { exportElementToPdf } from '@/lib/pdf/pdfExport';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  elementIdToExport: string;
}

export default function ExportPdfModal({
  isOpen,
  onClose,
  documentTitle,
  elementIdToExport,
}: ExportPdfModalProps) {
  const [paperSize, setPaperSize] = useState<'a3' | 'a2'>('a3');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  async function handleDownloadPdf() {
    setIsExporting(true);
    try {
      const sanitizedFilename = documentTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      await exportElementToPdf(elementIdToExport, sanitizedFilename, paperSize);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
      onClose();
    }
  }

  function handleDirectPrint() {
    onClose();
    setTimeout(() => {
      window.print();
    }, 200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Export & High-Res Print Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Formats vector PDF noticeboard prints with official MINESEC headers and signature block.
            </p>
          </div>
        </div>

        {/* Paper Size Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Select Physical Paper Format:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaperSize('a3')}
              className={`p-4 rounded-xl border text-left transition-all ${
                paperSize === 'a3'
                  ? 'bg-blue-500/15 border-blue-500/40 text-white ring-1 ring-blue-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">A3 Landscape</span>
                {paperSize === 'a3' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-[11px] opacity-80">420 × 297 mm</p>
              <p className="text-[10px] text-slate-400 mt-1">Standard Noticeboard Print</p>
            </button>

            <button
              type="button"
              onClick={() => setPaperSize('a2')}
              className={`p-4 rounded-xl border text-left transition-all ${
                paperSize === 'a2'
                  ? 'bg-blue-500/15 border-blue-500/40 text-white ring-1 ring-blue-500/50'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">A2 Landscape</span>
                {paperSize === 'a2' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-[11px] opacity-80">594 × 420 mm</p>
              <p className="text-[10px] text-slate-400 mt-1">Master Institutional Sheet</p>
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>MINESEC Official Header Included</span>
          </div>
          <p className="text-[11px] text-slate-400 pl-6">
            Includes English & French Republic headers, academic year banner, and Principal Stamp & Signature line.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating PDF...' : '📥 Download Vector PDF'}
          </button>

          <button
            type="button"
            onClick={handleDirectPrint}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            🖨️ Direct Browser Print
          </button>
        </div>
      </div>
    </div>
  );
}
