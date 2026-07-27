import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Edit2, Search, DollarSign, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

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
  const [selectedModel, setSelectedModel] = useState(null);
  const [pricesInput, setPricesInput] = useState({
    potong: '',
    sablon: '',
    obras: '',
    kelin: '',
    overdek: '',
    sambung: '',
  });

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

  // Construct table rows (One row per Model)
  const allRows = models.map((model) => {
    const row = {
      model_id: model.id,
      model_name: model.model_name,
    };
    roles.forEach((role) => {
      const match = pieceRates.find((r) => r.model_id === model.id && r.role === role.key);
      row[role.key] = match ? Number(match.price_per_piece) : 0;
    });
    return row;
  });

  // Filter rows based on search
  const filteredRows = allRows.filter((row) => 
    row.model_name.toLowerCase().includes(search.toLowerCase())
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
    setSelectedModel(row);
    setPricesInput({
      potong: row.potong !== undefined ? row.potong : 0,
      sablon: row.sablon !== undefined ? row.sablon : 0,
      obras: row.obras !== undefined ? row.obras : 0,
      kelin: row.kelin !== undefined ? row.kelin : 0,
      overdek: row.overdek !== undefined ? row.overdek : 0,
      sambung: row.sambung !== undefined ? row.sambung : 0,
    });
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedModel(null);
    setPricesInput({
      potong: '',
      sablon: '',
      obras: '',
      kelin: '',
      overdek: '',
      sambung: '',
    });
  };

  // Save Rate
  const handleSaveRate = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    for (const [key, value] of Object.entries(pricesInput)) {
      if (value === '' || isNaN(value) || Number(value) < 0) {
        toast.error('Masukkan nominal harga borong yang valid');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await request.post(API_ENDPOINTS.PIECE_RATES.SAVE, {
        model_id: selectedModel.model_id,
        rates: {
          potong: parseFloat(pricesInput.potong),
          sablon: parseFloat(pricesInput.sablon),
          obras: parseFloat(pricesInput.obras),
          kelin: parseFloat(pricesInput.kelin),
          overdek: parseFloat(pricesInput.overdek),
          sambung: parseFloat(pricesInput.sambung),
        }
      });

      if (res.success) {
        toast.success(`Tarif borong untuk model ${selectedModel.model_name} berhasil diperbarui!`);
        fetchData();
        handleCloseEditModal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan harga borong');
    } finally {
      setSaving(false);
    }
  };

  // Delete / Reset Rates for Model
  const handleDeleteRates = async (row) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin mereset/menghapus semua tarif borong untuk model ${row.model_name}?`);
    if (!confirmDelete) return;

    try {
      const res = await request.delete(API_ENDPOINTS.PIECE_RATES.DELETE(row.model_id));
      if (res.success) {
        toast.success(`Semua tarif borong untuk model ${row.model_name} berhasil direset!`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset tarif borong');
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
            placeholder="Cari model pakaian..."
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
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-4 text-center w-12">No</th>
                  <th className="py-4 px-4 min-w-[150px]">Model Pakaian</th>
                  <th className="py-4 px-4 text-right">Potong Kain</th>
                  <th className="py-4 px-4 text-right">Sablon</th>
                  <th className="py-4 px-4 text-right">Obras</th>
                  <th className="py-4 px-4 text-right">Kelin</th>
                  <th className="py-4 px-4 text-right">Overdek</th>
                  <th className="py-4 px-4 text-right">Nyambung</th>
                  <th className="py-4 px-4 text-center w-36">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {currentRows.map((row, idx) => (
                  <tr key={row.model_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                      {indexOfFirstItem + idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {row.model_name}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {row.potong > 0 ? `Rp ${row.potong.toLocaleString('id-ID')}` : <span className="text-slate-400 font-normal italic">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {row.sablon > 0 ? `Rp ${row.sablon.toLocaleString('id-ID')}` : <span className="text-slate-400 font-normal italic">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {row.obras > 0 ? `Rp ${row.obras.toLocaleString('id-ID')}` : <span className="text-slate-400 font-normal italic">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {row.kelin > 0 ? `Rp ${row.kelin.toLocaleString('id-ID')}` : <span className="text-slate-400 font-normal italic">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {row.overdek > 0 ? `Rp ${row.overdek.toLocaleString('id-ID')}` : <span className="text-slate-400 font-normal italic">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {row.sambung > 0 ? `Rp ${row.sambung.toLocaleString('id-ID')}` : <span className="text-slate-400 font-normal italic">-</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(row)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 font-semibold rounded-xl text-xs transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRates(row)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 font-semibold rounded-xl text-xs transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
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
      {isEditModalOpen && selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={handleCloseEditModal} />

          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
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
                  {selectedModel.model_name}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Potong Kain */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Potong Kain
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      value={pricesInput.potong}
                      onChange={(e) => setPricesInput({ ...pricesInput, potong: e.target.value })}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold text-slate-800"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Sablon */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Sablon
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      value={pricesInput.sablon}
                      onChange={(e) => setPricesInput({ ...pricesInput, sablon: e.target.value })}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold text-slate-800"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Obras */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Obras
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      value={pricesInput.obras}
                      onChange={(e) => setPricesInput({ ...pricesInput, obras: e.target.value })}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold text-slate-800"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Kelin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Kelin
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      value={pricesInput.kelin}
                      onChange={(e) => setPricesInput({ ...pricesInput, kelin: e.target.value })}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold text-slate-800"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Overdek */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Overdek
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      value={pricesInput.overdek}
                      onChange={(e) => setPricesInput({ ...pricesInput, overdek: e.target.value })}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold text-slate-800"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* Nyambung */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Nyambung
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      value={pricesInput.sambung}
                      onChange={(e) => setPricesInput({ ...pricesInput, sambung: e.target.value })}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-2 border border-slate-200 focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold text-slate-800"
                      required
                      min="0"
                    />
                  </div>
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
