import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  User,
  Mail,
  Shield,
  Building2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoAsari from '../../logo_asari.png';
import bg1 from '../../bg_1.png';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [laboratoryName, setLaboratoryName] = useState('');
  const [role, setRole] = useState('TECHNICIAN');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanLaboratoryName = laboratoryName.trim();

    if (!cleanEmail || !password.trim() || !cleanLaboratoryName) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);

      await register({
        username:
          cleanFullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: password,
        laboratory_name: cleanLaboratoryName,
        role: role,
        is_active: true,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);

      const detail = err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item?.msg || 'Invalid registration data.')
            .join(' ')
        );
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError(
          'Registration failed. Email address may already be in use.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white relative overflow-hidden">

      {/* =========================================================
          GLOBAL BACKGROUND — SAME AS HOME / LOGIN
      ========================================================= */}

      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-100"
        style={{ backgroundImage: `url(${bg1})` }}
      />

      {/* Dark uniform overlay */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none" />

      {/* Ambient emerald glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-emerald-600/15 blur-[140px] pointer-events-none rounded-full" />

      {/* =========================================================
          HEADER — SAME AS HOME / LOGIN
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
          REGISTER CONTENT
      ========================================================= */}

      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="w-full sm:max-w-md space-y-6">

          {/* =====================================================
              BACK TO HOME
          ===================================================== */}

          <div className="flex items-center justify-between gap-3">

            <Link
              to="/"
              className="inline-flex items-center text-xs font-semibold text-slate-300 hover:text-white transition-all duration-300 group cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-lg px-3 py-1.5 bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/50 backdrop-blur-md shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform duration-300 text-emerald-400" />

              <span>Back to Home</span>
            </Link>

            <span className="hidden sm:inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800/80 shadow-inner backdrop-blur-md">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />

              <span>Laboratory Registration</span>

            </span>

          </div>

          {/* =====================================================
              REGISTRATION CARD
          ===================================================== */}

          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">

            {/* Card Header */}

            <div className="border-b border-slate-800/60 pb-4">

              <h2 className="text-lg font-bold text-white tracking-tight">
                Create New Account
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Register your user account and associate it with your laboratory
              </p>

            </div>

            {/* Error Message */}

            {error && (
              <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-red-200 font-medium">

                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />

                <div className="leading-relaxed">
                  {error}
                </div>

              </div>
            )}

            {/* =================================================
                REGISTRATION FORM
            ================================================= */}

            <form
              className="space-y-4"
              onSubmit={handleSubmit}
            >

              {/* Full Name */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>

                <div className="relative">

                  <User className="h-4 w-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />

                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200"
                  />

                </div>

              </div>

              {/* Email */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address *
                </label>

                <div className="relative">

                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. s.jenkins@lab.com"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password *
                </label>

                <div className="relative">

                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />

                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200"
                  />

                </div>

              </div>

              {/* Laboratory Name */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Laboratory Name *
                </label>

                <div className="relative">

                  <Building2 className="h-4 w-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />

                  <input
                    type="text"
                    required
                    value={laboratoryName}
                    onChange={(e) => setLaboratoryName(e.target.value)}
                    placeholder="e.g. Central Laboratory"
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200"
                  />

                </div>

                <p className="text-[10px] text-slate-500 mt-1">
                  Type your laboratory's name. If it exists, you will join it;
                  otherwise, it will be created automatically.
                </p>

              </div>

              {/* Laboratory Role */}

              <div>

                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Laboratory Role *
                </label>

                <div className="relative">

                  <Shield className="h-4 w-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full pl-9 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200"
                  >

                    <option
                      value="TECHNICIAN"
                      className="bg-slate-900 text-white"
                    >
                      Technician
                    </option>

                    <option
                      value="PROFESSOR"
                      className="bg-slate-900 text-white"
                    >
                      Professor
                    </option>

                  </select>

                </div>

              </div>

              {/* Submit Button */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg group mt-2"
              >

                <span>
                  {submitting
                    ? 'Creating Account...'
                    : 'Create Account'}
                </span>

                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />

              </button>

            </form>

            {/* =================================================
                NAVIGATION LINK TO LOGIN
            ================================================= */}

            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">

              <span>Already have an account? </span>

              <Link
                to="/login"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center ml-1 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
              >
                <span>Sign In</span>
              </Link>

            </div>

          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div className="text-center">

            <p className="text-[10px] text-slate-500 font-medium">
              ASARI Sample Tracking • UM6P
            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Register;