export type Question = {
  id: string;
  question: string;
  type: 'text' | 'number' | 'radio';
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
    id: 'personal-info',
    title: 'Informasi Pribadi',
    questions: [
      {
        id: 'name',
        question: 'Nama Lengkap Anda',
        type: 'text',
        placeholder: 'Contoh: John Doe',
        sectionId: 'personal-info',
      },
      {
        id: 'age',
        question: 'Usia Anda (tahun)',
        type: 'number',
        placeholder: 'Contoh: 25',
        sectionId: 'personal-info',
      },
    ],
  },
  {
    id: 'dental-history',
    title: 'Riwayat Kesehatan Gigi',
    questions: [
      {
        id: 'last-visit',
        question: 'Kapan terakhir kali Anda mengunjungi dokter gigi?',
        type: 'radio',
        options: ['Dalam 6 bulan terakhir', '6 bulan - 1 tahun yang lalu', 'Lebih dari 1 tahun yang lalu', 'Tidak pernah'],
        sectionId: 'dental-history',
      },
      {
        id: 'current-pain',
        question: 'Apakah Anda merasakan sakit gigi saat ini?',
        type: 'radio',
        options: ['Ya', 'Tidak'],
        sectionId: 'dental-history',
      },
    ],
  },
  {
    id: 'oral-hygiene',
    title: 'Kebiasaan Perawatan Gigi',
    questions: [
      {
        id: 'brushing-frequency',
        question: 'Seberapa sering Anda menyikat gigi dalam sehari?',
        type: 'radio',
        options: ['Sekali sehari', 'Dua kali sehari', 'Tiga kali atau lebih', 'Tidak setiap hari'],
        sectionId: 'oral-hygiene',
      },
    ],
  },
  {
    id: 'diet-habits',
    title: 'Kebiasaan Makan dan Minum',
    questions: [
      {
        id: 'sweet-intake',
        question: 'Seberapa sering Anda mengonsumsi makanan atau minuman manis?',
        type: 'radio',
        options: ['Jarang (beberapa kali sebulan)', 'Kadang-kadang (beberapa kali seminggu)', 'Sering (hampir setiap hari)'],
        sectionId: 'diet-habits',
      },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Gaya Hidup',
    questions: [
      {
        id: 'smoking',
        question: 'Apakah Anda merokok?',
        type: 'radio',
        options: ['Ya', 'Tidak'],
        sectionId: 'lifestyle',
      },
    ],
  },
];

export const allQuestions = sections.flatMap((section) => section.questions);
