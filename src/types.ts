export interface BulananMakan {
  [key: string]: boolean;
}

export interface Santri {
  id: string;
  nis: string;
  nama: string;
  kamar: string;
  divisi: 'putra' | 'putri';
  waliNama: string;
  waliHp: string;
  kelasUmum: string;
  kelasMadrasah: string;
  saldo: number;
  bulanan: BulananMakan;
}

export interface Absensi {
  id: string;
  santriId: string;
  date: string;
  kegiatan: string;
  keterangan: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  divisi: 'putra' | 'putri';
}

export interface Pelanggaran {
  id: string;
  santriId: string;
  date: string;
  deskripsi: string;
  denda: number;
  statusLunas: boolean;
  divisi: 'putra' | 'putri';
}

export interface Info {
  id: string;
  judul: string;
  isi: string;
  date: string;
}

export type AuthRole = 'admin' | 'wali' | null;

export interface User {
  role: AuthRole;
  divisi?: 'putra' | 'putri';
  santriId?: string;
}
