export const provinces = [
  { name: 'DKI Jakarta', cities: ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Kepulauan Seribu'] },
  { name: 'Jawa Barat', cities: ['Bandung', 'Bekasi', 'Bogor', 'Cimahi', 'Cirebon', 'Depok', 'Sukabumi', 'Tasikmalaya'] },
  { name: 'Jawa Tengah', cities: ['Semarang', 'Magelang', 'Pekalongan', 'Salatiga', 'Surakarta', 'Tegal'] },
  { name: 'Jawa Timur', cities: ['Surabaya', 'Batu', 'Blitar', 'Kediri', 'Madiun', 'Malang', 'Mojokerto', 'Pasuruan', 'Probolinggo'] },
  { name: 'Banten', cities: ['Cilegon', 'Serang', 'Tangerang', 'Tangerang Selatan'] },
];

export const getCitiesByProvince = (provinceName: string): string[] => {
  const province = provinces.find(p => p.name === provinceName);
  return province ? province.cities : [];
};
