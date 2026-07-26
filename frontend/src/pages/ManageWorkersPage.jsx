import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { DebouncedInput } from '../components/DebouncedInput';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import toast from 'react-hot-toast';
import { Users, UserPlus, Edit3, Trash2, ShieldCheck, Key } from 'lucide-react';

export const ManageWorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  
  // Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('obras');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [page, limit, search, roleFilter]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, {
        page,
        limit,
        search,
        role: roleFilter
      });

      if (res.success) {
        setWorkers(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.total);
      }
    } catch (err) {
      toast.error('Gagal mengambil data pekerja');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingWorker(null);
    setUsername('');
    setName('');
    setRole('obras');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (worker) => {
    setEditingWorker(worker);
    setUsername(worker.username);
    setName(worker.name);
    setRole(worker.role);
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !name || !role) {
      toast.error('Username, Nama, dan Role wajib diisi');
      return;
    }
    if (!editingWorker && !password) {
      toast.error('Password wajib diisi untuk akun baru');
      return;
    }

    setSubmitting(true);
    try {
      if (editingWorker) {
        const res = await request.put(API_ENDPOINTS.USERS.UPDATE(editingWorker.id), {
          username,
          name,
          role,
          password
        });
        if (res.success) {
          toast.success('Data pekerja berhasil diperbarui');
          setIsModalOpen(false);
          fetchWorkers();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.USERS.CREATE, {
          username,
          name,
          role,
          password
        });
        if (res.success) {
          toast.success('Akun pekerja berhasil dibuat');
          setIsModalOpen(false);
          fetchWorkers();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    } fontally: {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, workerName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun pekerja ${workerName}?`)) return;

    try {
      const res = await request.delete(API_ENDPOINTS.USERS.DELETE(id));
      if (res.success) {
        toast.success('Akun pekerja berhasil dihapus');
        fetchWorkers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pekerja');
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Akun Pekerja</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Daftar 5 jenis pekerja konveksi (Potong, Sablon, Obras, Kelin, Overdek) dan Admin.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Pekerja</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <DebouncedInput
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Cari nama atau username pekerja..."
          className="flex-1"
        />

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">Semua Role Pekerja</option>
          <option value="admin">User Admin</option>
          <option value="potong">Tukang Potong Kain</option>
          <option value="sablon">Tukang Sablon</option>
          <option value="obras">Tukang Obras</option>
          <option value="kelin">Tukang Kelin / Hemming</option>
          <option value="overdek">Tukang Kolor / Overdek</option>
        </select>
      </div>

      {/* Table Pekerja */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Memuat data pekerja...</div>
        ) : workers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Tidak ada data pekerja ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Pekerja</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Jenis Pekerjaan (Role)</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{worker.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">@{worker.username}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {getRoleLabel(worker.role)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(worker)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Edit Worker"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(worker.id, worker.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Worker"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Modal Add / Edit Worker */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorker ? 'Edit Akun Pekerja' : 'Buat Akun Pekerja Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap Pekerja
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bondet / Siti"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Username Login
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: pemotong01 / obras01"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Jenis Pekerja (Role)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="potong">1. Tukang Potong Kain</option>
              <option value="sablon">2. Tukang Sablon</option>
              <option value="obras">3. Tukang Obras</option>
              <option value="kelin">4. Tukang Kelin / Hemming</option>
              <option value="overdek">5. Tukang Kolor / Overdek</option>
              <option value="admin">User Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password {editingWorker && <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editingWorker ? '••••••••' : 'Masukkan password'}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
              {...(!editingWorker && { required: true })}
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
              {submitting ? 'Menyimpan...' : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
