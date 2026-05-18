export const LIST_BULAN_MAKAN = [
  "Syawal", "Dzulqa'dah", "Dzulhijjah", "Muharram", "Safar", 
  "Rabi'ul Awal", "Rabi'ul Akhir", "Jumadil Awal", "Jumadil Akhir", 
  "Rajab", "Sya'ban"
];

export const KEGIATAN_OPTIONS = [
  "Kegiatan Subuh",
  "Ngaji Pagi",
  "Sekolah",
  "Madrasah Diniyah",
  "Kegiatan Magrib",
  "Ngaji Malam"
];

export const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

export const getInitialBulanan = () => {
  const obj: Record<string, boolean> = {};
  LIST_BULAN_MAKAN.forEach(b => (obj[b] = false));
  return obj;
};
