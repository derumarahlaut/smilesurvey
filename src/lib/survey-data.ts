
export type Question = {
  id: string;
  question: string;
  type: 'text' | 'number' | 'radio' | 'select' | 'date' | 'custom';
  options?: string[];
  placeholder?: string;
};

export const allQuestions: Question[] = [
    // Based on the single-page layout
    { id: 'exam-id', question: 'Nomor Urut', type: 'number' },
    { id: 'province', question: 'Provinsi', type: 'select' },
    { id: 'city', question: 'Kota/Kabupaten', type: 'select' },
    { id: 'agency', question: 'Instansi Penyelenggara Survey', type: 'text' },
    { id: 'examiner', question: 'Nama Pemeriksa', type: 'text' },
    { id: 'recorder', question: 'Nama Pencatat', type: 'text' },
    { id: 'name', question: 'Nama Pasien', type: 'text' },
    { id: 'village', question: 'Desa/Kelurahan/Kecamatan', type: 'text' },
    {
      id: 'occupation',
      question: 'Pekerjaan',
      type: 'select',
      options: ['Pelajar/Mahasiswa', 'Pegawai Negeri', 'Pegawai Swasta', 'Wiraswasta', 'Ibu Rumah Tangga', 'Tidak Bekerja', 'Pensiunan', 'Lainnya'],
    },
    { id: 'address', question: 'Alamat Pasien', type: 'text' },
    { id: 'birth-date', question: 'Tanggal Lahir (Tgl/Bl/Th)', type: 'date' },
    { id: 'gender', question: 'Jenis Kelamin (1=L, 2=P)', type: 'select', options: ['Laki-laki', 'Perempuan'] },
    {
      id: 'education',
      question: 'Pendidikan Terakhir',
      type: 'select',
      options: ['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana', 'S2', 'S3', 'Lainnya'],
    },
    // The odontogram and other clinical checks will be handled by the Odontogram component
    {
        id: 'odontogram-chart',
        question: 'Pemeriksaan Klinis',
        type: 'custom',
    }
];

// This structure is now flatter as we don't need sections for the single-page layout.
// However, we can keep it if we want to group fields logically in the future.
export const sections = [
  {
    id: 'main-form',
    title: 'Form Pemeriksaan Gigi',
    questions: allQuestions,
  }
];
