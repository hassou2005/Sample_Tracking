import React from 'react';
import { User, Mail, Building, Shield, LogOut } from 'lucide-react';
import { authService } from '../services/authService';

export const Profile = () => {
  // Récupération et normalisation des données utilisateur
  const rawUser = JSON.parse(localStorage.getItem('user')) || {};

  const user = {
    fullName: rawUser.fullName || rawUser.full_name || rawUser.username || rawUser.name || 'Not provided',
    email: rawUser.email || 'Not provided',
    labName: rawUser.labName || rawUser.lab_name || rawUser.laboratory_name || rawUser.laboratory || 'Not provided',
    role: rawUser.role || rawUser.laboratory_role || 'Technician',
  };

  const initialLetter = user.fullName !== 'Not provided' ? user.fullName.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    if (authService?.logout) {
      authService.logout();
    } else {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* Header Profil */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-500/10">
            {initialLetter}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              {user.role}
            </span>
          </div>
        </div>

        {/* Grille des 4 informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <User className="text-emerald-400 w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Full Name</p>
              <p className="text-sm font-medium text-slate-200">{user.fullName}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <Mail className="text-emerald-400 w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Email Address</p>
              <p className="text-sm font-medium text-slate-200">{user.email}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <Building className="text-emerald-400 w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Laboratory Name</p>
              <p className="text-sm font-medium text-slate-200">{user.labName}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <Shield className="text-emerald-400 w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Laboratory Role</p>
              <p className="text-sm font-medium text-slate-200">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};