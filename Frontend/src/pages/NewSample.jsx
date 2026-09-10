import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FilePlus2,
  CheckCircle,
  Printer,
  Eye,
  Calendar,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  UserRound,
  FolderKanban,
  FlaskConical,
  MapPin,
  Sprout,
  Hash,
  Scissors,
  UserCheck,
  PackageCheck,
} from 'lucide-react';
import { sampleService } from '../services/sampleService';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://sample-tracking-backend.vercel.app';

const getBarcodeUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://localhost') || path.startsWith('http://127.0.0.1')) {
    const cleanPath = path.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
    return `${API_BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const NewSample = () => {
  // ============================================================
  // FORM STATE
  // ============================================================

  const [prof, setProf] = useState('');
  const [project, setProject] = useState('');
  const [name, setName] = useState('');
  const [trial, setTrial] = useState('');
  const [site, setSite] = useState('');
  const [crop, setCrop] = useState('');
  const [plot, setPlot] = useState('');
  const [part, setPart] = useState('');
  const [collector, setCollector] = useState('');
  const [receptionDate, setReceptionDate] = useState(getToday());
  const [dest, setDest] = useState('');

  // ============================================================
  // UI STATE
  // ============================================================

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdSample, setCreatedSample] = useState(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const navigate = useNavigate();

  // ============================================================
  // FINAL CODE
  // ============================================================

  const buildFinalCode = () => {
    const values = [
      prof.trim(),
      project.trim(),
      trial.trim(),
      site.trim(),
      crop.trim(),
      plot.trim(),
      part.trim(),
      collector.trim(),
      receptionDate.trim(),
      dest.trim(),
    ];

    if (values.every((value) => !value)) {
      return '';
    }

    return `*${values.join('.')}*`;
  };

  const finalCode = buildFinalCode();

  // ============================================================
  // FIELD HELPERS
  // ============================================================

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    const errors = {};

    if (!prof.trim()) errors.prof = 'Professor is required.';
    if (!project.trim()) errors.project = 'Project is required.';
    if (!name.trim()) errors.name = 'Sample name is required.';
    if (!trial.trim()) errors.trial = 'Trial is required.';
    if (!site.trim()) errors.site = 'Site is required.';
    if (!crop.trim()) errors.crop = 'Crop is required.';
    if (!plot.trim()) errors.plot = 'Plot is required.';
    if (!part.trim()) errors.part = 'Part is required.';
    if (!collector.trim()) errors.collector = 'Collector is required.';
    if (!receptionDate) errors.receptionDate = 'Reception date is required.';
    if (!dest.trim()) errors.dest = 'Dest is required.';

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        sample_code: finalCode,
        prof: prof.trim(),
        project: project.trim(),
        trial: trial.trim(),
        site: site.trim(),
        crop: crop.trim(),
        plot: plot.trim(),
        part: part.trim(),
        collector: collector.trim(),
        reception_date: receptionDate,
        dest: dest.trim(),
      };

      const result = await sampleService.createSample(payload);
      setCreatedSample(result);
    } catch (err) {
      console.error('Sample creation error:', err);
      const detail = err.response?.data?.detail;

      if (
        err.response?.status === 409 ||
        (typeof detail === 'string' &&
          detail.toLowerCase().includes('already exists'))
      ) {
        setError(
          'A sample with this Final Code already exists. Please modify one or more fields.'
        );
      } else if (err.response?.status === 422) {
        setError(
          'Validation error: Please verify all required fields and the reception date.'
        );
      } else if (!err.response) {
        setError(
          'Network error: Unable to reach the laboratory backend. Check that the backend server is running.'
        );
      } else {
        setError(
          detail || 'Failed to register laboratory sample. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setProf('');
    setProject('');
    setName('');
    setTrial('');
    setSite('');
    setCrop('');
    setPlot('');
    setPart('');
    setCollector('');
    setReceptionDate(getToday());
    setDest('');

    setCreatedSample(null);
    setError('');
    setFieldErrors({});
    setShowLabelModal(false);
    setCopiedCode(false);
  };

  // ============================================================
  // COPY FINAL CODE
  // ============================================================

  const handleCopyCode = async () => {
    const code = finalCode;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // ============================================================
  // PRINT
  // ============================================================

  const handlePrint = async () => {
    const barcodeImage = document.querySelector('#printable-label img');

    if (barcodeImage && !barcodeImage.complete) {
      await new Promise((resolve) => {
        barcodeImage.addEventListener('load', resolve, { once: true });
        barcodeImage.addEventListener('error', resolve, { once: true });
      });
    }

    window.print();
  };

  // ============================================================
  // INPUT COMPONENT
  // ============================================================

  const renderInput = ({
    label,
    value,
    onChange,
    placeholder,
    icon: Icon,
    field,
    required = true,
    type = 'text',
  }) => {
    const hasError = Boolean(fieldErrors[field]);

    return (
      <div>
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          {label} {required && '*'}
        </label>

        <div className="relative">
          {Icon && (
            <Icon className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
          )}

          <input
            type={type}
            required={required}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              onChange(e.target.value);
              clearFieldError(field);
            }}
            className={`w-full ${
              Icon ? 'pl-10' : 'pl-3.5'
            } pr-3.5 py-3 bg-slate-950/80 border rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${
              hasError
                ? 'border-red-500 bg-red-950/30'
                : 'border-slate-800'
            }`}
          />
        </div>

        {hasError && (
          <span className="text-[10px] text-red-400 font-bold mt-1 block">
            {fieldErrors[field]}
          </span>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative text-slate-100 font-sans selection:bg-emerald-500 selection:text-white motion-reduce:animate-none">

      {/* STYLES CSS SPÉCIFIQUES POUR L'IMPRESSION */}
      <style>{`
        #printable-label {
          display: none;
        }

        @media print {
          @page {
            size: 50mm 25mm;
            margin: 0mm;
          }

          html,
          body {
            width: 50mm !important;
            height: 25mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          #printable-label,
          #printable-label * {
            visibility: visible !important;
          }

          #printable-label {
            display: block !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 50mm !important;
            height: 25mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 999999 !important;
          }

          .print-label-card {
            box-sizing: border-box !important;
            width: 50mm !important;
            height: 25mm !important;
            padding: 1mm !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            gap: 0.5mm !important;
            box-shadow: none !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }

          .print-label-barcode {
            width: 44mm !important;
            height: 10mm !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            overflow: hidden !important;
          }

          .print-label-barcode img {
            display: block !important;
            width: 44mm !important;
            height: 13mm !important;
            max-width: 44mm !important;
            object-fit: cover !important;
            object-position: top left !important;
          }

          .print-label-fallback-code {
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 1.8mm !important;
            font-weight: 800 !important;
          }

          .print-label-final-code {
            width: 44mm !important;
            max-width: 100mm !important;
            text-align: center !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 1.5mm !important;
            line-height: 1 !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: clip !important;
            letter-spacing: -0.05mm !important;
            margin-top: 1mm !important;
          }

          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `}</style>

      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* HEADER */}
      <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-r from-emerald-600 to-violet-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 shrink-0">
            <FilePlus2 className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Register Laboratory{' '}
              <span className="text-emerald-400">Sample</span>
            </h1>

            <p className="text-xs text-slate-400 font-medium mt-1">
              Register a new laboratory specimen and generate its traceability barcode.
            </p>
          </div>
        </div>

        <Link
          to="/samples"
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 shrink-0 self-start sm:self-auto"
        >
          Sample Directory
        </Link>
      </div>

      {/* Error */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => setError('')}
        />
      )}

      {!createdSample ? (
        <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-6 relative z-10 hover:border-emerald-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section: Identification */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                <FlaskConical className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-wide">
                  Sample Identification
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput({
                  label: 'Professor',
                  value: prof,
                  onChange: setProf,
                  placeholder: 'e.g. LF',
                  icon: UserRound,
                  field: 'Professor',
                })}

                {renderInput({
                  label: 'Project',
                  value: project,
                  onChange: setProject,
                  placeholder: 'e.g. P1',
                  icon: FolderKanban,
                  field: 'project',
                })}

                <div className="md:col-span-2">
                  {renderInput({
                    label: 'Sample Name',
                    value: name,
                    onChange: setName,
                    placeholder: 'e.g. Arabidopsis Thaliana Leaf Batch A',
                    icon: FlaskConical,
                    field: 'name',
                  })}
                </div>

                {renderInput({
                  label: 'Trial',
                  value: trial,
                  onChange: setTrial,
                  placeholder: 'e.g. XX',
                  icon: Hash,
                  field: 'trial',
                })}

                {renderInput({
                  label: 'Site',
                  value: site,
                  onChange: setSite,
                  placeholder: 'e.g. AF',
                  icon: MapPin,
                  field: 'site',
                })}
              </div>
            </div>

            {/* Section: Sample Information */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                <Sprout className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-wide">
                  Sample Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput({
                  label: 'Crop',
                  value: crop,
                  onChange: setCrop,
                  placeholder: 'e.g. Bly',
                  icon: Sprout,
                  field: 'crop',
                })}

                {renderInput({
                  label: 'Plot',
                  value: plot,
                  onChange: setPlot,
                  placeholder: 'e.g. 1',
                  icon: Hash,
                  field: 'plot',
                })}

                {renderInput({
                  label: 'Part',
                  value: part,
                  onChange: setPart,
                  placeholder: 'e.g. SHT',
                  icon: Scissors,
                  field: 'part',
                })}

                {renderInput({
                  label: 'Collector',
                  value: collector,
                  onChange: setCollector,
                  placeholder: 'e.g. MR',
                  icon: UserCheck,
                  field: 'collector',
                })}

                {renderInput({
                  label: 'Reception Date',
                  value: receptionDate,
                  onChange: setReceptionDate,
                  placeholder: 'YYYY-MM-DD',
                  icon: Calendar,
                  field: 'receptionDate',
                  type: 'date',
                })}

                {renderInput({
                  label: 'Dest',
                  value: dest,
                  onChange: setDest,
                  placeholder: 'e.g. DRY',
                  icon: PackageCheck,
                  field: 'dest',
                })}
              </div>
            </div>

            {/* FINAL CODE PREVIEW */}
            <div className="border border-emerald-800/60 bg-emerald-950/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black text-white">
                    Final Code Preview
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Automatically generated from the reception information.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-h-[58px] flex items-center justify-center">
                {finalCode ? (
                  <div className="flex items-center gap-2 w-full">
                    <code className="text-sm md:text-base font-mono font-black text-emerald-400 break-all text-center flex-1">
                      {finalCode}
                    </code>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="shrink-0 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                      title="Copy Final Code"
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">
                    Fill in the fields above to generate the Final Code.
                  </span>
                )}
              </div>

              <p className="text-[10px] text-slate-500 mt-2 font-mono text-center">
                Format: *Prof.Project.Trial.Site.Crop.Plot.Part.Collector.ReceptionDate.Dest*
              </p>
            </div>

            {/* SUBMIT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin text-white" />
                    <span>
                      Registering specimen & generating Code 128 barcode...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-white" />
                    <span>
                      Register Sample & Generate Barcode
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      ) : (
        /* POST CREATION */
        <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-6 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">

          {/* Success */}
          <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl flex items-start space-x-3 text-emerald-200 backdrop-blur-md">
            <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-black text-white">
                Sample Registered Successfully!
              </h3>
              <p className="text-xs text-emerald-300 mt-1">
                The specimen has been registered successfully with its generated Final Code.
              </p>
            </div>
          </div>

          {/* LABEL PREVIEW NETTOYÉ */}
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white text-slate-900 rounded-xl border-2 border-slate-300 p-6 shadow-xl text-center">
              
              {/* Barcode Image */}
              <div className="h-14 overflow-hidden flex items-start justify-center ">
                {createdSample.barcode_url ? (
                  <img
                    src={getBarcodeUrl(createdSample.barcode_url)}
                    alt={`Barcode for ${finalCode}`}
                    className="h-20 max-w-full object-contain mx-auto"
                  />
                ) : (
                  <div className="h-20 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg w-full">
                    <span className="text-xs font-mono font-bold">
                      Barcode generated by backend
                    </span>
                  </div>
                )}
              </div>

              {/* Final Code DIRECTEMENT sous le code-barres (Ajusté pour ne pas dépasser) */}
              <div className="font-mono font-bold text-[9px] sm:text-[10px] leading-tight text-slate-900 break-all tracking-tighter max-w-full px-2 mx-auto">
                {finalCode}
              </div>
            </div>
          </div>

          {/* INFORMATION */}
          <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                Final Code
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                title="Copy Final Code"
              >
                {copiedCode ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="text-lg md:text-xl font-mono font-black text-emerald-400 tracking-wide break-all">
              {finalCode}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
              <div>
                Sample Name:{' '}
                <strong className="text-white">
                  {createdSample.name || name}
                </strong>
              </div>
              <div>
                Reception:{' '}
                <strong className="text-white">{receptionDate}</strong>
              </div>
              <div>
                Destination:{' '}
                <strong className="text-white">{dest}</strong>
              </div>
              <div>
                Stage:{' '}
                <StatusBadge stageName="RECEPTION" className="ml-1" />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center items-center gap-4 w-full pt-2">
            <button
              onClick={handlePrint}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Print Label</span>
            </button>

            <button
              onClick={() => navigate(`/samples/${createdSample.id}`)}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Eye className="h-4 w-4" />
              <span>View Sample</span>
            </button>
          </div>

          {/* Reset */}
          <div className="pt-3 text-center border-t border-slate-800">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center cursor-pointer"
            >
              <FilePlus2 className="h-4 w-4 mr-1.5" />
              <span>Register Another Sample</span>
            </button>
          </div>

        </div>
      )}
      
      {/* CONSTRUCTEUR DE L'ÉTIQUETTE IMPRIMABLE (Cible de window.print) */}
      {createdSample && (
        <div id="printable-label" className="h-14 overflow-hidden flex items-start justify-center">
          <div className="print-label-card">
            {/* Code-barres */}
            <div className="print-label-barcode">
              {createdSample.barcode_url ? (
                <img
                  src={getBarcodeUrl(createdSample.barcode_url)}
                  alt="Barcode"
                />
              ) : (
                <span className="print-label-fallback-code">
                  {createdSample.sample_code || finalCode}
                </span>
              )}
            </div>

            {/* Final Code sous le code-barres */}
            <div className="print-label-final-code">
              {finalCode}
            </div>
          </div>
        </div>
      )}

      {/* LABEL MODAL */}
      {showLabelModal && createdSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Thermal Adhesive Label Preview
                </h3>
              </div>

              <button
                onClick={() => setShowLabelModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Label Preview dans le Modal */}
            <div className="p-4 bg-slate-950/90 rounded-xl flex justify-center border border-slate-800">
              <div className="w-[300px] bg-white text-slate-900 border-2 border-slate-800 rounded-lg p-4 shadow-md text-center">
                <div className="font-black text-sm">
                  ASARI Sample Tracking
                </div>
                <div className="text-[9px] text-slate-500 uppercase font-bold">
                  Laboratory Sample
                </div>

                <div className="mt-3 flex justify-center">
                  {createdSample.barcode_url ? (
                    <img
                      src={getBarcodeUrl(createdSample.barcode_url)}
                      alt="Code 128 Barcode"
                      className="h-16 max-w-full object-contain mx-auto"
                    />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-[9px] font-mono">
                      Barcode
                    </div>
                  )}
                </div>

                <div className="mt-2 font-mono font-bold text-[9px] sm:text-[10px] leading-tight text-slate-900 break-all tracking-tighter max-w-full px-2 mx-auto">
                  {finalCode}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-slate-700"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NewSample;