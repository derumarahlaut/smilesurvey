"use client";

import { useState, useEffect } from 'react';
import { PatientTable } from '@/components/patient-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Patient } from '@/lib/patient-data';
import { Timestamp } from 'firebase/firestore';
import { ProtectedRoute } from '@/components/protected-route';

export default function MasterPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
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
            // Map Firestore data to Patient type
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
        setPatients(patientList);
      } catch (error) {
        console.error('Error loading patients:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-7xl space-y-8">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-4xl">Tabel Master Pasien</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">Loading data pasien...</div>
                  </div>
                ) : (
                  <PatientTable data={patients} />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}