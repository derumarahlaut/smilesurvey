
import { getPatient } from '@/app/actions';
import { EditSurveyForm } from '@/components/edit-survey-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


export default async function EditPatientPage({ params }: { params: { examId: string } }) {
  const { examId } = params;
  const { patient, error } = await getPatient(examId);

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="font-headline text-4xl">Edit Data Pasien</CardTitle>
                    <CardDescription>Perbarui informasi untuk pasien dengan nomor urut: {examId}</CardDescription>
                </div>
                 <Link href="/master" passHref>
                   <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali ke Tabel Master
                   </Button>
                </Link>
             </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Gagal Memuat Data</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : patient ? (
              <EditSurveyForm patientData={patient} examId={examId} />
            ) : (
               <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Memuat Data...</AlertTitle>
                <AlertDescription>Sedang mengambil data pasien, mohon tunggu.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
