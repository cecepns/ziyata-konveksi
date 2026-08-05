import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { DollarSign, Calendar, Printer, Filter, Users, Search, ChevronDown, ChevronUp, User, FileText } from 'lucide-react';

export const SalaryReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchWorker, setSearchWorker] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  // Expand state for item details per worker
  const [expandedWorkers, setExpandedWorkers] = useState({});

  useEffect(() => {
    fetchSalaryReport();
  }, [dateFrom, dateTo, roleFilter, selectedWorkerId]);

  const fetchSalaryReport = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.REPORTS.SALARY, {
        date_from: dateFrom,
        date_to: dateTo,
        role: roleFilter,
        worker_id: selectedWorkerId
      });

      if (res.success) {
        setReportData(res.data);
        // Expand all workers by default when loading data
        const initialExpanded = {};
        res.data.forEach((w) => {
          initialExpanded[w.worker_id] = true;
        });
        setExpandedWorkers(initialExpanded);
      }
    } catch (err) {
      toast.error('Gagal mengambil laporan gaji');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (workerId) => {
    setExpandedWorkers((prev) => ({
      ...prev,
      [workerId]: !prev[workerId]
    }));
  };

  const filteredReportData = reportData.filter((row) => {
    if (!searchWorker.trim()) return true;
    const q = searchWorker.toLowerCase();
    return (
      row.worker_name.toLowerCase().includes(q) ||
      row.username.toLowerCase().includes(q)
    );
  });

  const grandTotalSalary = filteredReportData.reduce((acc, curr) => acc + Number(curr.total_salary), 0);
  const grandTotalPcs = filteredReportData.reduce((acc, curr) => acc + Number(curr.total_pcs), 0);

  const handlePrint = () => {
    window.print();
  };

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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Gaji Pekerja Konveksi</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Rekap Gaji per Nama Pekerja & Detail Pekerjaan Borongan. Siap dicetak/export PDF.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all self-start sm:self-auto print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Export PDF</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 print:hidden">
        {/* Search Worker Name */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama Pekerja..."
            value={searchWorker}
            onChange={(e) => setSearchWorker(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Semua Role Pekerja</option>
          <option value="potong">Tukang Potong Kain</option>
          <option value="sablon">Tukang Sablon</option>
          <option value="obras">Tukang Obras</option>
          <option value="kelin">Tukang Kelin / Hemming</option>
          <option value="overdek">Tukang Kolor / Overdek</option>
          <option value="sambung">Tukang Sambung</option>
        </select>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Ringkasan Laporan Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg">
          <div className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Total Pembayaran Gaji ({filteredReportData.length} Pekerja)</div>
          <div className="text-3xl font-black mt-1">
            Rp {grandTotalSalary.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Hasil Pengerjaan</div>
          <div className="text-3xl font-black text-slate-800 mt-1">
            {grandTotalPcs.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">pcs</span>
          </div>
        </div>
      </div>

      {/* Printable Document Title (Visible only in print) */}
      <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900">ZIYATA KONVEKSI</h1>
        <h2 className="text-lg font-bold text-slate-700">LAPORAN REKAP GAJI PEKERJA BORONGAN</h2>
        <p className="text-xs text-slate-500 mt-1">
          Periode: {dateFrom ? formatDate(dateFrom) : 'Semua Tanggal'} s/d {dateTo ? formatDate(dateTo) : 'Sekarang'}
        </p>
      </div>

      {/* Content Per Nama Pekerja */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80">
          Menghitung kalkulasi & mengelompokkan data per pekerja...
        </div>
      ) : filteredReportData.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200/80">
          Belum ada data rekap gaji untuk kriteria ini.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReportData.map((worker, index) => {
            const isExpanded = expandedWorkers[worker.worker_id];

            return (
              <div
                key={worker.worker_id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden print:shadow-none print:border-slate-300 print:rounded-none print:mb-8 print:break-inside-avoid"
              >
                {/* Worker Card Header */}
                <div
                  onClick={() => toggleExpand(worker.worker_id)}
                  className="bg-slate-50/90 p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 transition-colors print:bg-slate-100 print:cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">{worker.worker_name}</h3>
                        <span className="text-xs text-slate-400 font-normal">(@{worker.username})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                          {getRoleLabel(worker.worker_role)}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {worker.total_submissions} Kali Input Logs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Total Gaji</div>
                      <div className="text-lg sm:text-xl font-black text-emerald-600">
                        Rp {Number(worker.total_salary).toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-slate-500 font-bold">
                        {Number(worker.total_pcs).toLocaleString('id-ID')} pcs
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 print:hidden">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Worker Details Itemized Work Logs */}
                {isExpanded && (
                  <div className="p-4 sm:p-5">
                    {worker.items.length === 0 ? (
                      <div className="text-xs text-slate-400 italic text-center py-4">
                        Tidak ada detail pekerjaan pada periode yang dipilih.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2.5 px-3">Tanggal</th>
                              <th className="py-2.5 px-3">Model Baju</th>
                              <th className="py-2.5 px-3">Lokasi</th>
                              <th className="py-2.5 px-3 text-right">Hasil (Pcs / Kg)</th>
                              <th className="py-2.5 px-3 text-right">Tarif / Pcs</th>
                              <th className="py-2.5 px-3 text-right">Subtotal Gaji</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {worker.items.map((item) => (
                              <tr key={item.log_id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700">
                                  {formatDate(item.work_date)}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800">
                                  {item.model_name}
                                  {item.notes && <span className="block text-xs font-normal text-slate-400">{item.notes}</span>}
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${item.work_location === 'Di Rumah' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                                    {item.work_location || 'Di Pabrik/Workshop'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-slate-800 whitespace-nowrap">
                                  {item.quantity_pcs} pcs
                                  {item.fabric_weight_kg > 0 && (
                                    <span className="block text-xs font-normal text-slate-400">({item.fabric_weight_kg} kg)</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">
                                  Rp {Number(item.price_per_piece).toLocaleString('id-ID')}
                                </td>
                                <td className="py-2.5 px-3 text-right font-black text-emerald-600 whitespace-nowrap">
                                  Rp {Number(item.subtotal_salary).toLocaleString('id-ID')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-emerald-50/50 border-t-2 border-slate-200 font-bold text-slate-800 text-xs sm:text-sm">
                              <td colSpan={3} className="py-3 px-3 text-right uppercase tracking-wider text-slate-600">
                                Total {worker.worker_name}:
                              </td>
                              <td className="py-3 px-3 text-right font-black text-slate-900">
                                {Number(worker.total_pcs).toLocaleString('id-ID')} pcs
                              </td>
                              <td className="py-3 px-3"></td>
                              <td className="py-3 px-3 text-right font-black text-emerald-700 text-base">
                                Rp {Number(worker.total_salary).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {/* Signature block for PDF export / printing per worker */}
                    <div className="hidden print:grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-dashed border-slate-300 text-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-600">Penerima Gaji,</p>
                        <div className="h-14"></div>
                        <p className="font-bold underline text-slate-900">{worker.worker_name}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-600">Admin / Manager Konveksi,</p>
                        <div className="h-14"></div>
                        <p className="font-bold underline text-slate-900">( .................................... )</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total Footer for Print */}
          <div className="hidden print:block bg-slate-100 p-4 border border-slate-300 rounded-none text-right font-bold text-sm">
            <span className="uppercase mr-4">Grand Total Pembayaran Semua Pekerja:</span>
            <span className="text-emerald-700 font-black text-lg">
              Rp {grandTotalSalary.toLocaleString('id-ID')} ({grandTotalPcs.toLocaleString('id-ID')} pcs)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

