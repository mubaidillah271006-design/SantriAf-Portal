import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, ClipboardCheck, Gavel, Wallet, Bell, Plus, 
  Trash2, Info, Send, CheckCircle2, XCircle
} from 'lucide-react';
import { Santri, Absensi, Pelanggaran, Info as InfoType, User } from '../types';
import { formatRupiah, LIST_BULAN_MAKAN, KEGIATAN_OPTIONS, getInitialBulanan } from '../constants';

interface AdminDashboardProps {
  currentUser: User;
  dataSantri: Santri[];
  addSantri: (data: Omit<Santri, 'id'>) => Promise<void>;
  updateSantri: (id: string, data: Partial<Santri>) => Promise<void>;
  deleteSantri: (id: string) => Promise<void>;
  dataAbsensi: Absensi[];
  addAbsensi: (data: Omit<Absensi, 'id'>) => Promise<void>;
  deleteAbsensi: (id: string) => Promise<void>;
  dataPelanggaran: Pelanggaran[];
  addPelanggaran: (data: Omit<Pelanggaran, 'id'>) => Promise<void>;
  updatePelanggaran: (id: string, data: Partial<Pelanggaran>) => Promise<void>;
  deletePelanggaran: (id: string) => Promise<void>;
  dataInfo: InfoType[];
  addInfo: (data: Omit<InfoType, 'id'>) => Promise<void>;
  deleteInfo: (id: string) => Promise<void>;
}

