import { motion } from 'motion/react';
import { 
  GraduationCap, IdCard, Home, School, BookOpen, 
  Wallet, History, AlertCircle, Megaphone, 
  CheckCircle2, XCircle, Coins
} from 'lucide-react';
import { Santri, Absensi, Pelanggaran, Info } from '../types';
import { formatRupiah, LIST_BULAN_MAKAN } from '../constants';

interface WaliDashboardProps {
  santri: Santri;
  absensi: Absensi[];
  pelanggaran: Pelanggaran[];
  info: Info[];
}

export default function WaliDashboard({ santri, absensi, pelanggaran, info }: WaliDashboardProps) {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto space-y-8 pb-10"
    >
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 w-28 h-28 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl flex-shrink-0">
          <GraduationCap className="w-14 h-14 text-amber-400" />
        </div>
        <div className="relative z-10 text-center lg:text-left flex-grow">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-300">Profil Santri</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-1">{santri.nama}</h2>
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-4 text-sm text-emerald-100 font-medium bg-black/20 p-4 rounded-2xl inline-flex backdrop-blur-sm border border-white/10">
            <span className="flex items-center"><IdCard className="w-4 h-4 mr-2 opacity-70" />NIS: <b className="ml-1">{santri.nis}</b></span>
            <span className="flex items-center"><Home className="w-4 h-4 mr-2 opacity-70" />Asrama: <b className="ml-1">{santri.kamar}</b></span>
            <span className="flex items-center"><School className="w-4 h-4 mr-2 opacity-70" />Umum: <b className="ml-1">{santri.kelasUmum}</b></span>
            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-2 opacity-70" />Madrasah: <b className="ml-1">{santri.kelasMadrasah}</b></span>
          </div>
        </div>
        <div className="relative z-10 bg-black/20 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-center min-w-[150px] flex-shrink-0">
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Wali Santri</p>
          <p className="text-sm font-bold mt-1">{santri.waliNama}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Keuangan Widget */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col">
          <div className="bg-indigo-50 p-6 flex items-center justify-between border-b border-indigo-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-indigo-900">Info Keuangan</h3>
            </div>
          </div>
          <div className="p-6 space-y-6 flex-grow">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
               <Coins className="w-16 h-16 absolute -right-4 -bottom-4 opacity-20" />
               <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Saldo Tabungan</p>
               <h3 className="text-2xl font-black mt-1">{formatRupiah(santri.saldo)}</h3>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-3 border-b pb-2">Status Bulanan Makan</h4>
              <div className="grid grid-cols-2 gap-2">
                {LIST_BULAN_MAKAN.map(bulan => (
                  <div key={bulan} className={`flex items-center justify-between p-2 rounded-lg ${santri.bulanan[bulan] ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                    <span className={`text-[10px] font-bold ${santri.bulanan[bulan] ? 'text-emerald-800' : 'text-gray-500'}`}>{bulan}</span>
                    {santri.bulanan[bulan] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Absensi & Pelanggaran */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Absensi History */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="bg-amber-50 p-6 flex items-center justify-between border-b border-amber-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-amber-900">Riwayat Absensi</h3>
              </div>
              <span className="text-xs bg-amber-200 text-amber-900 px-3 py-1 rounded-full font-bold">{absensi.length}</span>
            </div>
            <div className="p-6 space-y-4 flex-grow overflow-y-auto max-h-[500px]">
              {absensi.map(a => (
                <div key={a.id} className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-bold text-gray-500 font-mono">{a.date}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold ${
                      a.keterangan === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :
                      a.keterangan === 'Sakit' ? 'bg-blue-100 text-blue-700' :
                      a.keterangan === 'Izin' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{a.keterangan}</span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-800">{a.kegiatan}</p>
                </div>
              ))}
              {absensi.length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <CheckCircle2 className="w-10 h-10 mb-2 mx-auto" />
                  <p className="text-xs">Tidak ada catatan absen.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Discipline Records */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="bg-red-50 p-6 flex items-center justify-between border-b border-red-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 text-red-700 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-red-900">Catatan Kedisiplinan</h3>
              </div>
              <span className="text-xs bg-red-200 text-red-900 px-3 py-1 rounded-full font-bold">{pelanggaran.length}</span>
            </div>
            <div className="p-6 space-y-4 flex-grow overflow-y-auto max-h-[500px]">
              {pelanggaran.map(p => (
                <div key={p.id} className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                  <p className="text-[10px] font-bold text-red-700 font-mono">{p.date}</p>
                  <p className="text-[11px] font-medium text-gray-800 mt-1 italic">"{p.deskripsi}"</p>
                  {p.denda > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-200 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-red-800">Denda: {formatRupiah(p.denda)}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${p.statusLunas ? 'bg-emerald-100 text-emerald-700' : 'bg-red-200 text-red-800'}`}>
                        {p.statusLunas ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {pelanggaran.length === 0 && (
                <div className="text-center py-10 opacity-30 text-emerald-400">
                  <CheckCircle2 className="w-10 h-10 mb-2 mx-auto" />
                  <p className="text-xs text-gray-400">Alhamdulillah, belum ada pelanggaran.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* News Feed / Announcements */}
        <div className="lg:col-span-3 bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-blue-50 p-6 flex items-center justify-between border-b border-blue-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-blue-900">Pengumuman Pondok</h3>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {info.slice().reverse().map(i => (
              <div key={i.id} className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest font-mono">{i.date}</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{i.judul}</p>
                <p className="text-[11px] text-gray-600 mt-2 leading-relaxed font-medium">{i.isi}</p>
              </div>
            ))}
            {info.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-10 italic col-span-full">Belum ada pengumuman.</p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
