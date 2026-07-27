import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { 
  PlusCircle, 
  CheckCircle, 
  Package, 
  Calendar, 
  FileText, 
  Weight, 
  Layers,
  History,
  TrendingUp
} from 'lucide-react';

export const WorkerDashboardPage = ({ user }) => {
  const [models, setModels] = useState([]);
  const [summary, setSummary] = useState({ todayPcs: 0, monthPcs: 0, todaySalary: 0 });
  const [loading, setLoading] = useState(true);

  // Form State Input Rekap Harian
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [modelId, setModelId] = useState('');
  const [quantityPcs, setQuantityPcs] = useState('');
  const [fabricType, setFabricType] = useState('');
  const [fabricWeightKg, setFabricWeightKg] = useState('');
  const [notes, setNotes] = useState('');

  const isPotongRole = user?.role === 'potong';

  const getRoleLabel = (role) => {
    switch (role) {
      case 'potong': return 'Tukang Potong Kain';
      case 'sablon': return 'Tukang Sablon';
      case 'obras': return 'Tukang Obras';
      case 'kelin': return 'Tukang Kelin / Hemming';
      case 'overdek': return 'Tukang Kolor / Overdek';
      case 'sambung': return 'Tukang Sambung';
      default: return role;
    }
  };

  useEffect(() => {
    fetchModels();
    fetchSummary();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.MODELS.LIST);
      if (res.success) {
        setModels(res.data);
        if (res.data.length > 0) {
          setModelId(res.data[0].id);
        }
      }
    } catch (err) {
      toast.error('Gagal memuat master model');
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.WORK_LOGS.WORKER_SUMMARY);
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      toast.error('Jumlah pcs wajib lebih dari 0');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        work_date: date,
        model_id: Number(modelId),
        quantity_pcs: Number(quantity),
        notes,
        fabric_type: isPotongRole ? fabricType : undefined,
        fabric_weight_kg: isPotongRole && fabricWeight ? parseFloat(fabricWeight) : undefined
      };

      const res = await request.post(API_ENDPOINTS.WORK_LOGS.CREATE, payload);
      if (res.success) {
        toast.success('Hasil kerja harian berhasil dicatat!');
        setQuantity('');
        setNotes('');
        setFabricType('');
        setFabricWeight('');
        fetchSummary();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan rekap kerja');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Memuat Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/30">
            Pekerja Panel
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-2">
            Halo, {user?.name}!
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Selamat datang kembali. Anda masuk sebagai <strong className="text-white font-semibold">{getRoleLabel(user?.role)}</strong>. Input hasil pengerjaan Anda di form bawah untuk kalkulasi gaji harian otomatis.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Total Pcs Hari Ini</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {(summary?.todayPcs ?? 0).toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">pcs</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Estimasi Gaji Hari Ini</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              Rp {(summary?.todaySalary ?? 0).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="bg-sky-600 text-white rounded-3xl p-6 shadow-md shadow-sky-600/10 flex items-center gap-4">
          <div className="p-4 bg-white/10 text-white rounded-2xl">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="text-sky-200 text-xs font-medium">Total Pcs Bulan Ini</div>
            <div className="text-2xl font-bold mt-1">
              {(summary?.monthPcs ?? 0).toLocaleString('id-ID')} <span className="text-xs font-normal text-sky-200">pcs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Input Rekap Pengerjaan Harian */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Form Input Hasil Kerja Harian</h2>
            <p className="text-slate-500 text-xs">Pencatatan hasil obras, kelin, overdek, potong, sablon, atau sambung</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identitas Pekerja (Auto Detected) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">ID & Nama Pekerja</label>
              <div className="font-semibold text-slate-800 text-sm">{user?.name} (@{user?.username})</div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Jenis Pekerjaan</label>
              <div className="font-semibold text-sky-600 text-sm">{getRoleLabel(user?.role)}</div>
            </div>
          </div>

          {/* Tanggal Pengerjaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Tanggal Pengerjaan
            </label>
            <div className="relative">
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                required
              />
            </div>
          </div>

          {/* Khusus Role Potong Kain: Jenis Kain & Weight (kg) */}
          {isPotongRole && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
              <div>
                <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Jenis Kain</span>
                </label>
                <input
                  type="text"
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  placeholder="Misal: Lotto, Cotton 30s, Fleece"
                  className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Weight className="w-4 h-4 text-amber-600" />
                  <span>Netto Kain / Panjang (Kg)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fabricWeightKg}
                  onChange={(e) => setFabricWeightKg(e.target.value)}
                  placeholder="Misal: 150"
                  className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* Model Pakaian */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Model yang Dikerjakan
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              required
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.model_name}
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah Pcs Hasil Kerja */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Jumlah Hasil Kerja (Pcs)
            </label>
            <input
              type="number"
              value={quantityPcs}
              onChange={(e) => setQuantityPcs(e.target.value)}
              placeholder="Masukkan jumlah pcs (Contoh: 450)"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold text-slate-800"
              required
            />
          </div>

          {/* Catatan / Keterangan (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Catatan Pengerjaan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan jika ada..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Simpan Rekap Kerja Harian</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
