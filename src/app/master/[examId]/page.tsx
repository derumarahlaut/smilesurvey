
'use client';

import { getPatient, verifyPatient } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, Pencil, CheckCircle, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { allQuestions } from '@/lib/survey-data';
import { useEffect, useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { OdontogramDisplay } from '@/components/odontogram-display';

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

const DataField = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => {
    if (!value && value !== 0 && !children) return null;
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {value && <p className="font-medium">{String(value)}</p>}
            {children}
        </div>
    );
};

const getLabel = (key: string) => allQuestions.find(q => q.id === key)?.question || key;

const VerificationDialog = ({ examId, patient, onVerifySuccess }: { examId: string, patient: any, onVerifySuccess: () => void }) => {
    const [verifierName, setVerifierName] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const { toast } = useToast();

    const handleVerify = async () => {
        if (!verifierName.trim()) {
            toast({
                title: 'Nama Verifikator Kosong',
                description: 'Mohon isi nama Anda untuk melanjutkan verifikasi.',
                variant: 'destructive',
            });
            return;
        }
        setIsVerifying(true);
        const result = await verifyPatient(examId, verifierName, patient);
        setIsVerifying(false);

        if (result.error) {
            toast({
                title: 'Gagal Memverifikasi',
                description: result.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Verifikasi Berhasil',
                description: `Data pasien ${examId} telah diverifikasi oleh ${verifierName}.`,
            });
            onVerifySuccess();
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="secondary">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verifikasi Data
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Verifikasi Data</AlertDialogTitle>
                    <AlertDialogDescription>
                        Dengan ini Anda menyatakan bahwa data yang diinput untuk pasien {examId} sudah benar dan valid.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="verifierName">Nama Verifikator</Label>
                    <Input
                        id="verifierName"
                        value={verifierName}
                        onChange={(e) => setVerifierName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda..."
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleVerify} disabled={isVerifying}>
                        {isVerifying ? 'Memverifikasi...' : 'Ya, Verifikasi'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};


export default function ViewPatientPage() {
  const params = useParams();
  const examId = params.examId as string;
  const [patient, setPatient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatient = useCallback(async () => {
      if (!examId) return;
      setLoading(true);
      const { patient: fetchedPatient, error: fetchError } = await getPatient(examId);
      if (fetchError) {
          setError(fetchError);
          setPatient(null);
      } else {
          setPatient(fetchedPatient);
          setError(null);
      }
      setLoading(false);
  }, [examId]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);


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
    { id: 'phone', label: 'Nomor WhatsApp' },
    { id: 'email', label: 'Email' },
  ];

  const professionalFields = [
    { id: 'agency', label: 'Instansi Penyelenggara' },
    { id: 'examiner', label: 'Nama Pemeriksa' },
    { id: 'recorder', label: 'Nama Pencatat' },
  ];
  
  const generalEducationFields = [
      { id: 'education', label: 'Pendidikan' },
      { id: 'occupation', label: 'Pekerjaan' },
  ];
  
  const studentEducationFields = [
      { id: 'school-name', label: 'Nama Sekolah' },
      { id: 'class-level', label: 'Kelas' },
      { id: 'parent-education', label: 'Pendidikan Orang Tua' },
      { id: 'parent-occupation', label: 'Pekerjaan Orang Tua' },
  ];

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
    if (value === null || value === undefined || value === '') return '-';
    if (key === 'exam-date' && value instanceof Date) {
      return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(value);
    }
     if (key === 'verifiedAt' && value instanceof Date) {
      return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(value);
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

  const renderContent = () => {
    if (loading) {
       return (
         <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Memuat Data...</AlertTitle>
            <AlertDescription>Sedang mengambil data pasien, mohon tunggu.</AlertDescription>
          </Alert>
       )
    }
    if (error) {
       return (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )
    }
    if (patient) {
        const educationFields = patient['patient-category'] === 'Umum' ? generalEducationFields : studentEducationFields;
        return (
            <div className="space-y-6">
                {/* Demographics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Diri Pasien</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                        {demographicFields.map(field => (
                            <DataField key={field.id} label={getLabel(field.id)} value={formatDisplayValue(field.id, patient[field.id])} />
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
                            <h4 className="mb-4 font-medium text-center">Odontogram Pasien</h4>
                             <OdontogramDisplay patientData={patient} />
                         </div>
                         <Separator className="my-6" />
                         <div>
                            <h4 className="mb-2 font-medium">Status Gigi Geligi</h4>
                            <div className="flex flex-col gap-2">
                                {Object.entries(patient)
                                    .filter(([key]) => key.startsWith('Status Gigi'))
                                    .sort(([keyA], [keyB]) => {
                                        const numA = parseInt(keyA.replace('Status Gigi ', ''), 10);
                                        const numB = parseInt(keyB.replace('Status Gigi ', ''), 10);
                                        return numA - numB;
                                    })
                                    .map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center text-sm border-b pb-1">
                                            <span className="text-muted-foreground">{key}</span>
                                            <span className="font-mono font-medium">{formatToothStatusValue(value)}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
    return null;
  }

  const renderFooter = () => {
      if (loading || error || !patient) return null;

      return (
         <CardFooter className="flex flex-col items-start gap-6 border-t pt-6 mt-6 md:flex-row md:items-center md:justify-between">
            <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">Status Verifikasi</h3>
                 {patient.verifierName && patient.verifiedAt ? (
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <div>
                            <p className="font-semibold">Data Terverifikasi</p>
                            <p className="text-sm text-muted-foreground">
                                Oleh: {patient.verifierName} pada {formatDisplayValue('verifiedAt', patient.verifiedAt)}
                            </p>
                        </div>
                    </div>
                ) : (
                     <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-yellow-600">
                            <ShieldQuestion className="h-5 w-5" />
                            <div>
                                <p className="font-semibold">Data Belum Diverifikasi</p>
                                <p className="text-sm text-muted-foreground">
                                   Klik tombol di samping untuk memverifikasi keakuratan data ini.
                                </p>
                            </div>
                        </div>
                        <VerificationDialog examId={examId} patient={patient} onVerifySuccess={fetchPatient} />
                    </div>
                )}
            </div>
             <div className="flex w-full flex-shrink-0 gap-2 md:w-auto">
                <Link href="/master" passHref className="flex-1">
                   <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                   </Button>
                </Link>
                {!patient.verifiedAt && (
                  <Link href={`/master/${examId}/edit`} passHref className="flex-1">
                    <Button className="w-full">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Data
                    </Button>
                  </Link>
                )}
             </div>
         </CardFooter>
      )
  }

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
             </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderContent()}
          </CardContent>
          {renderFooter()}
        </Card>
      </div>
    </main>
  );
}
