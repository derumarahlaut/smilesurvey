
import { PatientTable } from '@/components/patient-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Patient } from '@/lib/patient-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

async function getPatients(): Promise<Patient[]> {
  const patientsCol = collection(db, 'patients');
  const q = query(patientsCol, orderBy("exam-date", "desc"));
  const patientSnapshot = await getDocs(q);
  const patientList = patientSnapshot.docs.map(doc => {
    const data = doc.data();
    let verifiedAt = data.verifiedAt;
    if (verifiedAt instanceof Timestamp) {
      verifiedAt = verifiedAt.toDate().toISOString();
    }

    return {
      // We need to map the Firestore data back to our Patient type
      examId: data['exam-id'],
      examDate: data['exam-date'],
      province: data.province,
      city: data.city,
      agency: data.agency,
      examiner: data.examiner,
      recorder: data.recorder,
      patientCategory: data['patient-category'],
      name: data.name,
      birthDate: data['birth-date'],
      gender: data.gender === '1' ? 'Laki-laki' : 'Perempuan',
      village: data.village,
      district: data.district,
      phone: data.phone,
      email: data.email,
      occupation: data.occupation,
      address: data.address,
      education: data.education,
      schoolName: data['school-name'],
      classLevel: data['class-level'],
      parentOccupation: data['parent-occupation'],
      parentEducation: data['parent-education'],
      verifierName: data.verifierName,
      verifiedAt: verifiedAt,
    } as Patient;
  });
  return patientList;
}

export default async function MasterPage() {
  const patients = await getPatients();

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-4xl">Tabel Master Pasien</CardTitle>
             <Link href="/dashboard" passHref>
               <Button variant="outline">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
               </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <PatientTable data={patients} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
