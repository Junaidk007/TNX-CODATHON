import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { apiRequest } from '../services/api';

export const AdminImportModal = ({ isOpen, onClose, onImportSuccess, token }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a .xlsx or .csv file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiRequest('/admin/teams/import', {
        method: 'POST',
        data: formData,
        token,
      });

      setResult(data);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setError(err.message || 'Failed to import file. Please verify format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#121212] border border-[var(--border)] hud-frame w-full max-w-xl p-5 sm:p-6 shadow-2xl relative text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--red)] text-white flex items-center justify-center font-bold rounded">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wide text-white">
                Import Finalist Dataset
              </h3>
              <p className="text-xs text-neutral-400 mono">Unstop Candidate Batch Importer (.xlsx / .csv)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone */}
        {!result && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-8 text-center transition-colors rounded ${
              file
                ? 'border-[var(--red2)] bg-red-950/20'
                : 'border-neutral-700 hover:border-[var(--red2)] bg-black/40'
            }`}
          >
            <UploadCloud className="w-10 h-10 text-[var(--red2)] mx-auto mb-3" />
            <p className="text-sm font-bold uppercase text-white mb-1">
              {file ? file.name : 'Select or Drop Finalist File (.xlsx, .csv)'}
            </p>
            <p className="text-xs text-neutral-400 mono mb-4">Groups candidate rows automatically by Regn ID</p>
            <label className="btn btn-primary text-xs cursor-pointer">
              <span>Choose Spreadsheet</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs mono flex items-start gap-2 rounded">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Result View */}
        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-950/30 border border-green-800 text-green-300 flex items-start gap-3 rounded">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Batch Import Completed Successfully</p>
                <p className="text-xs mono mt-1">
                  Imported {result.teamsCount || 0} teams and {result.usersCount || 0} participants.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mono text-xs text-center">
              <div className="bg-black/50 p-3 border border-[var(--border)] rounded">
                <div className="text-neutral-400 text-[10px]">TOTAL ROWS</div>
                <div className="text-lg font-bold text-white mt-1">{result.totalRows || 0}</div>
              </div>
              <div className="bg-black/50 p-3 border border-[var(--border)] rounded">
                <div className="text-neutral-400 text-[10px]">TEAMS CREATED</div>
                <div className="text-lg font-bold text-[var(--red2)] mt-1">{result.teamsCreated || 0}</div>
              </div>
              <div className="bg-black/50 p-3 border border-[var(--border)] rounded">
                <div className="text-neutral-400 text-[10px]">TEAMS UPDATED</div>
                <div className="text-lg font-bold text-neutral-200 mt-1">{result.teamsUpdated || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="btn btn-ghost text-xs"
          >
            {result ? 'Close' : 'Cancel'}
          </button>

          {!result && (
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="btn btn-primary text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Processing...</span>
                </>
              ) : (
                'Confirm & Import →'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
