import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Users, UserCheck, Shield, Phone } from 'lucide-react';
import { AuthRole, User } from '../types';
import { Santri } from '../types';

interface LoginProps {
  onLogin: (role: AuthRole, divisi?: 'putra' | 'putri', santriId?: number) => void;
  dataSantri: Santri[];
}

export default function Login({ onLogin, dataSantri }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'wali' | 'admin'>('wali');
  const [adminDivisi, setAdminDivisi] = useState<'putra' | 'putri'>('putra');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [waliHp, setWaliHp] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default credentials from the original HTML
    if (adminEmail === 'ppalfurqon.ofc@gmail.com' && 
       ((adminDivisi === 'putra' && adminPassword === 'pengurusafputra') || 
        (adminDivisi === 'putri' && adminPassword === 'pengurusafputri'))) {
      onLogin('admin', adminDivisi);
    } else {
      setErrorVisible(true);
      setTimeout(() => setErrorVisible(false), 3000);
    }
  };

  const handleWaliLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const santri = dataSantri.find(s => s.waliHp === waliHp);
    if (santri) {
      onLogin('wali', undefined, santri.id);
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
          <motion.form 
            key="admin-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleAdminLogin}
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
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">Email Pengurus</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <UserCheck className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Masukkan email pengurus" 
                  className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <LogIn className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••" 
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
                <span>Email atau password salah.</span>
              </motion.div>
            )}

            <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm mt-2">
              Masuk Pengurus
            </button>
          </motion.form>
        ) : (
          <motion.form 
            key="wali-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleWaliLogin}
            className="space-y-4"
          >
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
          </motion.form>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
