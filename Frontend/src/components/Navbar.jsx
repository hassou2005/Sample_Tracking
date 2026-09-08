import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AsariLogo from './AsariLogo';

export const Navbar = () => {
  const { user } = useAuth();

  // Extraction dynamique du nom de l'utilisateur (avec fallback)
  const displayName = 
    user?.fullName || 
    user?.full_name || 
    user?.username || 
    user?.email?.split('@')[0] || 
    'User';

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40 h-16 flex items-center justify-between px-6 shadow-2xl">
      {/* Côté Gauche : Logo & Version */}
      <div className="flex items-center space-x-3">
        <AsariLogo className="h-8" showText={true} />
        <span className="hidden md:inline-block ml-2 text-[10px] bg-emerald-950/80 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-800/60 font-mono">
          System v1.0.0
        </span>
      </div>

      {/* Côté Droit : Bouton Profil Dynamique & Stylisé */}
      <div className="flex items-center space-x-4">
        {user && (
          <Link
            to="/profile"
            className="group flex items-center justify-between space-x-3 min-w-[160px] sm:min-w-[180px] bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl px-4 py-2 backdrop-blur-xs transition-all duration-300 ease-in-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              {/* Avatar animé au survol */}
              <div className="bg-emerald-950 text-emerald-400 p-1.5 rounded-full border border-emerald-900/80 transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:scale-110 group-hover:shadow-sm group-hover:shadow-emerald-500/50">
                <UserIcon className="h-4 w-4" />
              </div>

              {/* Information Utilisateur */}
              <div className="text-left">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors duration-300 truncate max-w-[110px] block">
                  {displayName}
                </span>
              </div>
            </div>

            {/* Petite flèche indicative animée */}
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 transition-all duration-300 transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;