
import { PatientTable } from '@/components/patient-table';
import { patients } from '@/lib/patient-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MasterPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-4xl">Tabel Master Pasien</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientTable data={patients} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
