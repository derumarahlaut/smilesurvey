export type Question = {
  id: string;
  question: string;
  type: 'text' | 'number' | 'radio' | 'textarea' | 'date' | 'select' | 'custom';
  options?: string[];
  placeholder?: string;
  sectionId: string;
  component?: React.ComponentType<any>;
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
        id: 'birth-place',
        question: 'Tempat Lahir',
        type: 'text',
        placeholder: 'Contoh: Bandung',
        sectionId: 'patient-identity',
      },
       {
        id: 'birth-date',
        question: 'Tanggal Lahir',
        type: 'date',
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
        options: ['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana', 'S2', 'S3', 'Lainnya'],
        sectionId: 'patient-identity',
      },
    ],
  },
  {
    id: 'dental-check',
    title: 'Pemeriksaan Klinis',
    questions: [
      {
        id: 'odontogram-chart',
        question: 'Status Gigi Geligi',
        type: 'custom',
        sectionId: 'dental-check',
      }
    ],
  },
];


export const allQuestions = sections.flatMap((section) => section.questions);
