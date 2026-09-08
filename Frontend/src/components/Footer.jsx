import React from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0F17] border-t border-slate-800/80 text-xs font-sans text-slate-400 py-4 px-6 text-center relative z-30 mt-auto selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white">ASARI Sample Tracking</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-[11px]">Laboratory Sample Tracking & Traceability System</span>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          Developed for ASARI — UM6P © {currentYear}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
