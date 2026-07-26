import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Tag, Save, Plus } from 'lucide-react';

export const ManagePieceRatesPage = () => {
  const [models, setModels] = useState([]);
  const [pieceRates, setPieceRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  // Buffer input harga sementara per model & role
  const [rateInputs, setRateInputs] = useState({});

  const roles = [
    { key: 'potong', label: '1. Tukang Potong' },
    { key: 'sablon', label: '2. Tukang Sablon' },
    { key: 'obras', label: '3. Tukang Obras' },
    { key: 'kelin', label: '4. Tukang Kelin' },
    { key: 'overdek', label: '5. Tukang Overdek' },
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
      if (ratesRes.success) {
        setPieceRates(ratesRes.data);

        // Pre-fill inputs state
        const initialMap = {};
        ratesRes.data.forEach((r) => {
          initialMap[`${r.model_id}_${r.role}`] = r.price_per_piece;
        });
        setRateInputs(initialMap);
      }
    } catch (err) {
      toast.error('Gagal mengambil data tarif borong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (modelId, role, val) => {
    setRateInputs((prev) => ({
      ...prev,
      [`${modelId}_${role}`]: val
    }));
  };

  const handleSaveRate = async (modelId, role) => {
    const key = `${modelId}_${role}`;
    const price = rateInputs[key];

    if (price === undefined || price === '') {
      toast.error('Masukkan nominal harga borong');
      return;
    }

    setSavingKey(key);
    try {
      const res = await request.post(API_ENDPOINTS.PIECE_RATES.SAVE, {
        model_id: modelId,
        role,
        price_per_piece: parseFloat(price)
      });

      if (res.success) {
        toast.success(`Tarif borong ${role} berhasil disimpan!`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan harga borong');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Atur Harga Borong per Pcs</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Tentukan harga borong per pcs untuk masing-masing model pakaian & jenis pekerjaan (Admin Task #4).
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Memuat matriks tarif borong...</div>
      ) : models.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Silakan buat Master Model pakaian terlebih dahulu.</div>
      ) : (
        <div className="space-y-6">
          {models.map((model) => (
            <div key={model.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{model.model_name}</h3>
                  <p className="text-xs text-slate-400">{model.description || 'Tanpa deskripsi'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {roles.map((r) => {
                  const key = `${model.id}_${r.key}`;
                  const currentVal = rateInputs[key] ?? '';
                  const isSaving = savingKey === key;

                  return (
                    <div key={r.key} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
                      <div className="text-xs font-semibold text-slate-700 mb-2">{r.label}</div>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">Rp</span>
                          <input
                            type="number"
                            value={currentVal}
                            onChange={(e) => handleInputChange(model.id, r.key, e.target.value)}
                            placeholder="0"
                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveRate(model.id, r.key)}
                          disabled={isSaving}
                          className="w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Saving...' : 'Simpan'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
