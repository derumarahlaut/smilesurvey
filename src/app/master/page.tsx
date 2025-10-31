"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { Patient } from "../../lib/patient-data";
import { Timestamp } from "firebase/firestore";
import { AuthProvider, useAuth } from "../../contexts/auth-context";
import Link from "next/link";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
          <p className="text-gray-600">Anda harus login untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function MasterContent() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const patientsCol = collection(db, "patients");
        const q = query(patientsCol, orderBy("exam-date", "desc"));
        const patientSnapshot = await getDocs(q);
        const patientList = patientSnapshot.docs.map(doc => {
          const data = doc.data();
          let verifiedAt = data.verifiedAt;
          if (verifiedAt instanceof Timestamp) {
            verifiedAt = verifiedAt.toDate().toISOString();
          }
          return {
            examId: data["exam-id"],
            examDate: data["exam-date"],
            province: data.province,
            city: data.city,
            agency: data.agency,
            examiner: data.examiner,
            recorder: data.recorder,
            patientCategory: data["patient-category"],
            name: data.name,
            birthDate: data["birth-date"],
            gender: data.gender === "1" ? "Laki-laki" : "Perempuan",
            village: data.village,
            district: data.district,
            phone: data.phone,
            email: data.email,
            occupation: data.occupation,
            address: data.address,
            education: data.education,
            schoolName: data["school-name"],
            classLevel: data["class-level"],
            parentOccupation: data["parent-occupation"],
            parentEducation: data["parent-education"],
            verifierName: data.verifierName,
            verifiedAt: verifiedAt,
          } as Patient;
        });
        setPatients(patientList);
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4 md:p-8">
        <div className="w-full max-w-7xl">
          <div className="bg-white rounded-lg border shadow-xl p-6">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold">Tabel Master Pasien</h1>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading data pasien...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada data pasien.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">No. Urut</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Nama</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Kategori</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Kota</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.examId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{patient.examId}</td>
                        <td className="border border-gray-300 px-4 py-2">{patient.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{patient.patientCategory}</td>
                        <td className="border border-gray-300 px-4 py-2">{patient.city}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {patient.verifiedAt ? (
                            <span className="text-green-600 font-semibold">Terverifikasi</span>
                          ) : (
                            <span className="text-yellow-600">Belum Diverifikasi</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Link 
                            href={`/master/${patient.examId}`}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Lihat Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MasterPage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MasterContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}