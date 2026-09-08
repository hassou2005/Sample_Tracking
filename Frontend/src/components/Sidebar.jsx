import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  QrCode, 
  FilePlus2, 
  ListFilter, 
  Users, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { isAdmin, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scanner', label: 'QR Scanner', icon: QrCode },
    { to: '/movements', label: 'Manual Movements', icon: ArrowRightLeft },
    { to: '/samples', label: 'Samples Directory', icon: ListFilter },
    { to: '/samples/new', label: 'Register Sample', icon: FilePlus2 },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', label: 'User Directory', icon: Users });
  }

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 text-slate-300 h-[calc(100vh-4rem)] sticky top-16 p-4 flex flex-col justify-between shrink-0 backdrop-blur-md z-30">
      <div className="space-y-6 overflow-y-auto flex-1 pr-1">
        <div>
          <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;