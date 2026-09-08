import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  User as UserIcon,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Trash2,
  ArrowRight,
} from 'lucide-react';

import { movementService } from '../services/movementService';
import { sampleService } from '../services/sampleService';
import { useAuth } from '../context/AuthContext';

import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export const Movements = () => {
  const { isAdmin } = useAuth();

  // ============================================================
  // LOOKUP DATA
  // ============================================================

  const [stages, setStages] = useState([]);
  const [locations, setLocations] = useState([]);
  const [movementsHistory, setMovementsHistory] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // ============================================================
  // MANUAL MOVEMENT WORKFLOW
  // ============================================================

  // 1. Barcode input & search
  const [manualBarcode, setManualBarcode] = useState('');
  const [searchingSample, setSearchingSample] = useState(false);
  const [searchedSample, setSearchedSample] = useState(null);
  const [searchError, setSearchError] = useState('');

  // 2. Stage & Location selection
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [comment, setComment] = useState('');
  const [isAdminCorrectionMode, setIsAdminCorrectionMode] =
    useState(false);

  // 3. Execution & validation
  const [submittingMovement, setSubmittingMovement] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ============================================================
  // SESSION DISPLAY STATE
  // ============================================================

  const [sessionCleared, setSessionCleared] = useState(() => {
    return Boolean(
      localStorage.getItem('movement_session_cleared_at')
    );
  });

  const [sessionClearedAt, setSessionClearedAt] = useState(() => {
    return (
      localStorage.getItem('movement_session_cleared_at') || null
    );
  });

  // ============================================================
  // HELPER — FILTER SESSION MOVEMENTS
  // ============================================================

  const filterSessionMovements = (logs) => {
    const clearedAt = localStorage.getItem(
      'movement_session_cleared_at'
    );

    if (!clearedAt) {
      return logs || [];
    }

    const clearDate = new Date(clearedAt);

    return (logs || []).filter((movement) => {
      if (!movement.created_at) {
        return false;
      }

      const movementDate = new Date(movement.created_at);

      return movementDate > clearDate;
    });
  };

  // ============================================================
  // LOAD INITIAL DATA
  // ============================================================

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);

      const [stagesData, locationsData, logsData] =
        await Promise.all([
          sampleService.getWorkflowStages(),
          sampleService.getLocations(),
          movementService.getMovements(),
        ]);

      setStages(stagesData || []);
      setLocations(locationsData || []);

      const visibleLogs = filterSessionMovements(
        logsData || []
      );

      setMovementsHistory(visibleLogs);

      const clearedAt = localStorage.getItem(
        'movement_session_cleared_at'
      );

      setSessionCleared(Boolean(clearedAt));
      setSessionClearedAt(clearedAt);
    } catch (err) {
      console.error(
        'Failed to load initial movement data:',
        err
      );
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const formatStage = (stageName) => {
    if (!stageName) return '';

    return (
      stageName.charAt(0).toUpperCase() +
      stageName.slice(1).toLowerCase()
    );
  };

  /**
   * Get the complete sample code from the movement object.
   *
   * Important:
   * We NEVER display only "#1", "#2", etc.
   * We always try to display the complete sample_code.
   */
  const getSampleCode = (movement) => {
    return (
      movement?.sample?.sample_code ||
      movement?.sample_code ||
      movement?.sample?.code ||
      `Sample #${movement?.sample_id ?? '—'}`
    );
  };

  /**
   * Get a visual status for the movement history.
   */
  const getMovementStatus = (movement) => {
    if (
      movement?.movement_type === 'ADMIN_CORRECTION'
    ) {
      return 'CORRECTION';
    }

    return 'SUCCESS';
  };

  // ============================================================
  // CLEAR SESSION
  // ============================================================

  /**
   * Clear only the current session display.
   *
   * IMPORTANT:
   * This does NOT delete anything from the database.
   */
  const handleClearSession = () => {
    const clearedAt = new Date().toISOString();

    localStorage.setItem(
      'movement_session_cleared_at',
      clearedAt
    );

    setSessionClearedAt(clearedAt);
    setMovementsHistory([]);
    setSessionCleared(true);
  };

  // ============================================================
  // RESTORE HISTORY
  // ============================================================

  /**
   * Restore the complete database movement history
   * in the current browser session.
   *
   * This does NOT modify or delete database records.
   */
  const handleRestoreHistory = async () => {
    try {
      setInitialLoading(true);

      localStorage.removeItem(
        'movement_session_cleared_at'
      );

      setSessionClearedAt(null);
      setSessionCleared(false);

      const logsData =
        await movementService.getMovements();

      setMovementsHistory(logsData || []);
    } catch (err) {
      console.error(
        'Failed to restore movement history:',
        err
      );
    } finally {
      setInitialLoading(false);
    }
  };

  // ============================================================
  // SEARCH SAMPLE BY BARCODE
  // ============================================================

  const handleSearchSample = async (e) => {
    e?.preventDefault();

    const query = manualBarcode.trim();

    if (!query) {
      setSearchError(
        'Please enter a sample barcode or code to search.'
      );
      return;
    }

    try {
      setSearchingSample(true);
      setSearchError('');
      setValidationError('');
      setSuccessMessage('');
      setSearchedSample(null);

      const sampleData =
        await sampleService.getSampleByBarcode(query);

      setSearchedSample(sampleData);

      // Determine next recommended stage
      const currentStageOrder =
        sampleData.current_stage?.stage_order || 1;

      const nextStage = stages.find(
        (stage) =>
          stage.stage_order ===
          currentStageOrder + 1
      );

      if (nextStage) {
        setSelectedStageId(
          nextStage.id.toString()
        );
      } else if (stages.length > 0) {
        setSelectedStageId(
          stages[stages.length - 1].id.toString()
        );
      } else {
        setSelectedStageId('');
      }

      // Default location
      if (sampleData.current_location_id) {
        setSelectedLocationId(
          sampleData.current_location_id.toString()
        );
      } else if (locations.length > 0) {
        setSelectedLocationId(
          locations[0].id.toString()
        );
      } else {
        setSelectedLocationId('');
      }
    } catch (err) {
      console.error(
        'Manual search error:',
        err
      );

      setSearchError(
        err.response?.data?.detail ||
          `Specimen with barcode '${query}' was not found in the laboratory records.`
      );
    } finally {
      setSearchingSample(false);
    }
  };

  // ============================================================
  // CONFIRM & EXECUTE MOVEMENT
  // ============================================================

  const handleConfirmMovement = async (e) => {
    e.preventDefault();

    if (!searchedSample) return;

    setValidationError('');
    setSuccessMessage('');

    const currentOrder =
      searchedSample.current_stage?.stage_order || 1;

    const chosenStage = stages.find(
      (stage) =>
        stage.id.toString() ===
        selectedStageId.toString()
    );

    if (!chosenStage) {
      setValidationError(
        'Please select a valid destination workflow stage.'
      );
      return;
    }

    const isSequential =
      chosenStage.stage_order ===
      currentOrder + 1;

    // ==========================================================
    // RULE 1: TECHNICIAN CAN ONLY MOVE SEQUENTIALLY
    // ==========================================================

    if (!isAdmin && !isSequential) {
      setValidationError(
        `Invalid workflow stage transition. As a Technician, you can only advance sequentially to the next recommended stage (${formatStage(
          stages.find(
            (stage) =>
              stage.stage_order ===
              currentOrder + 1
          )?.name || 'Next Stage'
        )}). Contact an administrator for exceptional corrections.`
      );

      return;
    }

    // ==========================================================
    // RULE 2: ADMIN CORRECTION REQUIRES COMMENT
    // ==========================================================

    if (
      isAdmin &&
      (isAdminCorrectionMode || !isSequential)
    ) {
      if (!comment.trim()) {
        setValidationError(
          'An explanation comment is mandatory for administrative corrections or non-sequential stage changes.'
        );

        return;
      }
    }

    try {
      setSubmittingMovement(true);

      let response;

      // ========================================================
      // ADMIN CORRECTION
      // ========================================================

      if (
        isAdmin &&
        (isAdminCorrectionMode || !isSequential)
      ) {
        response =
          await movementService.adminCorrection({
            barcode:
              searchedSample.sample_code,
            to_stage_id:
              parseInt(selectedStageId),
            to_location_id:
              selectedLocationId
                ? parseInt(selectedLocationId)
                : null,
            comment: comment.trim(),
          });
      } else {
        // ======================================================
        // NORMAL MANUAL MOVEMENT
        // ======================================================

        response =
          await movementService.manualMove({
            barcode:
              searchedSample.sample_code,
            to_stage_id:
              parseInt(selectedStageId),
            to_location_id:
              selectedLocationId
                ? parseInt(selectedLocationId)
                : null,
            comment:
              comment.trim() ||
              'Manual stage transition',
          });
      }

      const previousStage =
        formatStage(
          response.from_stage?.name ||
            searchedSample.current_stage?.name
        );

      const nextStage =
        formatStage(
          response.to_stage?.name
        );

      const msg = `Sample ${searchedSample.sample_code} successfully moved from ${previousStage} to ${nextStage}.`;

      setSuccessMessage(msg);
      setComment('');

      // ========================================================
      // REFRESH SEARCHED SAMPLE
      // ========================================================

      const refreshedSample =
        await sampleService.getSampleById(
          searchedSample.id
        );

      setSearchedSample(refreshedSample);

      // ========================================================
      // REFRESH MOVEMENT HISTORY
      // ========================================================

      const updatedLogs =
        await movementService.getMovements();

      const visibleLogs =
        filterSessionMovements(
          updatedLogs || []
        );

      setMovementsHistory(visibleLogs);

      const clearedAt =
        localStorage.getItem(
          'movement_session_cleared_at'
        );

      setSessionCleared(
        Boolean(clearedAt)
      );

      setSessionClearedAt(
        clearedAt
      );
    } catch (err) {
      console.error(
        'Movement confirmation failed:',
        err
      );

      setValidationError(
        err.response?.data?.detail ||
          'Failed to execute movement transaction. Please verify constraints.'
      );
    } finally {
      setSubmittingMovement(false);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (initialLoading) {
    return (
      <div className="py-12">
        <Loading message="Loading laboratory movements and workflow rules..." />
      </div>
    );
  }

  // ============================================================
  // NEXT RECOMMENDED STAGE
  // ============================================================

  const currentStageOrder =
    searchedSample?.current_stage?.stage_order ||
    1;

  const nextRecommendedStage =
    stages.find(
      (stage) =>
        stage.stage_order ===
        currentStageOrder + 1
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative text-slate-100 font-sans selection:bg-emerald-500 selection:text-white motion-reduce:animate-none">

      {/* ======================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] blur-[130px] pointer-events-none rounded-full" />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-5 md:p-6 relative z-10 animate-in fade-in slide-in-from-top-3 duration-300">

        <div className="flex items-center space-x-3.5">

          <div className="p-3 bg-gradient-to-r from-emerald-600 to-violet-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 shrink-0">
            <ArrowRightLeft className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Sample Movements{' '}
              <span className="text-emerald-400">
                Console
              </span>
            </h1>

            <p className="text-xs text-slate-400 font-medium mt-1">
              Manually manage laboratory sample movements and maintain complete workflow traceability.
            </p>
          </div>

        </div>
      </div>

      {/* ======================================================
          STEP 1 & 2 — SEARCH SAMPLE
      ====================================================== */}

      <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-6 space-y-4 hover:border-emerald-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">

        <div>
          <div className="flex items-center space-x-2 mb-1">

            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-mono font-bold px-2.5 py-1 rounded-md shadow-xs">
              STEP 1 & 2
            </span>

            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              ENTER BARCODE & SEARCH SAMPLE
            </h2>

          </div>

          <p className="text-xs text-slate-400 font-medium mt-1">
            Enter the complete sample barcode or sample code to retrieve its current workflow status.
          </p>
        </div>

        <form
          onSubmit={handleSearchSample}
          className="flex gap-2.5 text-xs"
        >

          <div className="relative flex-1">

            <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />

            <input
              type="text"
              placeholder="Enter sample barcode or code (e.g. SMP-2026-000001)..."
              value={manualBarcode}
              onChange={(e) =>
                setManualBarcode(
                  e.target.value
                )
              }
              className="w-full pl-10 pr-3.5 py-3 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />

          </div>

          <button
            type="submit"
            disabled={
              searchingSample ||
              !manualBarcode.trim()
            }
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2"
          >

            {searchingSample ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}

            <span>
              Search Sample
            </span>

          </button>

        </form>

        {searchError && (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 font-bold flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>
              {searchError}
            </span>
          </div>
        )}

      </div>

      {/* ======================================================
          SAMPLE INSPECTION & MOVEMENT FORM
      ====================================================== */}

      {searchedSample && (
        <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">

          {/* SUCCESS MESSAGE */}

          {successMessage && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 font-bold flex items-center space-x-2.5 shadow-2xs">

              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />

              <span>
                {successMessage}
              </span>

            </div>
          )}

          {/* VALIDATION ERROR */}

          {validationError && (
            <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-300 font-bold flex items-start space-x-2.5">

              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />

              <div className="flex-1 leading-relaxed">
                {validationError}
              </div>

            </div>
          )}

          {/* ==================================================
              STEP 3 & 4 — SAMPLE STATUS
          ================================================== */}

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">

            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">

              <div className="flex items-center space-x-2">

                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                  STEP 3 & 4
                </span>

                <span className="font-bold text-white text-xs">
                  Specimen Status & Recommended Stage
                </span>

              </div>

              <Link
                to={`/samples/${searchedSample.id}`}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center"
              >
                <span>
                  Full Details
                </span>

                <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
              </Link>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">

              {/* SAMPLE CODE */}

              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Sample Code
                </span>

                <span className="font-mono font-bold text-emerald-400">
                  {searchedSample.sample_code}
                </span>
              </div>

              {/* SPECIMEN NAME */}

              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Specimen Name
                </span>

                <span className="font-medium text-slate-200 truncate block">
                  {searchedSample.name}
                </span>
              </div>

              {/* CURRENT STAGE */}

              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Current Stage
                </span>

                <StatusBadge
                  stageName={
                    searchedSample.current_stage?.name
                  }
                />
              </div>

              {/* CURRENT LOCATION */}

              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Current Zone
                </span>

                <span className="font-bold text-slate-300">
                  {searchedSample.current_location?.name ||
                    'Reception Area'}
                </span>
              </div>

            </div>

            {/* NEXT RECOMMENDED STAGE */}

            <div className="mt-3 p-3 bg-slate-900 border border-emerald-900/60 rounded-xl flex items-center justify-between">

              <div className="flex items-center space-x-2 text-xs">

                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />

                <div>

                  <span className="text-slate-400 font-medium">
                    Next Recommended Stage:{' '}
                  </span>

                  {nextRecommendedStage ? (
                    <strong className="text-emerald-300 font-bold">
                      {nextRecommendedStage.stage_order}.{' '}
                      {nextRecommendedStage.name}{' '}
                      ({nextRecommendedStage.description})
                    </strong>
                  ) : (
                    <strong className="text-emerald-400 font-bold">
                      Final Stage (STORAGE) Reached
                    </strong>
                  )}

                </div>

              </div>

              {nextRecommendedStage && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Standard Sequential Path
                </span>
              )}

            </div>

          </div>

          {/* ==================================================
              STEP 5, 6 & 7 — MOVEMENT FORM
          ================================================== */}

          <form
            onSubmit={handleConfirmMovement}
            className="space-y-4 text-xs font-semibold text-slate-300"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center space-x-2">

                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                  STEP 5, 6 & 7
                </span>

                <span className="font-bold text-white text-xs">
                  Select Destination & Confirm
                </span>

              </div>

              {/* ADMIN CORRECTION */}

              {isAdmin && (
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/80 px-3 py-1 rounded-xl">

                  <input
                    type="checkbox"
                    checked={isAdminCorrectionMode}
                    onChange={(e) =>
                      setIsAdminCorrectionMode(
                        e.target.checked
                      )
                    }
                    className="rounded text-red-600 focus:ring-red-500"
                  />

                  <span>
                    Admin Correction Mode
                  </span>

                </label>
              )}

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* DESTINATION STAGE */}

              <div>

                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Destination Workflow Stage *
                </label>

                <select
                  value={selectedStageId}
                  onChange={(e) => {
                    setSelectedStageId(
                      e.target.value
                    );
                    setValidationError('');
                  }}
                  className="w-full p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
                >

                  {stages.map((stage) => {

                    const isRecommended =
                      nextRecommendedStage &&
                      stage.id ===
                        nextRecommendedStage.id;

                    return (
                      <option
                        key={stage.id}
                        value={stage.id}
                        className="bg-slate-900 text-white"
                      >
                        {stage.stage_order}.{' '}
                        {stage.name}{' '}
                        {isRecommended
                          ? '★ (RECOMMENDED NEXT STAGE)'
                          : ''}
                      </option>
                    );
                  })}

                </select>

              </div>

              {/* DESTINATION LOCATION */}

              <div>

                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Physical Location
                </label>

                <select
                  value={selectedLocationId}
                  onChange={(e) =>
                    setSelectedLocationId(
                      e.target.value
                    )
                  }
                  className="w-full p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
                >

                  {locations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                      className="bg-slate-900 text-white"
                    >
                      {location.name}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {/* COMMENT */}

            <div>

              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-1.5">

                {isAdmin &&
                (isAdminCorrectionMode ||
                  (nextRecommendedStage &&
                    parseInt(selectedStageId) !==
                      nextRecommendedStage.id))
                  ? 'Correction Justification Comment *'
                  : 'Movement Comment (Optional)'}

              </label>

              <input
                type="text"
                required={
                  isAdmin &&
                  (isAdminCorrectionMode ||
                    (nextRecommendedStage &&
                      parseInt(selectedStageId) !==
                        nextRecommendedStage.id))
                }
                placeholder={
                  isAdminCorrectionMode
                    ? 'e.g. Sample re-routed to Oven for moisture re-drying'
                    : 'e.g. Manual barcode entry due to scanner disconnection'
                }
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);

                  if (validationError) {
                    setValidationError('');
                  }
                }}
                className="w-full p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />

            </div>

            {/* CONFIRM BUTTON */}

            <div className="pt-2">

              <button
                type="submit"
                disabled={submittingMovement}
                className={`w-full py-3.5 px-6 text-xs font-bold text-white rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-40 ${
                  isAdminCorrectionMode
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/20'
                    : 'bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 shadow-emerald-600/25'
                }`}
              >

                {submittingMovement ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />

                    <span>
                      Validating and Recording Stage Movement...
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />

                    <span>
                      {isAdminCorrectionMode
                        ? 'Confirm Exceptional Admin Correction'
                        : 'Confirm Manual Stage Movement'}
                    </span>
                  </>
                )}

              </button>

            </div>

          </form>

        </div>
      )}

      {/* ======================================================
          MOVEMENT HISTORY
      ====================================================== */}

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md relative z-10 hover:border-emerald-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-200">

        {/* ==================================================
            TABLE HEADER
        ================================================== */}

        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">

          <div className="flex items-center space-x-2.5">

            <Clock className="h-4 w-4 text-emerald-400" />

            <h2 className="text-sm font-bold text-white tracking-tight">
              Active Movement Session Logs (
              {movementsHistory.length}
              )
            </h2>

          </div>

          {/* ==================================================
              SESSION BUTTONS
          ================================================== */}

          <div className="flex items-center gap-3">

            {movementsHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearSession}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center font-bold transition-colors cursor-pointer"
              >

                <Trash2 className="h-3.5 w-3.5 mr-1" />

                <span>
                  Clear Session
                </span>

              </button>
            )}

            {sessionCleared && movementsHistory.length === 0 && (
              <button
                type="button"
                onClick={handleRestoreHistory}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center font-bold transition-colors cursor-pointer"
              >

                <RefreshCw className="h-3.5 w-3.5 mr-1" />

                <span>
                  Restore History
                </span>

              </button>
            )}

          </div>

        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {movementsHistory.length === 0 ? (

          <div className="py-12 px-6 text-center space-y-3">

            <div className="relative inline-flex items-center justify-center">

              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-500/20 opacity-75 motion-reduce:hidden" />

              <div className="p-4 bg-emerald-950/80 text-emerald-400 rounded-2xl border border-emerald-800/60 shadow-lg relative">

                <ArrowRightLeft className="h-7 w-7" />

              </div>

            </div>

            <h3 className="text-xs font-bold text-slate-300">
              Ready for Movements
            </h3>

            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">

              {sessionCleared
                ? 'The movement session display has been cleared. Existing database records are not deleted.'
                : 'No manual movements have been processed in this session yet.'}

            </p>

          </div>

        ) : (

          /* ==================================================
             TABLE
             ================================================== */

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">

                <tr>

                  <th className="p-3.5 pl-5">
                    Time
                  </th>

                  <th className="p-3.5">
                    Sample Code
                  </th>

                  <th className="p-3.5">
                    Stage Progression
                  </th>

                  <th className="p-3.5">
                    Status
                  </th>

                  <th className="p-3.5 pr-5 text-right">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800/60">

                {movementsHistory
                  .slice(0, 15)
                  .map((movement, idx) => {

                    const sampleCode =
                      getSampleCode(
                        movement
                      );

                    const status =
                      getMovementStatus(
                        movement
                      );

                    return (
                      <tr
                        key={
                          movement.id ||
                          `${sampleCode}-${idx}`
                        }
                        className="hover:bg-slate-800/50 transition-colors duration-150 animate-in fade-in slide-in-from-top-1"
                        style={{
                          animationDelay: `${
                            idx * 30
                          }ms`,
                        }}
                      >

                        {/* TIME */}

                        <td className="p-3.5 pl-5 text-slate-400 whitespace-nowrap font-mono">

                          {movement.created_at
                            ? new Date(
                                movement.created_at
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                }
                              )
                            : '—'}

                        </td>

                        {/* SAMPLE CODE */}

                        <td className="p-3.5 font-mono font-bold text-emerald-400 whitespace-nowrap">

                          {movement.sample_id ? (
                            <Link
                              to={`/samples/${movement.sample_id}`}
                              className="hover:text-emerald-300 hover:underline"
                            >
                              {sampleCode}
                            </Link>
                          ) : (
                            sampleCode
                          )}

                        </td>

                        {/* STAGE PROGRESSION */}

                        <td className="p-3.5">

                          {movement.from_stage ||
                          movement.to_stage ? (

                            <div className="flex items-center space-x-2 whitespace-nowrap">

                              {movement.from_stage ? (
                                <StatusBadge
                                  stageName={
                                    movement
                                      .from_stage
                                      .name
                                  }
                                />
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">
                                  Initial Registration
                                </span>
                              )}

                              <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />

                              {movement.to_stage ? (
                                <StatusBadge
                                  stageName={
                                    movement
                                      .to_stage
                                      .name
                                  }
                                />
                              ) : (
                                <span className="text-slate-500">
                                  —
                                </span>
                              )}

                            </div>

                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              Stage information unavailable
                            </span>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="p-3.5">

                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              status ===
                              'SUCCESS'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                                : status ===
                                  'CORRECTION'
                                ? 'bg-red-950/80 text-red-300 border-red-800/60'
                                : 'bg-red-950/80 text-red-300 border-red-800/60'
                            }`}
                          >

                            {status}

                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="p-3.5 pr-5 text-right">

                          {movement.sample_id ? (
                            <Link
                              to={`/samples/${movement.sample_id}`}
                              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline inline-flex items-center text-[11px]"
                            >

                              <span>
                                View Details
                              </span>

                              <ExternalLink className="h-3 w-3 ml-1 opacity-70" />

                            </Link>
                          ) : (
                            <span className="text-slate-600 text-[11px]">
                              No Details
                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default Movements;