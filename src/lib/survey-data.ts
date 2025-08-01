export type Question = {
  id: string;
  question: string;
  type: 'text' | 'number' | 'radio' | 'textarea' | 'date' | 'select';
  options?: string[];
  placeholder?: string;
  sectionId: string;
};

export type Section = {
  id: string;
  title: string;
  questions: Question[];
};

export const sections: Section[] = [
  {
    id: 'exam-info',
    title: 'Informasi Pemeriksaan',
    questions: [
       {
        id: 'province',
        question: 'Provinsi',
        type: 'select',
        sectionId: 'exam-info',
      },
      {
        id: 'city',
        question: 'Kota/Kabupaten',
        type: 'select',
        sectionId: 'exam-info',
      },
      {
        id: 'exam-date',
        question: 'Tanggal Pemeriksaan',
        type: 'date',
        sectionId: 'exam-info',
      },
    ],
  },
  {
    id: 'patient-identity',
    title: 'Identitas Pasien',
    questions: [
      {
        id: 'name',
        question: 'Nama Lengkap',
        type: 'text',
        placeholder: 'Contoh: John Doe',
        sectionId: 'patient-identity',
      },
      {
        id: 'gender',
        question: 'Jenis Kelamin',
        type: 'radio',
        options: ['Laki-laki', 'Perempuan'],
        sectionId: 'patient-identity',
      },
      {
        id: 'birth-info',
        question: 'Tempat, Tanggal Lahir',
        type: 'text',
        placeholder: 'Contoh: Bandung, 17 Agustus 1990',
        sectionId: 'patient-identity',
      },
      {
        id: 'address',
        question: 'Alamat',
        type: 'textarea',
        placeholder: 'Masukkan alamat lengkap',
        sectionId: 'patient-identity',
      },
      {
        id: 'occupation',
        question: 'Pekerjaan',
        type: 'radio',
        options: ['Pelajar/Mahasiswa', 'Pegawai Negeri', 'Pegawai Swasta', 'Wiraswasta', 'Ibu Rumah Tangga', 'Tidak Bekerja', 'Pensiunan', 'Lainnya'],
        sectionId: 'patient-identity',
      },
      {
        id: 'education',
        question: 'Pendidikan Terakhir',
        type: 'radio',
        options: ['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana', 'Lainnya'],
        sectionId: 'patient-identity',
      },
    ],
  },
  {
    id: 'dental-check',
    title: 'Pemeriksaan Klinis',
    questions: [
      {
        id: 'odontogram',
        question: 'Odontogram (Catatan)',
        type: 'textarea',
        placeholder: 'Catat temuan pada odontogram...',
        sectionId: 'dental-check',
      },
      {
        id: 'gum-check',
        question: 'Pemeriksaan Gusi',
        type: 'radio',
        options: ['Baik', 'Ada karang gigi', 'Radang gusi (Gingivitis)'],
        sectionId: 'dental-check',
      },
      {
        id: 'mucosal-lesion',
        question: 'Lesi Mukosa Oral',
        type: 'radio',
        options: ['Tidak Ada', 'Ada'],
        sectionId: 'dental-check',
      },
    ],
  },
  {
    id: 'treatment-plan',
    title: 'Kebutuhan Perawatan',
    questions: [
      {
        id: 'treatment-needs',
        question: 'Kebutuhan Perawatan',
        type: 'radio',
        options: ['Tidak ada', 'Pembersihan karang gigi (scalling)', 'Penambalan', 'Pencabutan', 'Perawatan Saluran Akar', 'Lainnya'],
        sectionId: 'treatment-plan',
      },
      {
        id: 'referral',
        question: 'Rujukan',
        type: 'radio',
        options: ['Ya', 'Tidak'],
        sectionId: 'treatment-plan',
      },
    ],
  },
];


export const allQuestions = sections.flatMap((section) => section.questions);
