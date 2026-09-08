import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScanBarcode,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
  ChevronRight,
  Sprout,
  Zap,
  Droplets,
  TestTube,
  Building2,
  LayoutDashboard,
  FilePlus2,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoAsari from '../../logo_asari.png';

import bg1 from '../../bg_1.png';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-transparent text-slate-100 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative">

      {/* ============================================================
          GLOBAL BACKGROUND
          Image + single uniform dark overlay
      ============================================================ */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bg1})` }}
        />

        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />
      </div>

      {/* ============================================================
          1. HEADER / TOP NAVIGATION BAR
      ============================================================ */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 justify-between flex items-center group">

          {/* Logo — reste à gauche */}
          <Link to="/" className="flex items-center">

            <img
              src={logoAsari}
              alt="ASARI Logo"
              className="h-12 w-auto object-contain transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5"
            />

          </Link>

          {/* Titre */}
          <Link
            to="/"
            className="flex flex-col items-end text-right ml-4"
          >

            <span className="font-black text-white text-lg tracking-tight leading-none transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5">

              ASARI{' '}

              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Sample Tracking
              </span>

            </span>

            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1 transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5">

              UM6P • Agriculture & Sustainability

            </span>

          </Link>

        </div>

      </header>

      {/* ============================================================
          2. HERO SECTION
      ============================================================ */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 bg-transparent overflow-hidden">

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-emerald-600/15 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8 animate-in fade-in duration-500">

          <div className="space-y-4 max-w-4xl mx-auto">

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none">

              ASARI{' '}

              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Sample Tracking
              </span>

            </h1>

            <p className="text-lg sm:text-xl font-bold text-slate-300 tracking-wide">

              Laboratory Sample Tracking & Traceability System

            </p>

            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">

              An integrated application for laboratory sample tracking, workflow management, and traceability. Developed for ASARI — African Sustainable Agriculture Research Institute, UM6P.

            </p>

          </div>

          <div className="flex justify-center pt-4">

            {user ? (

              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 active:scale-95"
              >

                <span>Access Console</span>

                <ArrowRight className="h-4 w-4" />

              </Link>

            ) : (

              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all duration-300 ease-out flex items-center justify-center space-x-2 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
              >

                <span>Get Started</span>

                <ArrowRight className="h-4 w-4" />

              </Link>

            )}

          </div>

          {/* Workflow Interactive Preview */}
          <div className="pt-8 max-w-3xl mx-auto">

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-3 shadow-xl">

              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">

                Standard Laboratory Workflow Progression

              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-bold">

                <div className="p-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl text-emerald-300">

                  <div className="text-[10px] text-emerald-400/80">
                    Stage 1
                  </div>

                  <div>✓ RECEPTION</div>

                </div>

                <div className="p-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl text-emerald-300">

                  <div className="text-[10px] text-emerald-400/80">
                    Stage 2
                  </div>

                  <div>✓ OVEN</div>

                </div>

                <div className="p-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl text-emerald-200 ring-2 ring-emerald-500/30">

                  <div className="text-[10px] text-emerald-400">
                    Stage 3
                  </div>

                  <div>★ ANALYSIS</div>

                </div>

                <div className="p-2.5 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl text-slate-500">

                  <div className="text-[10px] text-slate-600">
                    Stage 4
                  </div>

                  <div>○ STORAGE</div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ============================================================
          3. ASARI RESEARCH FOCUS AREAS
      ============================================================ */}
      <section className="relative py-14 bg-transparent border-t border-slate-800/80 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

          <div className="text-center space-y-2 max-w-2xl mx-auto">

            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Institutional Context
            </h2>

            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Supporting ASARI Research Domains & Laboratories
            </p>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl space-y-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-emerald-500/10">

              <Sprout className="h-5 w-5 text-emerald-400 mx-auto" />

              <div className="text-xs font-bold text-slate-200">
                Agriculture in Marginal Lands
              </div>

            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl space-y-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-teal-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-teal-500/10">

              <Zap className="h-5 w-5 text-teal-400 mx-auto" />

              <div className="text-xs font-bold text-slate-200">
                Biorefinery & Bioenergy
              </div>

            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl space-y-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-cyan-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-cyan-500/10">

              <Droplets className="h-5 w-5 text-cyan-400 mx-auto" />

              <div className="text-xs font-bold text-slate-200">
                Water & Energy Sustainability
              </div>

            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl space-y-2 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-emerald-500/10">

              <Building2 className="h-5 w-5 text-emerald-400 mx-auto" />

              <div className="text-xs font-bold text-slate-200">
                Animal Value Chain
              </div>

            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl space-y-2 col-span-2 sm:col-span-1 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-teal-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-teal-500/10">

              <TestTube className="h-5 w-5 text-teal-400 mx-auto" />

              <div className="text-xs font-bold text-slate-200">
                Algal Biotechnology Research
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ============================================================
          4. FEATURES SECTION
      ============================================================ */}
      <section className="relative py-16 bg-transparent border-y border-slate-800/80 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

          <div className="text-center space-y-3 max-w-2xl mx-auto">

            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              System Capabilities
            </h2>

            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Designed for High-Compliance Laboratory Workflows
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-3 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-500/10">

              <div className="p-2.5 bg-slate-900/80 text-emerald-400 rounded-xl w-fit border border-slate-800/80">
                <ScanBarcode className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-white">
                Barcode Identification
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Instantly generates unique barcode labels for every sample to ensure fast and error-free recognition across all lab stations.
              </p>

            </div>

            <div className="p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-3 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-500/10">

              <div className="p-2.5 bg-slate-900/80 text-emerald-400 rounded-xl w-fit border border-slate-800/80">
                <Activity className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-white">
                Workflow Management
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Move samples smoothly between operational stages with a quick barcode scan at any workstation.
              </p>

            </div>

            <div className="p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-3 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-500/10">

              <div className="p-2.5 bg-slate-900/80 text-emerald-400 rounded-xl w-fit border border-slate-800/80">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-white">
                Sample Traceability
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Keep a clear and reliable record showing who handled each sample, where it went, and when every action occurred.
              </p>

            </div>

            <div className="p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-3 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-500/10">

              <div className="p-2.5 bg-slate-900/80 text-emerald-400 rounded-xl w-fit border border-slate-800/80">
                <FilePlus2 className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-white">
                Laboratory Operations
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Easily register incoming samples with key details such as species, origin, collection site, and category.
              </p>

            </div>

            <div className="p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-3 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-500/10">

              <div className="p-2.5 bg-slate-900/80 text-emerald-400 rounded-xl w-fit border border-slate-800/80">
                <Clock className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-white">
                Movement History
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                View a clear timeline showing the complete journey of a sample from initial reception to final storage.
              </p>

            </div>

            <div className="p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-3 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-emerald-500/10">

              <div className="p-2.5 bg-slate-900/80 text-emerald-400 rounded-xl w-fit border border-slate-800/80">
                <LayoutDashboard className="h-6 w-6" />
              </div>

              <h3 className="text-base font-bold text-white">
                Laboratory Dashboard
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Monitor active samples, stage distributions, and overall laboratory progress in real time on an intuitive dashboard.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ============================================================
          5. HOW IT WORKS
      ============================================================ */}
      <section className="relative py-16 bg-transparent border-y border-slate-800/80 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-3 max-w-2xl mx-auto">

            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Operating Procedure
            </h2>

            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              How ASARI Sample Tracking Works
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-2 relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-emerald-500/10">

              <span className="text-xs font-black text-emerald-400 font-mono">
                01.
              </span>

              <h4 className="text-xs font-bold text-white uppercase">
                Register Sample
              </h4>

              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Enter sample details such as category, origin, and collection date into the system.
              </p>

            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-2 relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-emerald-500/10">

              <span className="text-xs font-black text-emerald-400 font-mono">
                02.
              </span>

              <h4 className="text-xs font-bold text-white uppercase">
                Generate Barcode
              </h4>

              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                The system automatically creates a unique sample ID and printable barcode label.
              </p>

            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-2 relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-emerald-500/10">

              <span className="text-xs font-black text-emerald-400 font-mono">
                03.
              </span>

              <h4 className="text-xs font-bold text-white uppercase">
                Scan at Each Stage
              </h4>

              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Scan the sample barcode at each workstation as work progresses through the lab.
              </p>

            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-2 relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-emerald-500/10">

              <span className="text-xs font-black text-emerald-400 font-mono">
                04.
              </span>

              <h4 className="text-xs font-bold text-white uppercase">
                Track Movement
              </h4>

              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                The system updates the sample status in real time and confirms proper workflow steps.
              </p>

            </div>

            <div className="p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl space-y-2 relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-emerald-600/60 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-emerald-500/10">

              <span className="text-xs font-black text-emerald-400 font-mono">
                05.
              </span>

              <h4 className="text-xs font-bold text-white uppercase">
                Store History
              </h4>

              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Review the complete processing history and tracking log whenever needed.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ============================================================
          6. INSTITUTIONAL FOOTER
      ============================================================ */}
      <footer className="relative py-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800/80 overflow-hidden text-xs text-slate-500">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">

            <span className="font-bold text-slate-300">
              ASARI Sample Tracking
            </span>

            <span className="hidden sm:inline text-slate-600">
              |
            </span>

            <span>
              Laboratory Sample Tracking & Traceability System
            </span>

            <span className="hidden sm:inline text-slate-600">
              |
            </span>

            <span className="text-emerald-400 font-medium">
              Developed for ASARI — UM6P
            </span>

          </div>

          <div className="flex items-center space-x-4">

            {user ? (

              <Link
                to="/dashboard"
                className="text-emerald-400 font-bold hover:underline"
              >
                Dashboard
              </Link>

            ) : (

              <Link
                to="/login"
                className="text-emerald-400 font-bold hover:underline"
              >
                Get Started
              </Link>

            )}

          </div>

        </div>

      </footer>

    </div>
  );
};

export default Home;