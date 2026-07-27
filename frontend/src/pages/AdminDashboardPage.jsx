import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Scissors
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [summary, setSummary] = useState({
    todayPcs: 0,
    monthPcs: 0,
    totalWorkers: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, logRes] = await Promise.all([
        request.get(API_ENDPOINTS.REPORTS.SUMMARY),
        request.get(API_ENDPOINTS.WORK_LOGS.LIST, { page: 1, limit: 5 })
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (logRes.success) setRecentLogs(logRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'potong': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'sablon': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'obras': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'kelin': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdek': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'sambung': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/30">
            Panel Pengelolaan Produksi
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2">
            Dashboard Utama Konveksi
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Monitoring rekap pengerjaan harian tukang potong, sablon, obras, kelin, overdek, dan sambung serta laporan kalkulasi gaji pekerja secara langsung.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Produksi Hari Ini</div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {summary.todayPcs.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">pcs</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Produksi Bulan Ini</div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {summary.monthPcs.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">pcs</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Akun Pekerja</div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {summary.totalWorkers} <span className="text-xs font-normal text-slate-500">orang</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/workers"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs transition-all flex flex-col justify-between group"
        >
          <Users className="w-5 h-5 text-sky-600 mb-2" />
          <div>
            <div className="font-bold text-slate-800 text-sm">Akun Pekerja</div>
            <div className="text-xs text-slate-400 mt-0.5">Kelola & Tambah</div>
          </div>
        </Link>

        <Link
          to="/piece-rates"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs transition-all flex flex-col justify-between group"
        >
          <DollarSign className="w-5 h-5 text-emerald-600 mb-2" />
          <div>
            <div className="font-bold text-slate-800 text-sm">Harga Borong</div>
            <div className="text-xs text-slate-400 mt-0.5">Atur Tarif per Pcs</div>
          </div>
        </Link>

        <Link
          to="/work-logs"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs transition-all flex flex-col justify-between group"
        >
          <ClipboardList className="w-5 h-5 text-indigo-600 mb-2" />
          <div>
            <div className="font-bold text-slate-800 text-sm">Rekap Pengerjaan</div>
            <div className="text-xs text-slate-400 mt-0.5">Semua Input Harian</div>
          </div>
        </Link>

        <Link
          to="/salary-report"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs transition-all flex flex-col justify-between group"
        >
          <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
          <div>
            <div className="font-bold text-slate-800 text-sm">Laporan Gaji</div>
            <div className="text-xs text-slate-400 mt-0.5">Hitung Total Upah</div>
          </div>
        </Link>
      </div>

      {/* Table Rekap Pengerjaan Terbaru */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Rekap Input Terbaru Pekerja</h2>
            <p className="text-xs text-slate-500">Hasil input pengerjaan harian terkini</p>
          </div>
          <Link
            to="/work-logs"
            className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Memuat data...</div>
        ) : recentLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">Belum ada rekap pengerjaan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pekerja</th>
                  <th className="py-3 px-4">Role Job</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4 text-right">Hasil (Pcs)</th>
                  <th className="py-3 px-4 text-right">Est. Upah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {new Date(log.work_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.worker_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getRoleBadgeClass(log.worker_role)}`}>
                        {log.worker_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{log.model_name}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {log.quantity_pcs.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      Rp {Number(log.total_pay).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
