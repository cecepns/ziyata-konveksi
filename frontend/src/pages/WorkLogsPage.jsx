import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { DebouncedInput } from '../components/DebouncedInput';
import { Pagination } from '../components/Pagination';
import toast from 'react-hot-toast';
import { ClipboardList, Trash2, Layers, Weight, Filter } from 'lucide-react';

export const WorkLogsPage = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchLogs();
  }, [page, limit, search, roleFilter, dateFrom, dateTo]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.WORK_LOGS.LIST, {
        page,
        limit,
        search,
        role: roleFilter,
        date_from: dateFrom,
        date_to: dateTo
      });

      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.total);
      }
    } catch (err) {
      toast.error('Gagal mengambil data rekap pengerjaan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data rekap pengerjaan ini?')) return;

    try {
      const res = await request.delete(API_ENDPOINTS.WORK_LOGS.DELETE(id));
      if (res.success) {
        toast.success('Rekap pengerjaan berhasil dihapus');
        fetchLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus rekap');
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {isAdmin ? 'Rekap Pekerjaan Harian Seluruh Pekerja' : 'Riwayat Rekap Pekerjaan Saya'}
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Pencatatan hasil obras, kelin, overdek, potong, sablon, dan sambung yang diinput oleh pekerja.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <DebouncedInput
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Cari pekerja, model, jenis kain..."
          className="flex-1"
        />

        {isAdmin && (
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Semua Role Pekerja</option>
            <option value="potong">Potong Kain</option>
            <option value="sablon">Sablon</option>
            <option value="obras">Obras</option>
            <option value="kelin">Kelin / Hemming</option>
            <option value="overdek">Overdek / Kolor</option>
            <option value="sambung">Sambung</option>
          </select>
        )}

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 font-medium"
            title="Dari Tanggal"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 font-medium"
            title="Sampai Tanggal"
          />
        </div>
      </div>

      {/* Table Data Work Logs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Memuat data rekap...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Belum ada rekap pengerjaan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tanggal</th>
                  {isAdmin && <th className="py-3.5 px-4">Nama Pekerja</th>}
                  <th className="py-3.5 px-4">Role Job</th>
                  <th className="py-3.5 px-4">Model Dikerjakan</th>
                  <th className="py-3.5 px-4">Detail Khusus (Potong)</th>
                  <th className="py-3.5 px-4 text-right">Hasil (Pcs)</th>
                  <th className="py-3.5 px-4 text-right">Tarif / Pcs</th>
                  <th className="py-3.5 px-4 text-right">Total Upah</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {new Date(log.work_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {log.worker_name}
                      </td>
                    )}
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getRoleBadgeClass(log.worker_role)}`}>
                        {log.worker_role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{log.model_name}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {log.worker_role === 'potong' && (log.fabric_type || log.fabric_weight_kg) ? (
                        <div className="space-y-0.5">
                          {log.fabric_type && (
                            <div className="font-semibold text-amber-700">Kain: {log.fabric_type}</div>
                          )}
                          {log.fabric_weight_kg && (
                            <div className="text-slate-500">Berat: {log.fabric_weight_kg} kg</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {log.quantity_pcs.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500">
                      Rp {Number(log.price_per_piece).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      Rp {Number(log.total_pay).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Rekap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          limit={limit}
          totalItems={totalItems}
          onPageChange={setPage}
          onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        />
      </div>
    </div>
  );
};
