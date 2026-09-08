import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanBarcode,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { movementService } from '../services/movementService';
import BarcodeInput from '../components/BarcodeInput';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Scanner = () => {
  const { user } = useAuth();

  // Clé dynamique liée au laboratoire connecté
  const storageKey = user?.laboratory_id
    ? `labtrack_scanner_session_lab_${user.laboratory_id}`
    : 'labtrack_scanner_session_guest';

  // Navigation tabs: 'auto' (USB Scanner)
  const [mode, setMode] = useState('auto');

  // Auto Scanner state
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');

  // INITIALISATION PARESSEUSE : empêche d'écraser localStorage par [] lors de l'actualisation (F5)
  const [scannedHistory, setScannedHistory] = useState(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error reading scanner history:", e);
      return [];
    }
  });

  // Recharger si la clé change (ex: changement d'utilisateur/labo)
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      setScannedHistory(saved ? JSON.parse(saved) : []);
    }
  }, [storageKey]);

  // Persister l'historique dans localStorage dès qu'il évolue
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(scannedHistory));
    }
  }, [scannedHistory, storageKey]);

  const formatStageName = (stage) => {
    if (!stage) return '';
    return stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();
  };

  // 1. USB Auto Scan Handler
  const handleAutoScan = async (scannedCode) => {
    const cleanedCode = scannedCode.trim();
    if (!cleanedCode) return;

    try {
      setLoading(true);
      setScanError('');
      setScanResult(null);

      setActiveStep('SEARCH');
      await new Promise((resolve) => setTimeout(resolve, 80));

      setActiveStep('STAGE');
      await new Promise((resolve) => setTimeout(resolve, 80));

      setActiveStep('MOVE');
      const response = await movementService.scanBarcode(cleanedCode);

      setActiveStep('DONE');

      const prevFormatted = formatStageName(response.previous_stage);
      const nextFormatted = formatStageName(response.new_stage);
      const confirmationText = `Sample ${response.sample_code} successfully moved from ${prevFormatted} to ${nextFormatted}.`;

      setScanResult({
        success: true,
        isFinalStage: false,
        sampleCode: response.sample_code,
        previousStage: response.previous_stage,
        newStage: response.new_stage,
        message: confirmationText,
        timestamp: new Date()
      });

      setScannedHistory((prev) => [
        {
          id: Date.now(),
          sample_code: response.sample_code,
          previous_stage: response.previous_stage,
          new_stage: response.new_stage,
          status: 'SUCCESS',
          message: confirmationText,
          timestamp: new Date().toISOString(),
          isNew: true
        },
        ...prev
      ]);

      setBarcode('');
    } catch (err) {
      console.error('Scan movement failed:', err);
      const detail = err.response?.data?.detail || 'An unexpected error occurred while processing the scan.';

      const isFinal = typeof detail === 'string' && detail.toLowerCase().includes('already reached the final stage');

      if (isFinal) {
        const finalMessage = 'This sample has already reached the final stage (STORAGE).';
        setScanResult({
          success: false,
          isFinalStage: true,
          sampleCode: cleanedCode,
          message: finalMessage,
          timestamp: new Date()
        });
        setScannedHistory((prev) => [
          {
            id: Date.now(),
            sample_code: cleanedCode,
            status: 'BLOCKED',
            message: finalMessage,
            timestamp: new Date().toISOString(),
            isNew: true
          },
          ...prev
        ]);
      } else {
        setScanError(detail);
        setScannedHistory((prev) => [
          {
            id: Date.now(),
            sample_code: cleanedCode,
            status: 'FAILED',
            message: detail,
            timestamp: new Date().toISOString(),
            isNew: true
          },
          ...prev
        ]);
      }
      setBarcode('');
    } finally {
      setLoading(false);
      setActiveStep(null);
    }
  };

  // Vider l'historique de la session manuellement
  const handleClearSession = () => {
    setScannedHistory([]);
    localStorage.removeItem(storageKey);
    setScanResult(null);
    setScanError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-emerald-600/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Header Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-r from-emerald-600 to-violet-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 shrink-0">
            <ScanBarcode className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Barcode Scanner <span className="text-emerald-400">Console</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Process samples quickly and keep every workflow transition traceable.
            </p>
          </div>
        </div>

        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto shrink-0">
          <button
            onClick={() => { setMode('auto'); setScanError(''); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              mode === 'auto'
                ? 'bg-gradient-to-r from-emerald-600 to-violet-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ScanBarcode className="h-4 w-4" />
            <span>USB Scanner</span>
          </button>
        </div>
      </div>

      {/* Mode: USB Auto Barcode Scanner */}
      {mode === 'auto' && (
        <div className="space-y-6 relative z-10">
          <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-6 space-y-5 hover:border-emerald-500/40 hover:shadow-emerald-500/5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  SAMPLE IDENTIFICATION
                </label>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Scan or enter a sample code to update its workflow status.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1.5 rounded-full shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Scanner Ready</span>
              </div>
            </div>

            <BarcodeInput
              value={barcode}
              onChange={setBarcode}
              onSubmit={handleAutoScan}
              autoFocus={true}
              keepFocused={true}
              disabled={loading}
              placeholder="Scan Code 128 (e.g. SMP-2026-000001) or type and press Enter..."
            />
          </div>

          {loading && (
            <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-5 text-center space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-center space-x-2 text-emerald-200 text-xs font-bold">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Processing Barcode Scan...</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-[11px] font-mono font-bold text-emerald-300 overflow-x-auto py-1">
                <span className={activeStep === 'SEARCH' ? 'bg-gradient-to-r from-emerald-600 to-violet-600 text-white px-2.5 py-1 rounded-md' : 'text-slate-500'}>1. SEARCH SAMPLE</span>
                <span className="text-slate-600">→</span>
                <span className={activeStep === 'STAGE' ? 'bg-gradient-to-r from-emerald-600 to-violet-600 text-white px-2.5 py-1 rounded-md' : 'text-slate-500'}>2. DETERMINE NEXT STAGE</span>
                <span className="text-slate-600">→</span>
                <span className={activeStep === 'MOVE' ? 'bg-gradient-to-r from-emerald-600 to-violet-600 text-white px-2.5 py-1 rounded-md' : 'text-slate-500'}>3. AUTO ADVANCE</span>
              </div>
            </div>
          )}

          {scanResult && scanResult.success && (
            <div className="bg-emerald-950/50 border border-emerald-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-black text-white">
                    Stage Progression Successful
                  </h3>
                  <p className="text-xs font-bold text-emerald-300 mt-1">
                    "{scanResult.message}"
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 font-mono font-bold">
                  <span className="text-slate-400">Sample:</span>
                  <Link
                    to={`/samples/${scanResult.sampleId || scanResult.sampleCode}`}
                    className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center"
                  >
                    <span>{scanResult.sampleCode}</span>
                    <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  <StatusBadge stageName={scanResult.previousStage} />
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                  <StatusBadge stageName={scanResult.newStage} />
                </div>
              </div>
            </div>
          )}

          {scanResult && scanResult.isFinalStage && (
            <div className="bg-amber-950/50 border border-amber-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex items-start space-x-3 text-amber-200">
              <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-white">Final Stage Reached</h3>
                <p className="text-xs font-bold text-amber-300 mt-1">
                  {scanResult.message}
                </p>
              </div>
            </div>
          )}

          {scanError && (
            <div className="bg-red-950/50 border border-red-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex items-start space-x-3 text-red-200">
              <AlertCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-black text-white">Scan Operation Failed</h3>
                <p className="text-xs font-bold text-red-300 mt-1">{scanError}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session Activity Logs */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md relative z-10">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <Clock className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Active Scanner Session Logs ({scannedHistory.length})
            </h2>
          </div>

          {scannedHistory.length > 0 && (
            <button
              onClick={handleClearSession}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span>Clear Session</span>
            </button>
          )}
        </div>

        {scannedHistory.length === 0 ? (
          <div className="py-12 px-6 text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <div className="p-4 bg-emerald-950/80 text-emerald-400 rounded-2xl border border-emerald-800/60 shadow-lg relative">
                <ScanBarcode className="h-7 w-7" />
              </div>
            </div>
            <h3 className="text-xs font-bold text-slate-300">Ready for Scans</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              No barcode scans processed in this session yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Time</th>
                  <th className="p-3.5">Sample Code</th>
                  <th className="p-3.5">Stage Progression</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scannedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 pl-5 text-slate-400 whitespace-nowrap font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {item.sample_code}
                    </td>
                    <td className="p-3.5">
                      {item.previous_stage && item.new_stage ? (
                        <div className="flex items-center space-x-2">
                          <StatusBadge stageName={item.previous_stage} />
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                          <StatusBadge stageName={item.new_stage} />
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] truncate max-w-xs block">
                          {item.message}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        item.status === 'SUCCESS' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' :
                        item.status === 'BLOCKED' ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' :
                        'bg-red-950/80 text-red-300 border-red-800/60'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <Link
                        to={`/samples/${item.sample_id || item.sample_code}`}
                        className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline inline-flex items-center text-[11px]"
                      >
                        <span>View Details</span>
                        <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;