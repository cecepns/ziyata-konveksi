import React from 'react';
import { Menu, LogOut } from 'lucide-react';

export const Navbar = ({ user, onToggleSidebar, onLogout }) => {
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'User Admin';
      case 'potong': return 'Tukang Potong Kain';
      case 'sablon': return 'Tukang Sablon';
      case 'obras': return 'Tukang Obras';
      case 'kelin': return 'Tukang Kelin / Hemming';
      case 'overdek': return 'Tukang Kolor / Overdek';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Toggle Button hanya di Mobile */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors md:hidden"
          title="Toggle Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Logo & Title hanya di Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-sm">
            K
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-base sm:text-lg">
            Rekap<span className="text-sky-600">Konveksi</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{user.name}</span>
              <span className="text-[11px] text-sky-600 font-medium px-2 py-0.5 bg-sky-50 rounded-md border border-sky-100 inline-block">
                {getRoleLabel(user.role)}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-200 shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
