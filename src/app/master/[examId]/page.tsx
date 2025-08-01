
import { getPatient } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, Pencil, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { allQuestions } from '@/lib/survey-data';

const toothStatusCodeMap: Record<string, string> = {
    // Gigi Tetap
    '0': 'Sehat',
    '1': 'Gigi Berlubang/Karies',
    '2': 'Tumpatan dengan karies',
    '3': 'Tumpatan tanpa karies',
    '4': 'Gigi dicabut karena karies',
    '5': 'Gigi dicabut karena sebab lain',
    '6': 'Fissure Sealant',
    '7': 'Protesa cekat/mahkota cekat/implan/veneer',
    '8': 'Gigi tidak tumbuh',
    '9': 'Lain-lain',
    // Gigi Sulung
    'A': 'Sehat',
    'B': 'Gigi Berlubang/Karies',
    'C': 'Tumpatan dengan karies',
    'D': 'Tumpatan tanpa karies',
    'E': 'Gigi dicabut karena karies',
};

const DataField = ({ label, value }: { label: string; value?: string | number | null }) => {
    if (!value && value !== 0) return null;
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{String(value)}</p>
        </div>
    );
};

const getLabel = (key: string) => allQuestions.find(q => q.id === key)?.question || key;

export default async function ViewPatientPage({ params }: { params: { examId: string } }) {
  const { examId } = params;
  const { patient, error } = await getPatient(examId);

  const demographicFields = [
    { id: 'exam-id', label: 'Nomor Urut' },
    { id: 'exam-date', label: 'Tanggal Pemeriksaan' },
    { id: 'name', label: 'Nama Pasien' },
    { id: 'birth-date', label: 'Tanggal Lahir' },
    { id: 'gender', label: 'Jenis Kelamin' },
    { id: 'address', label: 'Alamat' },
    { id: 'village', label: 'Desa/Kelurahan' },
    { id: 'district', label: 'Kecamatan' },
    { id: 'city', label: 'Kota/Kabupaten' },
    { id: 'province', label: 'Provinsi' },
    { id: 'patient-category', label: 'Kategori Pasien' },
  ];

  const professionalFields = [
    { id: 'agency', label: 'Instansi Penyelenggara' },
    { id: 'examiner', label: 'Nama Pemeriksa' },
    { id: 'recorder', label: 'Nama Pencatat' },
  ];

  const educationFields = [
      { id: 'education', label: 'Pendidikan' },
      { id: 'occupation', label: 'Pekerjaan' },
      { id: 'school-name', label: 'Nama Sekolah' },
      { id: 'class-level', label: 'Kelas' },
      { id: 'parent-education', label: 'Pendidikan Orang Tua' },
      { id: 'parent-occupation', label: 'Pekerjaan Orang Tua' },
  ]

  const clinicalFields = [
      { id: 'DMF-T Score', label: 'Skor DMF-T' },
      { id: 'def-t Score', label: 'Skor def-t' },
      { id: 'Gusi berdarah', label: 'Gusi Berdarah' },
      { id: 'Lesi Mukosa Oral', label: 'Lesi Mukosa Oral' },
      { id: 'Kebutuhan perawatan segera', label: 'Kebutuhan Perawatan' },
      { id: 'Rujukan', label: 'Rujukan' },
      { id: 'Lokasi Rujukan', label: 'Lokasi Rujukan' },
  ];

  const formatDisplayValue = (key: string, value: any): string => {
    if (!value) return '-';
    if (key === 'exam-date' && value instanceof Date) {
      return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(value);
    }
    if (key === 'birth-date' && typeof value === 'object') {
        return `${value.day}/${value.month}/${value.year}`;
    }
    if (key === 'gender' && value === '1') return 'Laki-laki';
    if (key === 'gender' && value === '2') return 'Perempuan';
    return String(value);
  }

  const formatToothStatusValue = (value: any): string => {
    const code = String(value);
    const description = toothStatusCodeMap[code];
    return description ? `${code} (${description})` : code;
  };


  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
             <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <CardTitle className="font-headline text-4xl">Detail Data Pasien</CardTitle>
                    <CardDescription>Informasi lengkap untuk pasien dengan nomor urut: {examId}</CardDescription>
                </div>
                 <div className="flex gap-2">
                    <Link href="/master" passHref>
                       <Button variant="outline">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Kembali ke Tabel
                       </Button>
                    </Link>
                    <Link href={`/master/${examId}/edit`} passHref>
                       <Button>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Data
                       </Button>
                    </Link>
                 </div>
             </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Gagal Memuat Data</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {patient && (
                <div className="space-y-6">
                    {/* Demographics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Diri Pasien</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                            {demographicFields.map(field => (
                                <DataField key={field.id} label={field.label} value={formatDisplayValue(field.id, patient[field.id])} />
                            ))}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Data Pendidikan & Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
                               {educationFields.map(field => (
                                    <DataField key={field.id} label={getLabel(field.id)} value={formatDisplayValue(field.id, patient[field.id])} />
                                ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Data Pemeriksaan</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {professionalFields.map(field => (
                                    <DataField key={field.id} label={field.label} value={formatDisplayValue(field.id, patient[field.id])} />
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Clinical */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hasil Pemeriksaan Klinis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                {clinicalFields.map(field => (
                                    <DataField key={field.id} label={field.label} value={patient[field.id]} />
                                ))}
                            </div>
                             <Separator className="my-6" />
                             <div>
                                <h4 className="mb-2 font-medium">Status Gigi Geligi</h4>
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                    {Object.entries(patient)
                                        .filter(([key]) => key.startsWith('Status Gigi'))
                                        .map(([key, value]) => (
                                            <DataField key={key} label={key} value={formatToothStatusValue(value)} />
                                        ))
                                    }
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
