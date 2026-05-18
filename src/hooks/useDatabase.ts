import { useState, useEffect } from 'react';
import { Santri, Absensi, Pelanggaran, Info } from '../types';
import { getInitialBulanan } from '../constants';

export function useDatabase() {
  const [dataSantri, setDataSantri] = useState<Santri[]>(() => {
    const saved = localStorage.getItem('SantriAf_santri');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old data
      return parsed.map((s: any) => ({
        ...s,
        kelasUmum: s.kelasUmum || '-',
        kelasMadrasah: s.kelasMadrasah || '-',
        saldo: s.saldo || 0,
        bulanan: s.bulanan || getInitialBulanan()
      }));
    }
    return [
      { id: 1, nis: "1001", nama: "Ahmad Mujib", kamar: "Al-Farabi", divisi: "putra", waliNama: "Umar Bakri", waliHp: "08123456789", kelasUmum: "X MIPA", kelasMadrasah: "Ulya 1", saldo: 50000, bulanan: getInitialBulanan() },
      { id: 2, nis: "2001", nama: "Siti Aminah", kamar: "Khadijah", divisi: "putri", waliNama: "Fatimah Zahra", waliHp: "08987654321", kelasUmum: "VII MTS", kelasMadrasah: "Wustho 2", saldo: 0, bulanan: getInitialBulanan() }
    ] as Santri[];
  });

  const [dataAbsensi, setDataAbsensi] = useState<Absensi[]>(() => {
    const saved = localStorage.getItem('SantriAf_absensi');
    return saved ? JSON.parse(saved) : [];
  });

  const [dataPelanggaran, setDataPelanggaran] = useState<Pelanggaran[]>(() => {
    const saved = localStorage.getItem('SantriAf_pelanggaran');
    return saved ? JSON.parse(saved) : [];
  });

  const [dataInfo, setDataInfo] = useState<Info[]>(() => {
    const saved = localStorage.getItem('SantriAf_info');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('SantriAf_santri', JSON.stringify(dataSantri));
  }, [dataSantri]);

  useEffect(() => {
    localStorage.setItem('SantriAf_absensi', JSON.stringify(dataAbsensi));
  }, [dataAbsensi]);

  useEffect(() => {
    localStorage.setItem('SantriAf_pelanggaran', JSON.stringify(dataPelanggaran));
  }, [dataPelanggaran]);

  useEffect(() => {
    localStorage.setItem('SantriAf_info', JSON.stringify(dataInfo));
  }, [dataInfo]);

  return {
    dataSantri, setDataSantri,
    dataAbsensi, setDataAbsensi,
    dataPelanggaran, setDataPelanggaran,
    dataInfo, setDataInfo
  };
}
