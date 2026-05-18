/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut } from 'lucide-react';
import { useDatabase } from './hooks/useDatabase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AuthRole, User, Santri } from './types';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import WaliDashboard from './components/WaliDashboard';

export default function App() {
  const {
    dataSantri, addSantri, updateSantri, deleteSantri,
    dataAbsensi, addAbsensi, deleteAbsensi,
    dataPelanggaran, addPelanggaran, updatePelanggaran, deletePelanggaran,
    dataInfo, addInfo, deleteInfo,
    loading
  } = useDatabase();

  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading) {
      setLastSync(new Date());
    }
  }, [dataSantri, dataAbsensi, dataPelanggaran, dataInfo, loading]);

  useEffect(() => {
    // Check for redirect result
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        // Redirect login success will be handled by onAuthStateChanged
        console.log("Redirect login success");
      }
    }).catch((error) => {
      console.error("Redirect Login Error:", error);
    });

    // Check for manual login persistence first
    const savedRole = localStorage.getItem('lastRole') as AuthRole | null;
    const savedDivisi = localStorage.getItem('lastDivisi') as 'putra' | 'putri' | null;
    const savedWaliId = localStorage.getItem('lastWaliSantriId');

    if (savedRole === 'admin' && savedDivisi) {
      setCurrentUser({ role: 'admin', divisi: savedDivisi });
    } else if (savedRole === 'wali' && savedWaliId) {
      setCurrentUser({ role: 'wali', santriId: savedWaliId });
    }

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const currentSavedDivisi = localStorage.getItem('lastDivisi') as 'putra' | 'putri' | null;
        if (currentSavedDivisi) {
          setCurrentUser({ role: 'admin', divisi: currentSavedDivisi });
        }
      }
      // Note: We don't automatically logout if firebaseUser is null here,
      // because we might have a manual login active.
    });

    return () => unsubAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  const handleLogin = (role: AuthRole, divisi?: 'putra' | 'putri', santriId?: string) => {
    localStorage.setItem('lastRole', role);
    if (role === 'admin' && divisi) {
      localStorage.setItem('lastDivisi', divisi);
    }
    if (role === 'wali' && santriId) {
      localStorage.setItem('lastWaliSantriId', santriId);
    }
    setCurrentUser({ role, divisi, santriId });
  };

  const handleLogout = () => {
    localStorage.removeItem('lastRole');
    localStorage.removeItem('lastDivisi');
    localStorage.removeItem('lastWaliSantriId');
    auth.signOut();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Bar */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg border border-emerald-400/30">
              <span className="text-2xl font-black text-white italic">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">SantriAf</h1>
          </div>
          
          <AnimatePresence>
            {currentUser && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3"
              >
                <span className="hidden md:inline text-xs bg-emerald-800 px-3 py-1.5 rounded-full border border-emerald-600 text-white font-medium uppercase">
                  {currentUser.role === 'admin' ? `PENGURUS ${currentUser.divisi}` : 'Wali Santri'}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-all flex items-center space-x-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-start justify-center py-10 px-4">
        <AnimatePresence mode="wait">
          {!currentUser && (
            <motion.div 
              key="login-scene"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-md">
                {dataSantri.length === 0 && (
                  <div className="text-center mb-4 text-[10px] text-amber-600 bg-amber-50 py-2 rounded-lg border border-amber-100 flex items-center justify-center px-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 animate-bounce"></div>
                    Menghubungkan ke pusat data...
                  </div>
                )}
                <Login onLogin={handleLogin} dataSantri={dataSantri} />
              </div>
            </motion.div>
          )}

          {currentUser?.role === 'admin' && (
            <motion.div 
              key="admin-scene"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <AdminDashboard 
                currentUser={currentUser}
                dataSantri={dataSantri}
                addSantri={addSantri}
                updateSantri={updateSantri}
                deleteSantri={deleteSantri}
                dataAbsensi={dataAbsensi}
                addAbsensi={addAbsensi}
                deleteAbsensi={deleteAbsensi}
                dataPelanggaran={dataPelanggaran}
                addPelanggaran={addPelanggaran}
                updatePelanggaran={updatePelanggaran}
                deletePelanggaran={deletePelanggaran}
                dataInfo={dataInfo}
                addInfo={addInfo}
                deleteInfo={deleteInfo}
              />
            </motion.div>
          )}

          {currentUser?.role === 'wali' && (
            <motion.div 
              key="wali-scene"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {(() => {
                const s = dataSantri.find(x => x.id === currentUser.santriId);
                if (!s) return <div className="text-center text-gray-400">Data santri tidak ditemukan.</div>;
                return (
                  <WaliDashboard 
                    santri={s}
                    absensi={dataAbsensi.filter(a => a.santriId === s.id)}
                    pelanggaran={dataPelanggaran.filter(p => p.santriId === s.id)}
                    info={dataInfo}
                  />
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
             <p className="text-emerald-600/50 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">&copy; 2026 SantriAf • Pondok Pesantren Al-Furqon</p>
             <div className="flex items-center justify-center md:justify-start space-x-2 text-[9px] text-emerald-500/30">
               <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">Project: onyx-sunup-4tgzl</span>
               <span>•</span>
               <span className="flex items-center">
                 Sinkronisasi Otomatis {lastSync ? 'Aktif (' + lastSync.toLocaleTimeString('id-ID') + ')' : 'Menghubungkan...'}
               </span>
             </div>
          </div>
          <div className="flex items-center bg-white/5 px-4 py-2 rounded-2xl border border-white/5 shadow-inner grow-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]"></div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Aplikasi Online & Sinkron</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
