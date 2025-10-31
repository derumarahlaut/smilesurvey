'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { ProtectedRoute } from '../../../components/protected-route'

interface Patient {
  id?: string
  patient_id: string
  name: string
  age: number
  category: string
  date: string
  location: string
  answers: Record<string, string>
  verification_status?: string
  verification_date?: string
  verified_by?: string
}

interface Tip {
  id: string
  title: string
  description: string
  category: 'urgent' | 'moderate' | 'maintenance'
  icon: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const examId = params.examId as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const docRef = doc(db, 'patients', examId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Patient
          setPatient(data)
          generateTips(data)
        }
      } catch (error) {
        console.error('Error fetching patient:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [examId])

  const generateTips = (patientData: Patient) => {
    const generatedTips: Tip[] = []

    // Analisis berdasarkan jawaban
    const answers = patientData.answers || {}
    
    // Tip berdasarkan sakit gigi
    if (answers.tooth_pain === 'ya') {
      generatedTips.push({
        id: 'pain-relief',
        title: 'Atasi Sakit Gigi',
        description: 'Berkumur dengan air garam hangat dan hindari makanan terlalu panas/dingin. Segera konsultasi ke dokter gigi.',
        category: 'urgent',
        icon: '🦷'
      })
    }

    // Tip berdasarkan gusi berdarah
    if (answers.bleeding_gums === 'ya') {
      generatedTips.push({
        id: 'gum-care',
        title: 'Perawatan Gusi',
        description: 'Sikat gigi dengan lembut menggunakan sikat berbulu halus. Gunakan obat kumur antiseptik.',
        category: 'moderate',
        icon: '🩸'
      })
    }

    // Tip berdasarkan frekuensi sikat gigi
    if (answers.brushing_frequency === 'kurang_dari_2x') {
      generatedTips.push({
        id: 'brushing-habit',
        title: 'Rutinitas Sikat Gigi',
        description: 'Sikatlah gigi minimal 2 kali sehari, pagi setelah sarapan dan malam sebelum tidur.',
        category: 'maintenance',
        icon: '🪥'
      })
    }

    // Tip berdasarkan konsumsi gula
    if (answers.sugar_intake === 'sering' || answers.sugar_intake === 'sangat_sering') {
      generatedTips.push({
        id: 'sugar-control',
        title: 'Kurangi Konsumsi Gula',
        description: 'Batasi makanan dan minuman manis. Minum air putih setelah mengonsumsi makanan manis.',
        category: 'moderate',
        icon: '🍭'
      })
    }

    // Tip berdasarkan kunjungan dokter gigi
    if (answers.dental_visit === 'tidak_pernah' || answers.dental_visit === 'lebih_dari_1_tahun') {
      generatedTips.push({
        id: 'dental-checkup',
        title: 'Kontrol Rutin ke Dokter Gigi',
        description: 'Lakukan pemeriksaan gigi setiap 6 bulan untuk deteksi dini masalah gigi dan mulut.',
        category: 'maintenance',
        icon: '👨‍⚕️'
      })
    }

    // Tip umum berdasarkan kategori
    if (patientData.category === 'Siswa SD') {
      generatedTips.push({
        id: 'kids-dental',
        title: 'Tips untuk Anak Sekolah',
        description: 'Bawa bekal sehat, hindari jajan manis berlebihan, dan selalu sikat gigi sebelum berangkat sekolah.',
        category: 'maintenance',
        icon: '🎒'
      })
    }

    setTips(generatedTips)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'maintenance':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'urgent':
        return 'Mendesak'
      case 'moderate':
        return 'Perlu Perhatian'
      case 'maintenance':
        return 'Pencegahan'
      default:
        return 'Umum'
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data pasien...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!patient) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">😟</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
              <p className="text-gray-600 mb-6">Data pasien dengan ID {examId} tidak ditemukan.</p>
              <Link 
                href="/master"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kembali ke Daftar Pasien
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/master"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Kembali ke Daftar Pasien
            </Link>
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Dashboard Kesehatan Gigi
                  </h1>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Nama:</span> {patient.name}</p>
                    <p><span className="font-medium">Umur:</span> {patient.age} tahun</p>
                    <p><span className="font-medium">Kategori:</span> {patient.category}</p>
                    <p><span className="font-medium">Lokasi:</span> {patient.location}</p>
                    <p><span className="font-medium">Tanggal Pemeriksaan:</span> {patient.date}</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    patient.verification_status === 'verified'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {patient.verification_status === 'verified' ? '✅ Terverifikasi' : '⏳ Menunggu Verifikasi'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">💡</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Tips Kesehatan Gigi Personal
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Berdasarkan hasil survei kesehatan gigi Anda
                  </p>
                </div>
              </div>

              {tips.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {tips.map((tip) => (
                    <div
                      key={tip.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {tip.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800">
                              {tip.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(tip.category)}`}>
                              {getCategoryLabel(tip.category)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {tip.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">🦷</div>
                  <p>Tidak ada tips khusus saat ini.</p>
                  <p className="text-sm">Lanjutkan rutinitas perawatan gigi yang baik!</p>
                </div>
              )}
            </div>
          </div>

          {/* General Tips */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Tips Umum Kesehatan Gigi
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">🪥</span>
                <div>
                  <h4 className="font-medium text-gray-800">Sikat Gigi Teratur</h4>
                  <p className="text-sm text-gray-600">2 kali sehari dengan pasta gigi berfluoride</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">🧵</span>
                <div>
                  <h4 className="font-medium text-gray-800">Gunakan Benang Gigi</h4>
                  <p className="text-sm text-gray-600">Bersihkan sela-sela gigi setiap hari</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-xl">🥗</span>
                <div>
                  <h4 className="font-medium text-gray-800">Makan Makanan Sehat</h4>
                  <p className="text-sm text-gray-600">Perbanyak buah dan sayur, kurangi gula</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">👨‍⚕️</span>
                <div>
                  <h4 className="font-medium text-gray-800">Periksa Rutin</h4>
                  <p className="text-sm text-gray-600">Kontrol ke dokter gigi setiap 6 bulan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/master"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium text-center transition-colors"
            >
              Kembali ke Daftar Pasien
            </Link>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cetak Laporan
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}