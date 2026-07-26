import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import { DebouncedInput } from '../components/DebouncedInput';
import toast from 'react-hot-toast';
import { Package, Plus, Edit3, Trash2 } from 'lucide-react';

export const MasterModelsPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchModels();
  }, [search]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.MODELS.LIST, { search });
      if (res.success) {
        setModels(res.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil data model');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingModel(null);
    setModelName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (model) => {
    setEditingModel(model);
    setModelName(model.model_name);
    setDescription(model.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modelName) {
      toast.error('Nama model wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      if (editingModel) {
        const res = await request.put(API_ENDPOINTS.MODELS.UPDATE(editingModel.id), {
          model_name: modelName,
          description
        });
        if (res.success) {
          toast.success('Model berhasil diperbarui');
          setIsModalOpen(false);
          fetchModels();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.MODELS.CREATE, {
          model_name: modelName,
          description
        });
        if (res.success) {
          toast.success('Model baru berhasil ditambahkan');
          setIsModalOpen(false);
          fetchModels();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan model');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus model pakaian "${name}"?`)) return;

    try {
      const res = await request.delete(API_ENDPOINTS.MODELS.DELETE(id));
      if (res.success) {
        toast.success('Model berhasil dihapus');
        fetchModels();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus model');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Model Pakaian</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Daftar model pakaian yang diproduksi (Contoh: Boxer Pendek, Kaos Polos 30s).
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Model Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <DebouncedInput
          value={search}
          onChange={setSearch}
          placeholder="Cari nama model..."
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">Memuat master model...</div>
        ) : models.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">Belum ada data model pakaian.</div>
        ) : (
          models.map((model) => (
            <div key={model.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(model)}
                      className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(model.id, model.model_name)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mt-3">{model.model_name}</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  {model.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingModel ? 'Edit Model Pakaian' : 'Tambah Model Pakaian Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Model Pakaian
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Contoh: Boxer Pendek / Kemeja Polos"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Model (Opsional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan detail spesifikasi model..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-600/20"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Model'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
