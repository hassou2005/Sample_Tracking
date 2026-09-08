import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  Calendar,
  User as UserIcon,
  MapPin,
  Trash2,
  Printer,
  QrCode,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { sampleService } from '../services/sampleService';
import { movementService } from '../services/movementService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


// Standard 4 workflow stages in sequential order
const WORKFLOW_STAGES = [
  { id: 1, name: 'RECEPTION', label: 'Reception' },
  { id: 2, name: 'OVEN', label: 'Oven' },
  { id: 3, name: 'ANALYSIS', label: 'Analysis' },
  { id: 4, name: 'STORAGE', label: 'Storage' }
];

export const SampleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isTechnician } = useAuth();

  // Data state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals & Dialogs
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Move Modal Form State
  const [stages, setStages] = useState([]);
  const [locations, setLocations] = useState([]);
  const [targetStageId, setTargetStageId] = useState('');
  const [targetLocationId, setTargetLocationId] = useState('');
  const [moveComment, setMoveComment] = useState('');
  const [moveSubmitting, setMoveSubmitting] = useState(false);
  const [moveError, setMoveError] = useState('');
  const [moveSuccess, setMoveSuccess] = useState('');

  // Fetch sample and complete history
  const loadSampleData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const historyData = await sampleService.getSampleHistory(id);
      setData(historyData);
    } catch (err) {
      console.error('Failed to load sample details:', err);
      setError(
        err.response?.data?.detail ||
        `Sample #${id} could not be retrieved from the laboratory records.`
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSampleData();
  }, [loadSampleData]);

  // Load lookup options for Move Modal
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [stagesData, locationsData] = await Promise.all([
          sampleService.getWorkflowStages(),
          sampleService.getLocations()
        ]);
        setStages(stagesData || []);
        setLocations(locationsData || []);
      } catch (e) {
        console.error('Failed to load lookup data:', e);
      }
    };
    loadLookups();
  }, []);

  // Pre-fill move modal options when opened
  const handleOpenMoveModal = () => {
    setMoveError('');
    setMoveSuccess('');
    setMoveComment('');

    if (data?.sample?.current_stage_id && stages.length > 0) {
      const currentStageOrder = data.current_stage?.stage_order || 1;
      const nextStage = stages.find(
        (s) => s.stage_order === currentStageOrder + 1
      );

      if (nextStage) {
        setTargetStageId(nextStage.id.toString());
      } else {
        setTargetStageId(stages[stages.length - 1].id.toString());
      }
    }

    if (data?.sample?.current_location_id) {
      setTargetLocationId(data.sample.current_location_id.toString());
    } else if (locations.length > 0) {
      setTargetLocationId(locations[0].id.toString());
    }

    setShowMoveModal(true);
  };

  // Submit manual move from modal
  const handleExecuteMove = async (e) => {
    e.preventDefault();
    if (!data?.sample) return;

    try {
      setMoveSubmitting(true);
      setMoveError('');
      setMoveSuccess('');

      const targetStageObj = stages.find(
        (s) => s.id.toString() === targetStageId.toString()
      );

      const isSequential =
        data.current_stage &&
        targetStageObj &&
        targetStageObj.stage_order ===
          data.current_stage.stage_order + 1;

      if (!isTechnician && !isSequential) {
        setMoveError(
          'Technicians can only advance sequentially to the next stage. Contact an administrator for exceptional corrections.'
        );
        setMoveSubmitting(false);
        return;
      }

      if (isAdmin && !isSequential) {
        if (!moveComment.trim()) {
          setMoveError(
            'An explanation comment is mandatory for administrative corrections.'
          );
          setMoveSubmitting(false);
          return;
        }

        await movementService.adminCorrection({
          barcode: data.sample.sample_code,
          to_stage_id: parseInt(targetStageId),
          to_location_id: targetLocationId
            ? parseInt(targetLocationId)
            : null,
          comment: moveComment.trim()
        });
      } else {
        await movementService.manualMove({
          barcode: data.sample.sample_code,
          to_stage_id: parseInt(targetStageId),
          to_location_id: targetLocationId
            ? parseInt(targetLocationId)
            : null,
          comment:
            moveComment.trim() || 'Manual stage movement'
        });
      }

      setMoveSuccess(
        'Sample stage transition recorded successfully!'
      );
      await loadSampleData();

      setTimeout(() => {
        setShowMoveModal(false);
        setMoveSuccess('');
      }, 1200);
    } catch (err) {
      console.error('Movement execution error:', err);
      setMoveError(
        err.response?.data?.detail ||
        'Failed to execute stage movement.'
      );
    } finally {
      setMoveSubmitting(false);
    }
  };

  // Delete sample (Admin only)
  const handleDeleteSample = async () => {
    try {
      await sampleService.deleteSample(id);
      navigate('/samples', { replace: true });
    } catch (err) {
      console.error('Failed to delete sample:', err);
      setError(
        'Failed to delete sample. Operation restricted to administrators.'
      );
      setShowDeleteDialog(false);
    }
  };

  // Copy sample code
  const handleCopyCode = () => {
    if (data?.sample?.sample_code) {
      navigator.clipboard.writeText(data.sample.sample_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Print thermal label - fixed header margins & full-width metadata text
  const handlePrint = () => {
    const escapeHtml = (value) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const barcodeUrl = sample?.barcode_url
      ? `${API_BASE_URL}${sample.barcode_url}`
      : '';

    // Format :
    // Prof.Project.Trial.Site.Crop.Plot.Part.Collector.ReceptionDate.Dest
    const metadataParts = [
      sample?.prof,
      sample?.project,
      sample?.trial,
      sample?.site,
      sample?.crop,
      sample?.plot,
      sample?.part,
      sample?.collector,
      sample?.reception_date
        ? new Date(sample.reception_date).toISOString().slice(0, 10)
        : '',
      sample?.dest,
    ].map((val) => (val ? String(val).trim() : '—'));

    const formattedCode = `*${metadataParts.join('.')}*`;
    const escapedFormattedCode = escapeHtml(formattedCode);

    // ============================================================
    // CREATE PRINT LABEL INSIDE THE CURRENT PAGE
    // ============================================================

    const existingPrintLabel = document.getElementById(
      'thermal-print-label'
    );

    if (existingPrintLabel) {
      existingPrintLabel.remove();
    }

    const existingPrintStyle = document.getElementById(
      'thermal-print-style'
    );

    if (existingPrintStyle) {
      existingPrintStyle.remove();
    }

    // ============================================================
    // PRINT-ONLY HTML
    // ============================================================

    const printLabel = document.createElement('div');

    printLabel.id = 'thermal-print-label';

    printLabel.innerHTML = `
      <div class="thermal-label-content">

        <div class="barcode-area">

          <div class="barcode-crop">
            ${
              barcodeUrl
                ? `
                  <img
                    src="${escapeHtml(barcodeUrl)}"
                    alt="Barcode"
                    class="thermal-barcode-image"
                  />
                `
                : `
                  <span class="barcode-fallback">
                    ${escapedFormattedCode}
                  </span>
                `
            }
          </div>

          <div class="custom-code">
            ${escapedFormattedCode}
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(printLabel);

    // ============================================================
    // PRINT CSS
    // ============================================================

    const printStyle = document.createElement('style');

    printStyle.id = 'thermal-print-style';

    printStyle.textContent = `
      /* ==========================================================
        THERMAL LABEL PRINT
        Physical size: 50mm x 25mm
      ========================================================== */

      @page {
        size: 50mm 25mm;
        margin: 0;
      }

      #thermal-print-label {
        display: none;
      }

      @media print {

        html,
        body {
          width: 50mm !important;
          height: 25mm !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: #ffffff !important;
        }

        /* Hide the complete application */
        body > * {
          visibility: hidden !important;
        }

        /* Show only the thermal label */
        #thermal-print-label {
          display: block !important;
          visibility: visible !important;

          position: fixed !important;
          left: 0 !important;
          top: 0 !important;

          width: 50mm !important;
          height: 25mm !important;

          margin: 0 !important;
          padding: 0 !important;

          background: #ffffff !important;
          overflow: hidden !important;
        }

        #thermal-print-label * {
          visibility: visible !important;
        }

        /* ========================================================
          LABEL CONTAINER
        ======================================================== */

        .thermal-label-content {
          width: 50mm;
          height: 25mm;

          padding: 1mm 1.5mm;

          background: #ffffff;

          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;

          overflow: hidden;

          box-sizing: border-box;

          font-family: Arial, Helvetica, sans-serif;
        }

        /* ========================================================
          BARCODE AREA
        ======================================================== */

        .barcode-area {
          width: 100%;
          height: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          overflow: hidden;
        }

        /* ========================================================
          BARCODE
        ======================================================== */

        .barcode-crop {
          width: 100%;
          height: 12mm;

          overflow: hidden;

          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .thermal-barcode-image {
          display: block;

          width: 47mm;
          height: 16mm;

          object-fit: cover;
          object-position: top;

          margin: 0;
          padding: 0;
        }

        /* ========================================================
          FALLBACK
        ======================================================== */

        .barcode-fallback {
          font-family: monospace;
          font-size: 2mm;
          white-space: nowrap;
        }

        /* ========================================================
          CUSTOM CODE
        ======================================================== */

        .custom-code {
          width: 100%;

          margin-top: 0.4mm;

          font-family: 'Courier New', Courier, monospace;

          font-size: 1.65mm;
          font-weight: 800;

          line-height: 1;

          text-align: center;

          white-space: nowrap;

          overflow: hidden;
          text-overflow: clip;

          letter-spacing: -0.02mm;
        }
      }
    `;

    document.head.appendChild(printStyle);

    // ============================================================
    // PRINT
    // ============================================================

    const barcodeImage = printLabel.querySelector(
      '.thermal-barcode-image'
    );

    let printed = false;

    const cleanup = () => {
      const label = document.getElementById(
        'thermal-print-label'
      );

      const style = document.getElementById(
        'thermal-print-style'
      );

      if (label) {
        label.remove();
      }

      if (style) {
        style.remove();
      }

      window.removeEventListener('afterprint', cleanup);
    };

    const printNow = () => {
      if (printed) return;

      printed = true;

      /*
      * IMPORTANT:
      * We use window.print() directly.
      * No window.open()
      * No new tab
      * No popup window
      */
      window.print();
    };

    window.addEventListener('afterprint', cleanup);

    if (barcodeImage) {
      if (barcodeImage.complete) {
        setTimeout(printNow, 150);
      } else {
        barcodeImage.onload = () => {
          setTimeout(printNow, 150);
        };

        barcodeImage.onerror = () => {
          setTimeout(printNow, 150);
        };

        setTimeout(printNow, 2500);
      }
    } else {
      setTimeout(printNow, 150);
    }
  };
  // Format date safely
  const formatDate = (dateVal, includeTime = false) => {
    if (!dateVal) return '—';

    try {
      const d = new Date(dateVal);

      if (includeTime) {
        return d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return String(dateVal);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <Loading message="Loading specimen details and traceability timeline..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-4 text-slate-100">
        <Link
          to="/samples"
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Back to Samples Directory</span>
        </Link>

        <ErrorMessage message={error} onRetry={loadSampleData} />
      </div>
    );
  }

  if (!data || !data.sample) {
    return null;
  }

  const { sample, current_stage, current_location, history } = data;
  const currentStageOrder = current_stage?.stage_order || 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 relative text-slate-100 font-sans selection:bg-emerald-500 selection:text-white motion-reduce:animate-none">

      {/* Ambient Background Radial Glow (Home Match) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* 1. Header & Navigation Actions (Glassmorphism & Removed "Generate Label" Button) */}
      <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-center space-x-3.5">
          <Link
            to="/samples"
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
            title="Back to Samples"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-bold text-slate-400">
                Specimen #{sample.id}
              </span>
              <StatusBadge stageName={current_stage?.name} />
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight mt-1">
              {sample.name}
            </h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">

          {isTechnician && (
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="group relative overflow-hidden px-4 py-2.5 bg-red-950/40 hover:bg-red-600/20 text-red-300 hover:text-red-200 border border-red-900/60 hover:border-red-500/70 rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-red-950/20 hover:shadow-red-600/20 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              title="Permanently delete this sample"
            >
              {/* Animated hover glow */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

              <Trash2 className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />

              <span className="relative z-10">
                Delete Sample
              </span>
            </button>
          )}

        </div>
      </div>

      {/* 2. Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

        {/* Left Column: Specimen Attributes Card */}
        <div className="md:col-span-1 space-y-6">

          <div className="bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-md rounded-2xl p-5 space-y-4 hover:border-emerald-500/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden group">

            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-90" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SPECIMEN ATTRIBUTES</span>
              </h2>

              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700/60">
                11 Metadata
              </span>
            </div>

            <div className="space-y-3">

              {/* 1. Highlighted Sample Code Box */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/90 flex items-center justify-between hover:border-emerald-500/40 transition-all shadow-inner">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    SAMPLE CODE
                  </span>

                  <span className="font-mono font-black text-emerald-400 text-sm tracking-wider">
                    {sample.sample_code}
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg border border-slate-700 transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Copy Code"
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Key-Value Attributes Grid */}
              <div className="divide-y divide-slate-800/50 text-xs font-sans">

                {/* 2. Prof */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Prof
                  </span>

                  <span className="font-semibold text-slate-200 text-right truncate max-w-[160px]">
                    {sample.prof || 'Not specified'}
                  </span>
                </div>

                {/* 3. Project */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Project
                  </span>

                  <span className="font-semibold text-slate-200 text-right truncate max-w-[160px]">
                    {sample.project || 'Not specified'}
                  </span>
                </div>

                {/* 4. Trial */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Trial
                  </span>

                  <span className="font-semibold text-slate-200 text-right truncate max-w-[160px]">
                    {sample.trial || 'Not specified'}
                  </span>
                </div>

                {/* 5. Site */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Site
                  </span>

                  <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />

                    <span className="truncate max-w-[150px]">
                      {sample.site || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* 6. Crop */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Crop
                  </span>

                  <span className="font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-md text-[11px]">
                    {sample.crop || 'Not specified'}
                  </span>
                </div>

                {/* 7. Plot */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Plot
                  </span>

                  <span className="font-semibold text-slate-200">
                    {sample.plot || 'Not specified'}
                  </span>
                </div>

                {/* 8. Part */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Part
                  </span>

                  <span className="font-semibold text-slate-200">
                    {sample.part || 'Not specified'}
                  </span>
                </div>

                {/* 9. Collector */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Collector
                  </span>

                  <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                    <UserIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />

                    <span className="truncate max-w-[150px]">
                      {sample.collector || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* 10. Reception Date */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Reception Date
                  </span>

                  <div className="flex items-center space-x-1.5 font-mono text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{formatDate(sample.reception_date)}</span>
                  </div>
                </div>

                {/* 11. Destination */}
                <div className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-800/30 rounded-lg transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wide">
                    Dest
                  </span>

                  <span className="font-semibold text-slate-200">
                    {sample.dest || 'Not specified'}
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* Barcode Tag Preview Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-5 text-center space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Code 128 Tag
              </span>

              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                Thermal 50x25mm
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-800 flex justify-center shadow-lg">
              {sample.barcode_url ? (
                <img
                  src={`${API_BASE_URL}${sample.barcode_url}`}
                  alt={`Barcode for ${sample.sample_code}`}
                  className="h-12 max-w-full object-contain mx-auto"
                />
              ) : (
                <div className="text-xs font-mono font-bold text-slate-800">
                  {sample.sample_code}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLabelModal(true)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-slate-700"
            >
              <Printer className="h-4 w-4" />
              <span>Preview & Print Label</span>
            </button>
          </div>
        </div>

        {/* Right Column: Workflow Pipeline & Complete Movement Timeline */}
        <div className="md:col-span-2 space-y-6">

          {/* Section 3: LABORATORY WORKFLOW PROGRESSION */}
          <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">

            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Laboratory Workflow Progression
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Stage progression status from Reception intake to Custody Storage
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {WORKFLOW_STAGES.map((ws) => {
                const isPassed = ws.id <= currentStageOrder;
                const isCurrent = ws.id === currentStageOrder;

                const stageHistoryItem = history?.find(
                  (h) => h.to_stage?.name?.toUpperCase() === ws.name
                );

                return (
                  <div
                    key={ws.name}
                    className={`p-3.5 rounded-xl border transition-all duration-300 ${
                      isPassed
                        ? isCurrent
                          ? 'bg-emerald-950/40 border-2 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                          : 'bg-emerald-950/30 border border-emerald-800/60 text-white'
                        : 'bg-slate-950/50 border border-slate-800/60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      {isPassed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-600 shrink-0" />
                      )}

                      <span
                        className={`text-xs font-black uppercase ${
                          isPassed ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {ws.label}
                      </span>
                    </div>

                    <div className="text-[10px] space-y-0.5">
                      {isPassed ? (
                        <>
                          <div className="text-slate-300 font-semibold">
                            Operator:{' '}
                            <strong className="text-white">
                              {stageHistoryItem?.technician_username ||
                                sample.creator?.username ||
                                'Operator'}
                            </strong>
                          </div>

                          <div className="text-slate-400 font-mono">
                            {formatDate(
                              stageHistoryItem?.timestamp ||
                                sample.reception_date,
                              true
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-600 font-medium italic">
                          Pending
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: COMPLETE MOVEMENT HISTORY TIMELINE */}
          <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-100">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Complete Movement History Timeline
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Immutable chronological audit logs for chain of custody
                </p>
              </div>

              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-xs font-mono font-bold px-3 py-1 rounded-full shadow-xs">
                {history?.length || 0} Movements Logged
              </span>
            </div>

            {/* Timeline Component */}
            <div className="relative border-l-2 border-emerald-500/30 ml-4 space-y-6 my-4">
              {history && history.length > 0 ? (
                history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="relative pl-6 group"
                  >
                    {/* Timeline Node */}
                    <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 group-hover:scale-125 transition-transform flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white rounded-full" />
                    </div>

                    {/* Log Card */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 shadow-xl hover:border-emerald-500/40 transition-all">

                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60">
                        <div className="flex items-center space-x-2">
                          {item.from_stage ? (
                            <>
                              <StatusBadge stageName={item.from_stage.name} />
                              <span className="text-emerald-400 font-bold">→</span>
                              <StatusBadge stageName={item.to_stage.name} />
                            </>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs text-slate-400 font-semibold">
                                Initial Registration:
                              </span>

                              <StatusBadge stageName={item.to_stage.name} />
                            </div>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                            item.movement_type === 'ADMIN_CORRECTION'
                              ? 'bg-red-950/80 text-red-300 border-red-800/60'
                              : item.movement_type === 'AUTOMATIC_SCAN'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.movement_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-400 mb-2">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />

                          <span>
                            Zone:{' '}
                            <strong className="text-slate-200 font-medium">
                              {item.to_location?.name || 'Unknown'}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <UserIcon className="h-3.5 w-3.5 text-slate-500" />

                          <span>
                            Operator:{' '}
                            <strong className="text-slate-200 font-medium">
                              {item.technician_username || 'System'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {item.comment && (
                        <div className="text-slate-300 italic bg-slate-900/40 p-3 rounded-lg border border-slate-800/40 text-xs mb-2">
                          "{item.comment}"
                        </div>
                      )}

                      <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{formatDate(item.timestamp, true)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No movement history recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Move Sample Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-white">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="h-5 w-5 text-emerald-400" />

                <h3 className="text-base font-bold text-white">
                  Move Specimen
                </h3>
              </div>

              <button
                onClick={() => setShowMoveModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
              <div>
                Sample:{' '}
                <strong className="font-mono text-emerald-400">
                  {sample.sample_code}
                </strong>{' '}
                ({sample.name})
              </div>

              <div>
                Current Stage:{' '}
                <StatusBadge
                  stageName={current_stage?.name}
                  className="ml-1"
                />
              </div>
            </div>

            {moveSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs font-bold text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{moveSuccess}</span>
              </div>
            )}

            {moveError && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs font-bold text-red-300 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{moveError}</span>
              </div>
            )}

            <form
              onSubmit={handleExecuteMove}
              className="space-y-3.5 text-xs font-semibold text-slate-300"
            >
              <div>
                <label className="block mb-1.5 uppercase text-[10px] font-mono font-bold text-slate-400">
                  Target Workflow Stage *
                </label>

                <select
                  value={targetStageId}
                  onChange={(e) => setTargetStageId(e.target.value)}
                  className="w-full p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                >
                  {stages.map((st) => (
                    <option
                      key={st.id}
                      value={st.id}
                      className="bg-slate-900 text-white"
                    >
                      {st.stage_order}. {st.name} — {st.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[10px] font-mono font-bold text-slate-400">
                  Target Physical Location
                </label>

                <select
                  value={targetLocationId}
                  onChange={(e) => setTargetLocationId(e.target.value)}
                  className="w-full p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option
                      key={loc.id}
                      value={loc.id}
                      className="bg-slate-900 text-white"
                    >
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[10px] font-mono font-bold text-slate-400">
                  Comment / Reason
                </label>

                <input
                  type="text"
                  placeholder="e.g. Stage progression verified"
                  value={moveComment}
                  onChange={(e) => setMoveComment(e.target.value)}
                  className="w-full p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer border border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={moveSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40"
                >
                  {moveSubmitting
                    ? 'Saving Movement...'
                    : 'Save Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Label Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-[#0d1322] border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Thermal Label (50x25mm)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Label Visual Simulation Container */}
            {/* Label Visual Simulation Container */}
            <div className="p-6 bg-slate-950/90 rounded-2xl flex justify-center border border-slate-800/80">
              <div className="w-[320px] bg-white text-slate-900 rounded-xl p-3 shadow-xl flex flex-col justify-between space-y-2 border border-slate-200">

                {/* Top Header */}
                <div className="flex justify-between items-center text-[11px] font-black border-b border-slate-900 pb-1.5">
                  <span className="text-emerald-600 tracking-tight font-bold">
                    ASARI Sample Tracking
                  </span>

                  <div className="text-[10px] text-slate-700 font-semibold">
                    <div className="truncate font-black text-slate-900 text-[11px]">
                      {sample.name}
                    </div>
                  </div>
                </div>

                {/* Barcode Center */}
                <div className="py-2 text-center bg-slate-50/80 rounded border border-slate-100 flex items-center justify-center min-h-[55px]">
                  <img
                    src={`${API_BASE_URL}${sample.barcode_url}`}
                    alt="Code 128 Barcode"
                    className="h-12 max-w-full object-contain mx-auto"
                  />
                </div>

                {/* Metadata Format */}
                <div className="text-center text-[9px] text-slate-800 font-bold leading-tight whitespace-nowrap overflow-hidden">
                  *{sample.prof || '—'}.
                  {sample.project || '—'}.
                  {sample.trial || '—'}.
                  {sample.site || '—'}.
                  {sample.crop || '—'}.
                  {sample.plot || '—'}.
                  {sample.part || '—'}.
                  {sample.collector || '—'}.
                  {formatDate(sample.reception_date)}.
                  {sample.dest || '—'}*
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-700/80 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center space-x-2 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span>Print Label</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Printable label is generated in an isolated print window by handlePrint(). */}
      <div className="hidden" aria-hidden="true" />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Sample Record"
        message={`Are you sure you want to permanently delete specimen '${sample.sample_code}'? All associated movement logs will be permanently removed.`}
        confirmText="Delete Record"
        isDanger={true}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteSample}
      />
    </div>
  );
};

export default SampleDetail;