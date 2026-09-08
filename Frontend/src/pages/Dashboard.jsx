import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard,
  RefreshCw,
  Layers,
  FlaskConical,
  Flame,
  Microscope,
  Archive,
  CalendarPlus,
  FolderKanban,
  Activity
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import ErrorMessage from '../components/ErrorMessage';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import KPICard from '../components/dashboard/KPICard';
import WorkflowPipeline from '../components/dashboard/WorkflowPipeline';
import RecentMovementsTable from '../components/dashboard/RecentMovementsTable';
import RecentSamplesTable from '../components/dashboard/RecentSamplesTable';

// Même background que Home.jsx
import bg1 from '../../bg_1.png';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [inventoryPulse, setInventoryPulse] = useState(false);

  const prevTotalRef = useRef(null);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const data = await dashboardService.getStatistics();

      // Trigger active inventory pulse ONLY if inventory total count changes
      if (
        prevTotalRef.current !== null &&
        prevTotalRef.current !== data.total_samples
      ) {
        setInventoryPulse(true);
        setTimeout(() => setInventoryPulse(false), 1200);
      }

      prevTotalRef.current = data.total_samples;

      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);

      setError(
        err.response?.data?.detail ||
        'Unable to connect to the laboratory backend server. Please verify the API connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return '—';

    try {
      const date = new Date(dateString);

      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        {/* Global Background */}
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bg1})` }}
          />

          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />
        </div>

        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative text-slate-100 font-sans">
        {/* Global Background */}
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bg1})` }}
          />

          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />
        </div>

        <div className="max-w-4xl mx-auto py-8 px-4">
          <ErrorMessage
            message={error}
            onRetry={() => fetchStats(false)}
          />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const total = stats.total_samples || 0;
  const receptionCount = stats.samples_in_reception || 0;
  const ovenCount = stats.samples_in_oven || 0;
  const analysisCount = stats.samples_in_analysis || 0;
  const storageCount = stats.samples_in_storage || 0;
  const totalProjects = stats.total_projects || 0;

  const calcPercent = (count) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="min-h-screen relative text-slate-100 font-sans selection:bg-emerald-500 selection:text-white motion-reduce:animate-none">

      {/* =========================================================
          GLOBAL BACKGROUND
         ========================================================= */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg1})` }}
        />
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />
      </div>

      {/* =========================================================
          DASHBOARD CONTENT
         ========================================================= */}
      <div className="space-y-6 pb-12 relative">

        {/* Ambient Background Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

        {/* =====================================================
            1. HEADER BAR
           ===================================================== */}
        <div className="bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-5 md:p-6 flex items-center justify-between gap-4 relative z-10 animate-in fade-in slide-in-from-top-3 duration-300">

          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-gradient-to-r from-emerald-600 to-violet-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 shrink-0">
              <LayoutDashboard className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Laboratory{' '}
                <span className="text-emerald-400">
                  Dashboard
                </span>
              </h1>

              <p className="text-xs text-slate-400 font-medium mt-1">
                Real-time sample tracking, workflow stage distribution & custody logs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-emerald-300 text-xs font-bold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>

              <span className="hidden sm:inline">
                Live Monitor
              </span>
            </div>

            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl border border-slate-700 transition-all duration-150 cursor-pointer disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
              title="Refresh laboratory metrics"
            >
              <RefreshCw
                className={`h-4 w-4 text-emerald-400 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* =====================================================
            2. KEY METRICS KPI CARDS GRID
           ===================================================== */}
        <div className="space-y-4 relative z-10">

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <KPICard
              label="Total Projects"
              value={totalProjects}
              icon={FolderKanban}
              subtitle="Active research projects"
              theme="indigo"
              delayMs={200}
            />

            <KPICard
              label="Total Samples"
              value={total}
              icon={Layers}
              subtitle="Active specimen inventory"
              theme="indigo"
              delayMs={0}
              isPulsing={inventoryPulse}
            />

            <KPICard
              label="Created Today"
              value={stats.samples_created_today || 0}
              icon={CalendarPlus}
              subtitle="New specimens registered today"
              theme="indigo"
              delayMs={200}
            />

            <KPICard
              label="Movements Today"
              value={stats.movements_today || 0}
              icon={Activity}
              subtitle="Barcode scans & manual transitions"
              theme="indigo"
              delayMs={200}
            />

          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <KPICard
              label="1. Reception"
              value={receptionCount}
              icon={FlaskConical}
              subtitle="of total volume"
              percent={calcPercent(receptionCount)}
              theme="blue"
              delayMs={75}
            />

            <KPICard
              label="2. Oven"
              value={ovenCount}
              icon={Flame}
              subtitle="in thermal drying"
              percent={calcPercent(ovenCount)}
              theme="amber"
              delayMs={100}
            />

            <KPICard
              label="3. Analysis"
              value={analysisCount}
              icon={Microscope}
              subtitle="in lab testing"
              percent={calcPercent(analysisCount)}
              theme="purple"
              delayMs={150}
            />

            <KPICard
              label="4. Storage"
              value={storageCount}
              icon={Archive}
              subtitle="archived in custody"
              percent={calcPercent(storageCount)}
              theme="emerald"
              delayMs={200}
            />

          </div>

        </div>

        {/* =====================================================
            3. VISUAL WORKFLOW PIPELINE
           ===================================================== */}
        <div className="relative z-10">

          <WorkflowPipeline
            total={total}
            receptionCount={receptionCount}
            ovenCount={ovenCount}
            analysisCount={analysisCount}
            storageCount={storageCount}
            isPulsing={inventoryPulse}
          />

        </div>

        {/* =====================================================
            4. RECENT MOVEMENTS & RECENT SAMPLES
           ===================================================== */}
        <div className="grid grid-cols-1 gap-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-300">

          <RecentSamplesTable
            samples={stats.recent_samples || []}
            formatDate={formatDate}
          />

          <RecentMovementsTable
            movements={stats.recent_movements || []}
            formatDate={formatDate}
          />

        </div>

      </div>
    </div>
  );
};

export default Dashboard;