import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import { ShieldAlert } from 'lucide-react';
import heroBg from '../../bg_1.png';

export const ProtectedRoute = ({ requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] text-slate-100">
        <Loading message="Validating laboratory session credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const shell = (children) => (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />

        <main className="relative flex-1 min-h-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed  pointer-events-none"
            style={{
              backgroundImage: `url(${heroBg})`,
              filter: 'brightness(0.5) saturate(0.75)',
            }}
          />
          <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

          <div className="relative z-10 h-full overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );

  if (requiredRole && user?.role !== requiredRole) {
    return shell(
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-slate-900/80 border border-red-800/80 backdrop-blur-md rounded-2xl p-6 text-center shadow-2xl">
          <div className="bg-red-950/80 text-red-400 p-3 rounded-full w-fit mx-auto mb-3 border border-red-800/60">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Access Restricted</h3>
          <p className="text-xs text-slate-400 mb-4">
            This section requires an{' '}
            <strong className="text-red-400">{requiredRole}</strong> role. Your
            account has the <strong>{user?.role}</strong> role.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return shell(<Outlet />);
};

export default ProtectedRoute;