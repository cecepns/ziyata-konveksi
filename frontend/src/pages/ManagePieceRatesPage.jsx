import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Edit2, Search, DollarSign, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const ManagePieceRatesPage = () => {
  const [models, setModels] = useState([]);
  const [pieceRates, setPieceRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  const [priceInput, setPriceInput] = useState('');

  const roles = [
    { key: 'potong', label: 'Tukang Potong Kain' },
    { key: 'sablon', label: 'Tukang Sablon' },
    { key: 'obras', label: 'Tukang Obras' },
    { key: 'kelin', label: 'Tukang Kelin / Hemming' },
    { key: 'overdek', label: 'Tukang Kolor / Overdek' },
    { key: 'sambung', label: 'Tukang Sambung' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modelsRes, ratesRes] = await Promise.all([
        request.get(API_ENDPOINTS.MODELS.LIST),
        request.get(API_ENDPOINTS.PIECE_RATES.LIST)
      ]);

      if (modelsRes.success) setModels(modelsRes.data);
      if (ratesRes.success) setPieceRates(ratesRes.data);
    } catch (err) {
      toast.error('Gagal mengambil data tarif borong');
    } finally {
      setLoading(false);
    }
  };

  // Construct table rows (Model x Role matrix)
  const allRows = [];
  models.forEach((model) => {
    roles.forEach((role) => {
      const match = pieceRates.find((r) => r.model_id === model.id && r.role === role.key);
      allRows.push({
        model_id: model.id,
        model_name: model.model_name,
        role: role.key,
        role_label: role.label,
        price_per_piece: match ? Number(match.price_per_piece) : 0
      });
    });
  });

  // Filter rows based on search
  const filteredRows = allRows.filter((row) => 
    row.model_name.toLowerCase().includes(search.toLowerCase()) ||
    row.role_label.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / limit);
  const indexOfLastItem = currentPage * limit;
  const indexOfFirstItem = indexOfLastItem - limit;
  const currentRows = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  // Handle Page Change safely
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (row) => {
    setSelectedRate(row);
    setPriceInput(row.price_per_piece);
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRate(null);
    setPriceInput('');
  };

  // Save Rate
  const handleSaveRate = async (e) => {
    e.preventDefault();
    if (priceInput === '' || isNaN(priceInput) || Number(priceInput) < 0) {
      toast.error('Masukkan nominal harga borong yang valid');
      return;
    }

    setSaving(true);
    try {
      const res = await request.post(API_ENDPOINTS.PIECE_RATES.SAVE, {
        model_id: selectedRate.model_id,
        role: selectedRate.role,
        price_per_piece: parseFloat(priceInput)
      });

      if (res.success) {
        toast.success(`Tarif borong berhasil diperbarui!`);
        fetchData();
        handleCloseEditModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan harga borong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Atur Harga Borong per Pcs</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Tentukan harga borong per pcs untuk masing-masing model pakaian & jenis pekerjaan.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3.5 top-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Cari model atau jenis pekerjaan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
        </div>

        {/* Limit Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400 font-medium">Tampilkan:</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 font-semibold text-slate-700"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Memuat daftar tarif borong...</div>
        ) : models.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Silakan buat Master Model pakaian terlebih dahulu.</div>
        ) : filteredRows.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Tidak ada data tarif ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 text-center w-16">No</th>
                  <th className="py-4 px-6">Model Pakaian</th>
                  <th className="py-4 px-6">Jenis Pekerjaan (Role)</th>
                  <th className="py-4 px-6">Harga Borong per Pcs</th>
                  <th className="py-4 px-6 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {currentRows.map((row, idx) => (
                  <tr key={`${row.model_id}_${row.role}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 text-center font-medium text-slate-400">
                      {indexOfFirstItem + idx + 1}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">
                      {row.model_name}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                        {row.role_label}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-700">
                      {row.price_per_piece > 0 ? (
                        <span>Rp {row.price_per_piece.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Belum diatur</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => handleOpenEditModal(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 font-semibold rounded-xl text-xs transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredRows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400 font-medium">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalItems)} dari {totalItems} tarif
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl disabled:opacity-40 disabled:hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/10'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl disabled:opacity-40 disabled:hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Piece Rate Modal */}
      {isEditModalOpen && selectedRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={handleCloseEditModal} />

          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Edit Tarif Borong</h3>
              <button
                onClick={handleCloseEditModal}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Model Pakaian
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm">
                  {selectedRate.model_name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Jenis Pekerjaan (Role)
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl text-sm">
                  {selectedRate.role_label}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Harga Borong per Pcs
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 text-sm font-bold">Rp</span>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold text-slate-800"
                    required
                    min="0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-xl text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm shadow-md shadow-sky-600/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
