import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Users, Shield, Phone } from 'lucide-react';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthRole, Santri } from '../types';

interface LoginProps {
  onLogin: (role: AuthRole, divisi?: 'putra' | 'putri', santriId?: string) => void;
  dataSantri: Santri[];
}

export default function Login({ onLogin, dataSantri }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'wali' | 'admin'>('wali');
  const [adminDivisi, setAdminDivisi] = useState<'putra' | 'putri'>('putra');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [waliHp, setWaliHp] = useState('');
  const [matchingSantri, setMatchingSantri] = useState<Santri[]>([]);
  const [errorVisible, setErrorVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simple verification for default pengurus credentials
    // Note: In production we should use Firebase Auth, but as a quick fix/fallback:
    if (adminEmail === 'ppalfurqon.ofc@gmail.com' && 
       ((adminDivisi === 'putra' && adminPassword === 'pengurusafputra') || 
        (adminDivisi === 'putri' && adminPassword === 'pengurusafputri'))) {
      alert('Login Password Berhasil. Perhatian: Anda hanya bisa melihat data. Untuk MENAMBAH/MENGUBAH data, Anda harus Login dengan Google.');
      onLogin('admin', adminDivisi);
    } else {
      setErrorVisible(true);
      setTimeout(() => setErrorVisible(false), 3000);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to avoid automatic login with wrong account
      provider.setCustomParameters({ prompt: 'select_account' });
      
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          onLogin('admin', adminDivisi);
        }
      } catch (popupError: any) {
        console.error("Popup Error:", popupError);
        // If popup is blocked, try redirect
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      let msg = "Gagal login dengan Google.";
      if (error.code === 'auth/popup-closed-by-user') msg = "Login dibatalkan (jendela ditutup).";
      if (error.code === 'auth/network-request-failed') msg = "Koneksi internet bermasalah.";
      
      alert(`${msg}\n\nTips:\n1. Gunakan browser Chrome/Safari bawaan HP.\n2. Jika di HP, klik tombol 'Buka di Tab Baru' (ikon panah keluar) di bagian atas.\n3. Pastikan email Anda sudah ditambahkan sebagai admin di Firebase Console.`);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleWaliLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataSantri || dataSantri.length === 0) {
      alert('Data santri sedang dimuat, silakan tunggu sebentar atau muat ulang halaman.');
      return;
    }
    
    const normalizedInput = waliHp.replace(/[^0-9]/g, '');
    const matches = dataSantri.filter(s => {
      const normalizedS = s.waliHp.replace(/[^0-9]/g, '');
      return normalizedS === normalizedInput || 
             normalizedS === '0' + normalizedInput || 
             normalizedS === '62' + normalizedInput ||
             normalizedInput === '0' + normalizedS ||
             normalizedInput === '62' + normalizedS;
    });

    if (matches.length === 1) {
      onLogin('wali', undefined, matches[0].id);
    } else if (matches.length > 1) {
      setMatchingSantri(matches);
    } else {
      setErrorVisible(true);
      setTimeout(() => setErrorVisible(false), 3000);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10"
    >
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
          <span className="text-4xl font-black text-white italic">S</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">SantriAf</h2>
        <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">Pondok Pesantren Al-Furqon</p>
      </div>

      <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
        <button 
          onClick={() => setActiveTab('wali')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center ${activeTab === 'wali' ? 'bg-white shadow text-emerald-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4 h-4 mr-2" />
          Wali Santri
        </button>
        <button 
          onClick={() => setActiveTab('admin')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center ${activeTab === 'admin' ? 'bg-white shadow text-emerald-800' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Shield className="w-4 h-4 mr-2" />
          Pengurus
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'admin' ? (
          <motion.div 
            key="admin-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-tighter">Pilih Divisi Pengurus</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdminDivisi('putra')}
                  className={`flex items-center justify-center p-3 border-2 rounded-xl transition-all text-xs font-bold ${adminDivisi === 'putra' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-400 hover:bg-slate-50'}`}
                >
                  Putra
                </button>
                <button
                  type="button"
                  onClick={() => setAdminDivisi('putri')}
                  className={`flex items-center justify-center p-3 border-2 rounded-xl transition-all text-xs font-bold ${adminDivisi === 'putri' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-400 hover:bg-slate-50'}`}
                >
                  Putri
                </button>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Email Pengurus</label>
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="ppalfurqon.ofc@gmail.com" 
                  className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Password</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm"
              >
                Masuk Password (Akses Baca)
              </button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">atau</span></div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
              <p className="text-[10px] text-emerald-600 uppercase font-bold mb-3">Rekomendasi: Login Google (Akses Full)</p>
              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-emerald-500"
              >
                <LogIn className="w-4 h-4 text-white" />
                <span>Masuk dengan Google</span>
              </button>
              <p className="text-[9px] text-emerald-600/70 mt-2 italic">Gunakan email yang sudah didaftarkan (kangngedit271006 / ppalfurqon.ofc)</p>
            </div>

            {errorVisible && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-[10px] bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl flex items-center space-x-2"
              >
                <span>Gagal masuk. Pastikan akun Anda terdaftar sebagai pengelola.</span>
              </motion.div>
            )}
          </motion.div>
        ) : matchingSantri.length > 0 ? (
          <motion.div
            key="santri-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-2">
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-tight">Ditemukan {matchingSantri.length} Santri</p>
              <p className="text-[9px] text-emerald-600/70 mt-0.5">Pilih nama anak Anda untuk melihat detailnya.</p>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {matchingSantri.map(s => (
                <button
                  key={s.id}
                  onClick={() => onLogin('wali', undefined, s.id)}
                  className="w-full bg-white border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 p-4 rounded-2xl text-left transition-all shadow-sm group"
                >
                  <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-800">{s.nama}</p>
                  <div className="flex items-center mt-1 space-x-3 text-[10px] text-gray-400">
                    <span>NIS: {s.nis}</span>
                    <span>Asrama: {s.kamar}</span>
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setMatchingSantri([]); setWaliHp(''); }}
              className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest text-center"
            >
              Kembali
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="wali-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleWaliLogin}
            className="space-y-4"
          >
            {/* ... wali input ... */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">Nomor HP Wali</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={waliHp}
                  onChange={(e) => setWaliHp(e.target.value)}
                  placeholder="Masukkan nomor HP terdaftar" 
                  className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>
            </div>

            {errorVisible && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-[10px] bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl flex items-center space-x-2"
              >
                <span>Nomor HP tidak terdaftar di sistem.</span>
              </motion.div>
            )}

            <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm mt-2">
              Cek Data Santri
            </button>
            <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[9px] text-gray-400 leading-tight">Pastikan nomor HP sama dengan yang didaftarkan ke pengurus.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
