import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { DollarSign, Calendar, Printer, Filter, Users } from 'lucide-react';

export const SalaryReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchSalaryReport();
  }, [dateFrom, dateTo, roleFilter]);

  const fetchSalaryReport = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.REPORTS.SALARY, {
        date_from: dateFrom,
        date_to: dateTo,
        role: roleFilter
      });

      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil laporan gaji');
    } finally {
      setLoading(false);
    }
  };

  const grandTotalSalary = reportData.reduce((acc, curr) => acc + Number(curr.total_salary), 0);
  const grandTotalPcs = reportData.reduce((acc, curr) => acc + Number(curr.total_pcs), 0);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Gaji Pekerja Konveksi</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Kalkulasi otomatis total upah borongan berdasarkan hasil pcs yang diinput pekerja (Admin Task #2).
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all self-start sm:self-auto print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Export Laporan</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 print:hidden">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Semua Role Pekerja</option>
          <option value="potong">Tukang Potong Kain</option>
          <option value="sablon">Tukang Sablon</option>
          <option value="obras">Tukang Obras</option>
          <option value="kelin">Tukang Kelin / Hemming</option>
          <option value="overdek">Tukang Kolor / Overdek</option>
          <option value="sambung">Tukang Sambung</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Ringkasan Laporan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg">
          <div className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Total Pembayaran Gaji</div>
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

      {/* Table Laporan Gaji */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Menghitung kalkulasi gaji...</div>
        ) : reportData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Belum ada data rekap gaji untuk periode ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pekerja</th>
                  <th className="py-3.5 px-4">Role / Tugas</th>
                  <th className="py-3.5 px-4 text-center">Frekuensi Input</th>
                  <th className="py-3.5 px-4 text-right">Total Hasil (Pcs)</th>
                  <th className="py-3.5 px-4 text-right">Total Gaji Borongan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {reportData.map((row) => (
                  <tr key={row.worker_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{row.worker_name}</div>
                      <div className="text-xs text-slate-400 font-normal">@{row.username}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {getRoleLabel(row.worker_role)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {row.total_submissions} kali
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      {Number(row.total_pcs).toLocaleString('id-ID')} pcs
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-base">
                      Rp {Number(row.total_salary).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/80 font-bold text-slate-800 border-t border-slate-200">
                  <td colSpan={3} className="py-4 px-4 text-right uppercase text-xs tracking-wider">
                    Total Keseluruhan:
                  </td>
                  <td className="py-4 px-4 text-right text-slate-900">
                    {grandTotalPcs.toLocaleString('id-ID')} pcs
                  </td>
                  <td className="py-4 px-4 text-right text-emerald-700 text-lg font-black">
                    Rp {grandTotalSalary.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
