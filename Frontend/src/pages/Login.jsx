import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoAsari from '../../logo_asari.png';
import bg1 from '../../bg_1.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email address and password.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);

      await login(email.trim(), password, rememberMe);

      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Authentication failed. Please verify your credentials or register a new account.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white relative overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-100"
        style={{ backgroundImage: `url(${bg1})` }}
      />

      {/* DARK OVERLAY */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none" />

      {/* =========================================================
          TOP NAVIGATION — SAME STYLE AS HOME
      ========================================================= */}

      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 justify-between flex items-center group">

          {/* Logo — LEFT */}
          <Link
            to="/"
            className="flex items-center"
          >
            <img
              src={logoAsari}
              alt="ASARI Logo"
              className="h-12 w-auto object-contain transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5"
            />
          </Link>

          {/* Title — RIGHT */}
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

      {/* =========================================================
          LOGIN CONTENT
      ========================================================= */}

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="w-full sm:max-w-md space-y-6">

          {/* =====================================================
              BACK TO HOME + SECURITY BADGE
          ===================================================== */}

          <div className="flex items-center justify-between">

            <Link
              to="/"
              className="inline-flex items-center text-xs font-semibold text-slate-300 hover:text-white transition-colors group cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-lg px-3 py-1.5 bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/50 backdrop-blur-md shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform text-emerald-400" />

              <span>Back to Home</span>
            </Link>

            <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 shadow-inner backdrop-blur-md">

              <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />

              <span>Secure Authentication</span>

            </span>

          </div>

          {/* =====================================================
              LOGIN CARD
          ===================================================== */}

          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">

            {/* Card Header */}

            <div className="border-b border-slate-800/80 pb-4">

              <h2 className="text-lg font-bold text-white tracking-tight">
                Sign In to Laboratory
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Enter your email and password to access your laboratory workspace
              </p>

            </div>

            {/* Error Message */}

            {error && (
              <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-red-200 font-medium animate-in fade-in duration-150">

                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />

                <div className="leading-relaxed">
                  {error}
                </div>

              </div>
            )}

            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >

              {/* Email */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email / Username
                </label>

                <div className="relative">

                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />

                  <input
                    type="text"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email or username"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-150"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>

                <div className="relative">

                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />

                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-150"
                  />

                </div>

              </div>

              {/* Remember Me */}

              <div className="flex items-center justify-between pt-1">

                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                  />

                  <span>Remember me</span>

                </label>

              </div>

              {/* Submit Button */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/35 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >

                <span>
                  {submitting ? 'Authenticating...' : 'Sign In'}
                </span>

                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />

              </button>

            </form>

            {/* =================================================
                ACCOUNT CREATION
            ================================================= */}

            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">

              <span>Don't have an account? </span>

              <Link
                to="/register"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center ml-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
              >

                <UserPlus className="h-3.5 w-3.5 mr-1" />

                <span>Create an Account / Sign Up</span>

              </Link>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Login;