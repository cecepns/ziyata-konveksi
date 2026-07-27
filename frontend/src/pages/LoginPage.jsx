import React, { useState } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { LogIn, Scissors, Sparkles } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
      if (res.success) {
        toast.success(`Selamat datang kembali, ${res.user.name}!`);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      } else {
        toast.error(res.message || 'Login gagal');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const setQuickUser = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow background effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-sky-500/10 text-sky-400 rounded-2xl mb-3 ring-1 ring-sky-500/30">
            <Scissors className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Login Ziyyata Mode</h1>
          <p className="text-slate-400 text-sm mt-1">Pencatatan Rekap Kerja & Gaji Pekerja</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username Pekerja / Admin
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Aplikasi</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
