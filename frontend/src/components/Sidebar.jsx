import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Tag,
  ClipboardList,
  DollarSign,
  Package,
  Scissors
} from 'lucide-react';

export const Sidebar = ({ isOpen, user, onClose }) => {
  const isAdmin = user?.role === 'admin';

  const adminNav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/work-logs', label: 'Rekap Pekerjaan Harian', icon: ClipboardList },
    { to: '/workers', label: 'Kelola Akun Pekerja', icon: Users },
    { to: '/models', label: 'Master Model Pakaian', icon: Package },
    { to: '/piece-rates', label: 'Harga Borong per Pcs', icon: Tag },
    { to: '/salary-report', label: 'Laporan Gaji Pekerja', icon: DollarSign },
  ];

  const workerNav = [
    { to: '/', label: 'Input Rekap Harian Saya', icon: Scissors },
    { to: '/work-logs', label: 'Riwayat Pengerjaan', icon: ClipboardList },
  ];

  const navItems = isAdmin ? adminNav : workerNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base leading-tight">Sistem Ziyyata Mode</h2>
            <p className="text-slate-400 text-xs mt-0.5">Produksi & Rekap Gaji</p>
          </div>
        </div>

        <div className="p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Menu Navigasi
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info user */}
        <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 border border-slate-700">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-400 capitalize truncate">@{user?.username}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
