import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { WorkerDashboardPage } from './pages/WorkerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ManageWorkersPage } from './pages/ManageWorkersPage';
import { MasterModelsPage } from './pages/MasterModelsPage';
import { ManagePieceRatesPage } from './pages/ManagePieceRatesPage';
import { WorkLogsPage } from './pages/WorkLogsPage';
import { SalaryReportPage } from './pages/SalaryReportPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
        Memuat aplikasi...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Toaster position="top-right" />
      <Sidebar
        isOpen={isSidebarOpen}
        user={user}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            {/* Home Route */}
            <Route
              path="/"
              element={isAdmin ? <AdminDashboardPage /> : <WorkerDashboardPage user={user} />}
            />

            {/* Work Logs Route */}
            <Route
              path="/work-logs"
              element={<WorkLogsPage user={user} />}
            />

            {/* Admin Only Routes */}
            {isAdmin ? (
              <>
                <Route path="/workers" element={<ManageWorkersPage />} />
                <Route path="/models" element={<MasterModelsPage />} />
                <Route path="/piece-rates" element={<ManagePieceRatesPage />} />
                <Route path="/salary-report" element={<SalaryReportPage />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}