export default function AdminDashboard({
  currentUser,
  dataSantri, addSantri, updateSantri, deleteSantri,
  dataAbsensi, addAbsensi, deleteAbsensi,
  dataPelanggaran, addPelanggaran, updatePelanggaran, deletePelanggaran,
  dataInfo, addInfo, deleteInfo
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'absensi' | 'pelanggaran' | 'keuangan' | 'info'>('data');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered data based on current admin's divisi
  const mySantri = useMemo(() => dataSantri.filter(s => s.divisi === currentUser.divisi), [dataSantri, currentUser.divisi]);
  const asramaList = useMemo(() => Array.from(new Set(mySantri.map(s => s.kamar))).sort(), [mySantri]);

  // Tab: Data Santri state
  const [newSantri, setNewSantri] = useState<Partial<Santri>>({
    nis: '', nama: '', kamar: '', kelasUmum: '', kelasMadrasah: '', waliNama: '', waliHp: '', saldo: 0
  });

  // Tab: Absensi state
  const [absDate, setAbsDate] = useState(new Date().toISOString().split('T')[0]);
  const [absKegiatan, setAbsKegiatan] = useState(KEGIATAN_OPTIONS[0]);
  const [absAsrama, setAbsAsrama] = useState('');
  const [absList, setAbsList] = useState<Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'>>({});

  // Tab: Pelanggaran state
  const [pelDate, setPelDate] = useState(new Date().toISOString().split('T')[0]);
  const [pelAsrama, setPelAsrama] = useState('');
  const [pelSantriId, setPelSantriId] = useState<string | ''>('');
  const [pelDesc, setPelDesc] = useState('');
  const [pelDenda, setPelDenda] = useState<number>(0);

  // Tab: Keuangan state
  const [financeAsrama, setFinanceAsrama] = useState('');
  const [financeSantriId, setFinanceSantriId] = useState<string | ''>('');
  const [topupNominal, setTopupNominal] = useState<number>(0);

  const selectedSantriFinance = useMemo(() => 
    dataSantri.find(s => s.id === financeSantriId), [dataSantri, financeSantriId]
  );

  // Tab: Info state
  const [infoJudul, setInfoJudul] = useState('');
  const [infoIsi, setInfoIsi] = useState('');
  const [infoDate, setInfoDate] = useState(new Date().toISOString().split('T')[0]);

  // --- ACTIONS ---

  const handleAddSantri = async () => {
    if (!newSantri.nis || !newSantri.nama || !newSantri.kamar || !newSantri.waliHp) return alert('Data wajib diisi!');
    const santri: Omit<Santri, 'id'> = {
      nis: newSantri.nis!,
      nama: newSantri.nama!,
      kamar: newSantri.kamar!,
      waliHp: newSantri.waliHp!,
      waliNama: newSantri.waliNama || '',
      kelasUmum: newSantri.kelasUmum || '-',
      kelasMadrasah: newSantri.kelasMadrasah || '-',
      divisi: currentUser.divisi!,
      bulanan: getInitialBulanan(),
      saldo: Number(newSantri.saldo) || 0
    };
    await addSantri(santri);
    setIsModalOpen(false);
    setNewSantri({ nis: '', nama: '', kamar: '', kelasUmum: '', kelasMadrasah: '', waliNama: '', waliHp: '', saldo: 0 });
  };

  const handleSimpanAbsensi = async () => {
    if (!absAsrama) return alert('Pilih asrama!');
    const filtered = mySantri.filter(s => s.kamar === absAsrama);
    
    for (const s of filtered) {
       await addAbsensi({
          santriId: s.id,
          date: absDate,
          kegiatan: absKegiatan,
          keterangan: absList[s.id] || 'Hadir',
          divisi: currentUser.divisi!
       });
    }
    alert('Absensi berhasil disimpan!');
  };

  const handleSimpanPelanggaran = async () => {
    if (!pelSantriId || !pelDesc) return alert('Lengkapi data!');
    const id = pelSantriId;
    let statusLunas = true;

    if (pelDenda > 0) {
      const s = dataSantri.find(x => x.id === id);
      if (s && s.saldo >= pelDenda) {
        await updateSantri(id, { saldo: s.saldo - pelDenda });
        statusLunas = true;
      } else {
        statusLunas = false;
      }
    }

    const item: Omit<Pelanggaran, 'id'> = {
      santriId: id,
      date: pelDate,
      deskripsi: pelDesc,
      denda: pelDenda,
      statusLunas,
      divisi: currentUser.divisi!
    };
    await addPelanggaran(item);
    setPelDesc('');
    setPelDenda(0);
    alert('Pelanggaran tercatat!');
  };

  const handleTopup = async () => {
    if (!financeSantriId || topupNominal <= 0) return;
    const s = dataSantri.find(x => x.id === financeSantriId);
    if (!s) return;
    await updateSantri(financeSantriId, { saldo: s.saldo + Number(topupNominal) });
    setTopupNominal(0);
    alert('Top-up berhasil!');
  };

  const handlePayDenda = async (pelId: string, nominal: number) => {
    if (!financeSantriId) return;
    const s = dataSantri.find(x => x.id === financeSantriId);
    if (!s || s.saldo < nominal) return alert('Saldo tidak cukup!');
    
    await updateSantri(financeSantriId, { saldo: s.saldo - nominal });
    await updatePelanggaran(pelId, { statusLunas: true });
    alert('Denda dibayar!');
  };

  const handleToggleMakan = async (bulan: string) => {
    if (!financeSantriId || !selectedSantriFinance) return;
    await updateSantri(financeSantriId, {
       bulanan: { ...selectedSantriFinance.bulanan, [bulan]: !selectedSantriFinance.bulanan[bulan] }
    });
  };

  const handleSimpanInfo = async () => {
    if (!infoJudul || !infoIsi) return;
    await addInfo({ judul: infoJudul, isi: infoIsi, date: infoDate });
    setInfoJudul('');
    setInfoIsi('');
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-8"
    >
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel Pengelola</h2>
          <p className="text-xs text-gray-500 mt-1">Pantau kehadiran, kedisiplinan, dan administrasi keuangan santri.</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs font-sans">
            {currentUser.divisi === 'putra' ? 'L' : 'P'}
          </div>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Divisi {currentUser.divisi}</span>
        </div>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { id: 'data', label: 'Data Santri', icon: Users, color: 'emerald', count: `${mySantri.length} Santri` },
          { id: 'absensi', label: 'Absensi', icon: ClipboardCheck, color: 'amber', count: `${dataAbsensi.filter(a => a.divisi === currentUser.divisi).length} Catatan` },
          { id: 'pelanggaran', label: 'Pelanggaran', icon: Gavel, color: 'red', count: `${dataPelanggaran.filter(p => p.divisi === currentUser.divisi).length} Kasus` },
          { id: 'keuangan', label: 'Keuangan', icon: Wallet, color: 'indigo', count: 'Saldo & Makan' },
          { id: 'info', label: 'Informasi', icon: Bell, color: 'blue', count: `${dataInfo.length} Pengumuman` }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all ${
              activeTab === item.id 
                ? `bg-${item.color}-50 border-${item.color}-500 text-${item.color}-800 shadow-sm` 
                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3 ${
               activeTab === item.id ? `bg-${item.color}-100 text-${item.color}-700` : `bg-gray-50 text-gray-400`
            }`}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold">{item.label}</span>
            <span className={`text-[10px] mt-1 ${activeTab === item.id ? `text-${item.color}-600` : 'text-gray-400'}`}>{item.count}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'data' && (
          <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Daftar Santri</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Santri
              </button>
            </div>
            <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 border-b border-gray-100 text-[11px] font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">NIS</th>
                    <th className="px-6 py-4">Nama</th>
                    <th className="px-6 py-4">Kelas & Asrama</th>
                    <th className="px-6 py-4">Wali</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100">
                  {mySantri.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-6 py-5 font-mono text-gray-400 tracking-tighter">{s.nis}</td>
                      <td className="px-6 py-5 font-bold text-gray-800">{s.nama}</td>
                      <td className="px-6 py-5">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] text-gray-600 font-medium block w-fit mb-1">{s.kamar}</span>
                        <span className="text-[10px] text-gray-500">U: {s.kelasUmum} | M: {s.kelasMadrasah}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-emerald-800 text-sm">{s.waliNama}</p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">{s.waliHp}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => deleteSantri(s.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 transition-all mx-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {mySantri.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400 italic">Belum ada data santri terdaftar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'absensi' && (
          <motion.div key="absensi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start">
               <Info className="w-5 h-5 text-amber-700 mr-3 flex-shrink-0" />
               <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  Pilih Asrama untuk memuat daftar santri. Tandai kehadiran secara massal lalu simpan.
               </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase">Tanggal</label>
                  <input type="date" value={absDate} onChange={e => setAbsDate(e.target.value)} className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase">Kegiatan</label>
                  <select value={absKegiatan} onChange={e => setAbsKegiatan(e.target.value)} className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs bg-slate-50">
                    {KEGIATAN_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-600 uppercase">Pilih Asrama</label>
                  <select value={absAsrama} onChange={e => setAbsAsrama(e.target.value)} className="w-full border border-gray-200 rounded-xl py-2 px-3 text-xs bg-slate-50">
                    <option value="">-- Pilih Asrama --</option>
                    {asramaList.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              {absAsrama && (
                <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                      <tr>
                        <th className="px-4 py-3 w-10">No</th>
                        <th className="px-4 py-3">Nama Santri</th>
                        <th className="px-4 py-3 text-center">Status Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-gray-100">
                      {mySantri.filter(s => s.kamar === absAsrama).sort((a,b) => a.nama.localeCompare(b.nama)).map((s, idx) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold">{s.nama}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex bg-gray-50 p-1 rounded-lg border border-gray-200 shadow-inner">
                              {['Hadir', 'Sakit', 'Izin', 'Alpa'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => setAbsList(prev => ({ ...prev, [s.id]: status as any }))}
                                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                                    (absList[s.id] || 'Hadir') === status 
                                      ? (status === 'Hadir' ? 'bg-emerald-600 text-white shadow' : 
                                         status === 'Sakit' ? 'bg-blue-600 text-white shadow' :
                                         status === 'Izin' ? 'bg-amber-600 text-white shadow' : 'bg-red-600 text-white shadow')
                                      : 'text-gray-400 hover:text-gray-600'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSimpanAbsensi}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all flex items-center"
                >
                  <Send className="w-3 h-3 mr-2" />
                  Simpan Absensi
                </button>
              </div>
            </div>

            <div className="mt-8 overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-700 border-b border-gray-100 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Nama Santri</th>
                    <th className="px-6 py-4">Kegiatan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-100">
                  {dataAbsensi.filter(a => a.divisi === currentUser.divisi).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50).map(a => {
                    const s = dataSantri.find(x => x.id === a.santriId);
                    return (
                      <tr key={a.id}>
                        <td className="px-6 py-4 text-gray-500">{a.date}</td>
                        <td className="px-6 py-4 font-bold">{s?.nama || '[Terhapus]'}</td>
                        <td className="px-6 py-4">{a.kegiatan}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            a.keterangan === 'Hadir' ? 'bg-emerald-100 text-emerald-700' :
                            a.keterangan === 'Sakit' ? 'bg-blue-100 text-blue-700' :
                            a.keterangan === 'Izin' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>{a.keterangan}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => deleteAbsensi(a.id)} className="text-red-300 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'pelanggaran' && (
          <motion.div key="pelanggaran" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
             <div className="bg-slate-50 p-6 rounded-3xl border border-gray-200 space-y-5">
                <h3 className="text-sm font-bold text-gray-800">Catat Pelanggaran</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Tanggal</label>
                      <input type="date" value={pelDate} onChange={e => setPelDate(e.target.value)} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs mt-1" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Asrama</label>
                      <select value={pelAsrama} onChange={e => setPelAsrama(e.target.value)} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs bg-white mt-1">
                         <option value="">-- Pilih Asrama --</option>
                         {asramaList.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Santri</label>
                      <select value={pelSantriId} onChange={e => setPelSantriId(e.target.value)} disabled={!pelAsrama} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs bg-white mt-1 disabled:opacity-50">
                         <option value="">-- Pilih Santri --</option>
                         {mySantri.filter(s => s.kamar === pelAsrama).map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Denda (Rp)</label>
                      <input type="number" value={pelDenda} onChange={e => setPelDenda(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs mt-1" placeholder="0" />
                   </div>
                   <div className="lg:col-span-3">
                      <input type="text" value={pelDesc} onChange={e => setPelDesc(e.target.value)} placeholder="Deskripsi Pelanggaran..." className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs" />
                   </div>
                   <button onClick={handleSimpanPelanggaran} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md">
                      Laporkan
                   </button>
                </div>
             </div>
             <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 text-slate-700 border-b border-gray-100 text-[10px] font-bold uppercase">
                      <tr>
                         <th className="px-6 py-4">Tanggal</th>
                         <th className="px-6 py-4">Santri</th>
                         <th className="px-6 py-4">Deskripsi</th>
                         <th className="px-6 py-4">Denda</th>
                         <th className="px-6 py-4 text-center">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="text-xs divide-y divide-gray-100">
                      {dataPelanggaran.filter(p => p.divisi === currentUser.divisi).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => {
                         const s = dataSantri.find(x => x.id === p.santriId);
                         return (
                            <tr key={p.id}>
                               <td className="px-6 py-4 text-gray-500">{p.date}</td>
                               <td className="px-6 py-4 font-bold">{s?.nama || '[Terhapus]'}</td>
                               <td className="px-6 py-4 italic text-red-600">"{p.deskripsi}"</td>
                               <td className="px-6 py-4">
                                  {p.denda > 0 ? (
                                     <div className="text-[10px]">
                                        <span className="font-bold">{formatRupiah(p.denda)}</span><br/>
                                        <span className={p.statusLunas ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                                           {p.statusLunas ? '(Lunas)' : '(Tertunggak)'}
                                        </span>
                                     </div>
                                  ) : '-'}
                               </td>
                               <td className="px-6 py-4 text-center">
                                  <button onClick={() => deletePelanggaran(p.id)} className="text-red-300 hover:text-red-600">
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
          </motion.div>
        )}

        {activeTab === 'keuangan' && (
          <motion.div key="keuangan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 h-fit">
                   <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center"><Wallet className="w-4 h-4 mr-2" /> Pilih Santri</h3>
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">1. Asrama</label>
                         <select value={financeAsrama} onChange={e => setFinanceAsrama(e.target.value)} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs bg-slate-50 mt-1">
                            <option value="">-- Pilih Asrama --</option>
                            {asramaList.map(a => <option key={a} value={a}>{a}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">2. Santri</label>
                         <select value={financeSantriId} onChange={e => setFinanceSantriId(e.target.value)} disabled={!financeAsrama} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs bg-slate-50 mt-1 disabled:opacity-50">
                            <option value="">-- Pilih Santri --</option>
                            {mySantri.filter(s => s.kamar === financeAsrama).map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                         </select>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                   {selectedSantriFinance ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                               <p className="text-[10px] uppercase font-bold text-gray-500">Saldo Saat Ini</p>
                               <h2 className="text-3xl font-black text-emerald-600 mt-1">{formatRupiah(selectedSantriFinance.saldo)}</h2>
                            </div>
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                               <input type="number" value={topupNominal} onChange={e => setTopupNominal(Number(e.target.value))} placeholder="Nominal" className="w-full md:w-32 border border-gray-200 rounded-xl py-2 px-3 text-xs" />
                               <button onClick={handleTopup} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md whitespace-nowrap">
                                  Isi Saldo
                               </button>
                            </div>
                         </div>

                         {/* Tertunggak */}
                         {dataPelanggaran.filter(p => p.santriId === financeSantriId && p.denda > 0 && !p.statusLunas).length > 0 && (
                            <div className="bg-red-50 p-5 rounded-2xl border border-red-200">
                               <h4 className="text-xs font-bold text-red-800 mb-3 block">Denda Belum Lunas</h4>
                               <div className="space-y-2">
                                  {dataPelanggaran.filter(p => p.santriId === financeSantriId && p.denda > 0 && !p.statusLunas).map(p => (
                                     <div key={p.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                        <div className="text-[11px] font-bold text-gray-800">{p.deskripsi}</div>
                                        <div className="flex items-center space-x-3 text-[11px]">
                                           <span className="font-bold text-red-600">{formatRupiah(p.denda)}</span>
                                           <button onClick={() => handlePayDenda(p.id, p.denda)} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-3 rounded-lg">Bayar</button>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}

                         <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Bulanan Makan</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                               {LIST_BULAN_MAKAN.map(bulan => (
                                  <button
                                     key={bulan}
                                     onClick={() => handleToggleMakan(bulan)}
                                     className={`p-3 border rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                                        selectedSantriFinance.bulanan[bulan] ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-gray-100 text-gray-400'
                                     }`}
                                  >
                                     {selectedSantriFinance.bulanan[bulan] && <CheckCircle2 className="w-3 h-3 mr-2 text-emerald-600" />}
                                     {bulan}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </motion.div>
                   ) : (
                      <div className="bg-slate-50 h-full min-h-[300px] flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200">
                         <div className="w-16 h-16 bg-gray-100 text-gray-300 rounded-3xl flex items-center justify-center mb-4">
                            <Wallet className="w-8 h-8" />
                         </div>
                         <p className="text-sm text-gray-400">Pilih santri untuk mengelola keuangan</p>
                      </div>
                   )}
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'info' && (
           <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
             <div className="bg-slate-50 p-6 rounded-3xl border border-gray-200 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                   <input type="text" value={infoJudul} onChange={e => setInfoJudul(e.target.value)} placeholder="Judul Pengumuman" className="md:col-span-2 border border-gray-200 rounded-xl py-3 px-4 text-xs" />
                   <input type="date" value={infoDate} onChange={e => setInfoDate(e.target.value)} className="border border-gray-200 rounded-xl py-3 px-4 text-xs" />
                   <textarea value={infoIsi} onChange={e => setInfoIsi(e.target.value)} rows={3} placeholder="Isi pengumuman..." className="md:col-span-3 border border-gray-200 rounded-xl py-3 px-4 text-xs" />
                </div>
                <button onClick={handleSimpanInfo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl text-sm ml-auto block">Publikasikan</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataInfo.slice().reverse().map(i => (
                   <div key={i.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group">
                      <button onClick={() => deleteInfo(i.id)} className="absolute top-4 right-4 text-red-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                         <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{i.date}</span>
                      <h4 className="text-base font-bold text-gray-800 mt-1">{i.judul}</h4>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{i.isi}</p>
                   </div>
                ))}
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Add Santri */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Registrasi Santri Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Identitas Santri</label>
                  <div className="space-y-2">
                     <input value={newSantri.nis} onChange={e => setNewSantri({...newSantri, nis: e.target.value})} placeholder="NIS" className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm" />
                     <input value={newSantri.nama} onChange={e => setNewSantri({...newSantri, nama: e.target.value})} placeholder="Nama Lengkap" className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm" />
                     <input value={newSantri.kamar} onChange={e => setNewSantri({...newSantri, kamar: e.target.value})} placeholder="Asrama (Contoh: Al-Farabi)" className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <input value={newSantri.kelasUmum} onChange={e => setNewSantri({...newSantri, kelasUmum: e.target.value})} placeholder="Kelas Umum" className="border border-gray-200 rounded-xl py-3 px-4 text-sm" />
                  <input value={newSantri.kelasMadrasah} onChange={e => setNewSantri({...newSantri, kelasMadrasah: e.target.value})} placeholder="Kelas Madrasah" className="border border-gray-200 rounded-xl py-3 px-4 text-sm" />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Keuangan & Wali</label>
                  <div className="grid grid-cols-2 gap-3">
                     <input type="number" value={newSantri.saldo} onChange={e => setNewSantri({...newSantri, saldo: Number(e.target.value)})} placeholder="Saldo Awal" className="border border-gray-200 rounded-xl py-3 px-4 text-sm" />
                     <input value={newSantri.waliNama} onChange={e => setNewSantri({...newSantri, waliNama: e.target.value})} placeholder="Nama Wali" className="border border-gray-200 rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <input value={newSantri.waliHp} onChange={e => setNewSantri({...newSantri, waliHp: e.target.value})} placeholder="WhatsApp Wali" className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm mt-2" />
               </div>
               <button onClick={handleAddSantri} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl text-sm mt-4 shadow-xl transition-all">
                  Konfirmasi & Simpan
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}
