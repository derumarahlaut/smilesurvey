

'use client';

import { getPatient, verifyPatient } from '../../actions';
import { AlertTriangle, ArrowLeft, Pencil, CheckCircle, ShieldQuestion } from 'lucide-react';
import Link from 'next/link';
import { allQuestions } from '../../../lib/survey-data';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

// Simple UI components to replace the UI library
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-3">
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 mt-2">
    {children}
  </p>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-3 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-3 ${className}`}>
    {children}
  </div>
);

const Alert = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "destructive" }) => (
  <div className={`relative w-full rounded-lg border p-4 ${variant === "destructive" ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
    {children}
  </div>
);

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="mb-1 font-medium leading-none tracking-tight">
    {children}
  </h5>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm text-gray-600">
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary", 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-white hover:bg-gray-50"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Separator = ({ className = "" }: { className?: string }) => (
  <hr className={`border-gray-200 ${className}`} />
);

// Simple Odontogram Display component
const OdontogramDisplay = ({ patientData }: { patientData: any }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-center">
    <p className="text-gray-600">Odontogram visualization akan ditampilkan di sini</p>
  </div>
);

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
    const [showDialog, setShowDialog] = useState(false);

    const handleVerify = async () => {
        if (!verifierName.trim()) {
            alert('Mohon isi nama Anda untuk melanjutkan verifikasi.');
            return;
        }
        setIsVerifying(true);
        const result = await verifyPatient(examId, verifierName, patient);
        setIsVerifying(false);

        if (result.error) {
            alert(`Gagal Memverifikasi: ${result.error}`);
        } else {
            alert(`Verifikasi Berhasil: Data pasien ${examId} telah diverifikasi oleh ${verifierName}.`);
            setShowDialog(false);
            onVerifySuccess();
        }
    };

    if (!showDialog) {
        return (
            <Button variant="secondary" onClick={() => setShowDialog(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verifikasi Data
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-2">Konfirmasi Verifikasi Data</h3>
                <p className="text-gray-600 mb-4">
                    Dengan ini Anda menyatakan bahwa data yang diinput untuk pasien {examId} sudah benar dan valid.
                </p>
                <div className="space-y-2 mb-4">
                    <label htmlFor="verifierName" className="block text-sm font-medium text-gray-700">
                        Nama Verifikator
                    </label>
                    <input
                        id="verifierName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={verifierName}
                        onChange={(e) => setVerifierName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda..."
                    />
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleVerify} disabled={isVerifying}>
                        {isVerifying ? 'Memverifikasi...' : 'Ya, Verifikasi'}
                    </Button>
                </div>
            </div>
        </div>
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
        
        const permanentTeethIds = [
            ...[18, 17, 16, 15, 14, 13, 12, 11], ...[21, 22, 23, 24, 25, 26, 27, 28],
            ...[41, 42, 43, 44, 45, 46, 47, 48], ...[38, 37, 36, 35, 34, 33, 32, 31]
        ];
        const primaryTeethIds = [
            ...[55, 54, 53, 52, 51], ...[61, 62, 63, 64, 65],
            ...[71, 72, 73, 74, 75], ...[81, 82, 83, 84, 85]
        ];
        
        const allToothEntries = Object.entries(patient)
            .filter(([key]) => key.startsWith('Status Gigi '))
            .map(([key, value]) => {
                const toothNumber = parseInt(key.replace('Status Gigi ', ''), 10);
                return { key, value, toothNumber };
            })
            .sort((a, b) => a.toothNumber - b.toothNumber);

        const permanentTeethEntries = allToothEntries.filter(e => permanentTeethIds.includes(e.toothNumber));
        const primaryTeethEntries = allToothEntries.filter(e => primaryTeethIds.includes(e.toothNumber));

        const ToothStatusList = ({ title, entries }: { title: string, entries: { key: string, value: any, toothNumber: number }[] }) => {
            if (entries.length === 0) return null;
            return (
                <div>
                    <h5 className="mb-2 font-medium text-muted-foreground">{title}</h5>
                    <div className="flex flex-col gap-2">
                        {entries.map(({ key, value }) => (
                            <div key={key} className="flex justify-between items-center text-sm border-b pb-1">
                                <span className="text-muted-foreground">{key}</span>
                                <span className="font-mono font-medium">{formatToothStatusValue(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        };
        
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
                            <h4 className="mb-4 text-lg font-semibold">Status Gigi Geligi</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                               <ToothStatusList title="Gigi Tetap" entries={permanentTeethEntries} />
                               <ToothStatusList title="Gigi Susu" entries={primaryTeethEntries} />
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
