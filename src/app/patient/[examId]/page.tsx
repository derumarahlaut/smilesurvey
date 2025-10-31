'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProtectedRoute } from '@/components/protected-route';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap, 
  Briefcase,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Patient } from '@/lib/patient-data';
import { Timestamp } from 'firebase/firestore';

interface PersonalizedTip {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'prevention' | 'treatment' | 'maintenance' | 'diet';
  reason: string;
}

// Function to generate personalized tips based on patient data
function generatePersonalizedTips(patient: Patient): PersonalizedTip[] {
  const tips: PersonalizedTip[] = [];
  
  // Parse dental data if available
  const dentalData: any = patient.dentalData || {};
  const dmftScore = dentalData.dmftTotal || 0;
  const deftScore = dentalData.deftTotal || 0;
  const age = patient.age || 0;
  
  // Age-based tips
  if (age < 12) {
    tips.push({
      id: 'child-supervision',
      title: 'Supervisi Sikat Gigi Anak',
      description: 'Orang tua harus mengawasi dan membantu anak menyikat gigi hingga usia 8-10 tahun untuk memastikan teknik yang benar.',
      priority: 'high',
      category: 'prevention',
      reason: `Anak usia ${age} tahun memerlukan pengawasan dalam menjaga kebersihan gigi`
    });
    
    tips.push({
      id: 'fluoride-amount',
      title: 'Penggunaan Pasta Gigi Berfluoride',
      description: 'Gunakan pasta gigi berfluoride sebesar biji kacang polong untuk anak. Ajarkan untuk tidak menelan pasta gigi.',
      priority: 'medium',
      category: 'prevention',
      reason: 'Anak-anak rentan menelan pasta gigi yang berlebihan'
    });
  } else if (age > 50) {
    tips.push({
      id: 'senior-gum-care',
      title: 'Perawatan Gusi untuk Usia Lanjut',
      description: 'Perhatikan kesehatan gusi dengan lebih ketat. Gunakan obat kumur antiseptik dan lakukan scaling rutin setiap 3-4 bulan.',
      priority: 'high',
      category: 'maintenance',
      reason: `Pada usia ${age} tahun, risiko penyakit gusi meningkat`
    });
  }
  
  // DMF-T based tips
  if (dmftScore > 6) {
    tips.push({
      id: 'high-dmft-prevention',
      title: 'Pencegahan Kerusakan Gigi Lanjutan',
      description: 'Nilai DMF-T Anda tinggi (${dmftScore}). Perbanyak konsumsi air putih, hindari makanan manis, dan kunjungi dokter gigi setiap 3 bulan.',
      priority: 'high',
      category: 'treatment',
      reason: `DMF-T score ${dmftScore} menunjukkan risiko tinggi kerusakan gigi`
    });
    
    tips.push({
      id: 'fluoride-rinse',
      title: 'Obat Kumur Berfluoride',
      description: 'Gunakan obat kumur berfluoride setiap malam setelah menyikat gigi untuk memperkuat email gigi.',
      priority: 'medium',
      category: 'prevention',
      reason: 'Diperlukan perlindungan ekstra karena riwayat kerusakan gigi'
    });
  } else if (dmftScore === 0) {
    tips.push({
      id: 'maintain-good-health',
      title: 'Pertahankan Kesehatan Gigi Optimal',
      description: 'Gigi Anda dalam kondisi sangat baik! Pertahankan rutinitas menyikat gigi 2x sehari dan pemeriksaan rutin setiap 6 bulan.',
      priority: 'medium',
      category: 'maintenance',
      reason: 'DMF-T score 0 menunjukkan kesehatan gigi yang excellent'
    });
  }
  
  // def-t based tips (for children)
  if (deftScore > 0 && age < 12) {
    tips.push({
      id: 'primary-teeth-care',
      title: 'Perawatan Gigi Susu',
      description: `Gigi susu yang rusak (def-t: ${deftScore}) harus segera dirawat. Gigi susu penting untuk perkembangan gigi permanen.`,
      priority: 'high',
      category: 'treatment',
      reason: `def-t score ${deftScore} pada anak memerlukan perhatian khusus`
    });
  }
  
  // Gender-based tips
  if (patient.gender === 'Perempuan') {
    tips.push({
      id: 'hormonal-care',
      title: 'Perawatan Gigi saat Perubahan Hormonal',
      description: 'Wanita perlu extra perhatian pada kesehatan gigi saat menstruasi, kehamilan, atau menopause karena perubahan hormonal.',
      priority: 'medium',
      category: 'prevention',
      reason: 'Perubahan hormonal dapat mempengaruhi kesehatan gusi'
    });
  }
  
  // Occupation-based tips
  if (patient.occupation?.toLowerCase().includes('guru') || patient.occupation?.toLowerCase().includes('dosen')) {
    tips.push({
      id: 'vocal-profession',
      title: 'Perawatan Mulut untuk Profesi Vokal',
      description: 'Sebagai educator, jaga kelembaban mulut dengan minum air putih secara teratur dan hindari merokok untuk menjaga suara.',
      priority: 'medium',
      category: 'maintenance',
      reason: 'Profesi yang memerlukan banyak berbicara membutuhkan perawatan khusus'
    });
  }
  
  // General tips
  tips.push({
    id: 'regular-checkup',
    title: 'Pemeriksaan Rutin',
    description: 'Kunjungi dokter gigi setiap 6 bulan untuk pemeriksaan dan pembersihan rutin. Deteksi dini lebih baik daripada pengobatan.',
    priority: 'high',
    category: 'prevention',
    reason: 'Pencegahan selalu lebih baik daripada pengobatan'
  });
  
  tips.push({
    id: 'proper-brushing',
    title: 'Teknik Menyikat Gigi yang Benar',
    description: 'Sikat gigi dengan gerakan melingkar selama 2 menit, 2 kali sehari. Gunakan sikat gigi berbulu halus dan ganti setiap 3 bulan.',
    priority: 'high',
    category: 'prevention',
    reason: 'Teknik menyikat gigi yang benar adalah dasar kesehatan mulut'
  });
  
  return tips;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'prevention':
      return <Shield className="h-4 w-4" />;
    case 'treatment':
      return <Target className="h-4 w-4" />;
    case 'maintenance':
      return <CheckCircle className="h-4 w-4" />;
    case 'diet':
      return <Heart className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
};

export default function PatientDetailPage() {
  const params = useParams();
  const examId = params.examId as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personalizedTips, setPersonalizedTips] = useState<PersonalizedTip[]>([]);

  useEffect(() => {
    async function loadPatient() {
      if (!examId) return;
      
      try {
        setLoading(true);
        const docRef = doc(db, 'patients', examId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          let verifiedAt = data.verifiedAt;
          if (verifiedAt instanceof Timestamp) {
            verifiedAt = verifiedAt.toDate().toISOString();
          }

          const patientData: Patient = {
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
            dentalData: data.dentalData,
            age: data.age,
            dmftTotal: data.dmftTotal,
            deftTotal: data.deftTotal,
          };
          
          setPatient(patientData);
          setPersonalizedTips(generatePersonalizedTips(patientData));
        } else {
          setError('Data pasien tidak ditemukan');
        }
      } catch (err) {
        console.error('Error loading patient:', err);
        setError('Gagal memuat data pasien');
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [examId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="container mx-auto p-4 md:p-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data pasien...</p>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (error || !patient) {
    return (
      <ProtectedRoute>
        <main className="container mx-auto p-4 md:p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || 'Data pasien tidak ditemukan'}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link href="/master">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Daftar Pasien
              </Button>
            </Link>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Detail Pasien</h1>
              <p className="text-muted-foreground">Informasi lengkap dan tips kesehatan personal</p>
            </div>
            <Link href="/master">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Patient Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Pasien
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nama</label>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID Pemeriksaan</label>
                      <p className="font-mono text-sm">{patient.examId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Jenis Kelamin</label>
                      <p>{patient.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tanggal Lahir</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p>{patient.birthDate}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Pendidikan</label>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <p>{patient.education}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Pekerjaan</label>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <p>{patient.occupation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Kontak & Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Provinsi</label>
                      <p>{patient.province}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kota/Kabupaten</label>
                      <p>{patient.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kecamatan</label>
                      <p>{patient.district}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Desa/Kelurahan</label>
                      <p>{patient.village}</p>
                    </div>
                    {patient.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p>{patient.phone}</p>
                        </div>
                      </div>
                    )}
                    {patient.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p>{patient.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {patient.address && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Alamat Lengkap</label>
                      <p className="mt-1 text-sm">{patient.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dental Health Summary */}
              {(patient.dentalData || patient.dmftTotal !== undefined || patient.deftTotal !== undefined) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Ringkasan Kesehatan Gigi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {(patient.dentalData?.dmftTotal !== undefined || patient.dmftTotal !== undefined) && (
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {patient.dentalData?.dmftTotal || patient.dmftTotal || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">DMF-T Score</div>
                          {patient.dentalData?.dmftComponents && (
                            <div className="text-xs text-muted-foreground mt-1">
                              D:{patient.dentalData.dmftComponents.D} M:{patient.dentalData.dmftComponents.M} F:{patient.dentalData.dmftComponents.F}
                            </div>
                          )}
                        </div>
                      )}
                      {(patient.dentalData?.deftTotal !== undefined || patient.deftTotal !== undefined) && (
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {patient.dentalData?.deftTotal || patient.deftTotal || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">def-t Score</div>
                          {patient.dentalData?.deftComponents && (
                            <div className="text-xs text-muted-foreground mt-1">
                              d:{patient.dentalData.deftComponents.d} e:{patient.dentalData.deftComponents.e} f:{patient.dentalData.deftComponents.f}
                            </div>
                          )}
                        </div>
                      )}
                      {patient.age && (
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-primary">{patient.age}</div>
                          <div className="text-sm text-muted-foreground">Usia (tahun)</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Clinical Findings */}
                    {patient.dentalData?.clinicalChecks && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Temuan Klinis:</h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">Gusi Berdarah:</span>
                            <Badge variant={patient.dentalData.clinicalChecks.bleedingGums ? "destructive" : "secondary"}>
                              {patient.dentalData.clinicalChecks.bleedingGums ? "Ya" : "Tidak"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">Lesi Mukosa Oral:</span>
                            <Badge variant={patient.dentalData.clinicalChecks.oralLesion ? "destructive" : "secondary"}>
                              {patient.dentalData.clinicalChecks.oralLesion ? "Ya" : "Tidak"}
                            </Badge>
                          </div>
                          {patient.dentalData.clinicalChecks.treatmentNeed && (
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">Kebutuhan Perawatan:</span>
                              <Badge variant={
                                patient.dentalData.clinicalChecks.treatmentNeed === '2' ? "destructive" :
                                patient.dentalData.clinicalChecks.treatmentNeed === '1' ? "secondary" : "outline"
                              }>
                                {patient.dentalData.clinicalChecks.treatmentNeed === '2' ? "Perlu Segera" :
                                 patient.dentalData.clinicalChecks.treatmentNeed === '1' ? "Perlu, Tidak Segera" : "Tidak Perlu"}
                              </Badge>
                            </div>
                          )}
                          {patient.dentalData.clinicalChecks.referral && (
                            <div className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">Perlu Rujukan:</span>
                              <Badge variant="secondary">
                                Ya - {patient.dentalData.clinicalChecks.referralType || "Tidak Spesifik"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Personalized Tips */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Tips Kesehatan Personal
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Rekomendasi khusus berdasarkan kondisi dan profil Anda
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {personalizedTips.map((tip) => (
                    <div key={tip.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(tip.category)}
                          <h3 className="font-medium text-sm">{tip.title}</h3>
                        </div>
                        <Badge className={`text-xs ${getPriorityColor(tip.priority)}`}>
                          {tip.priority === 'high' ? 'Prioritas Tinggi' : 
                           tip.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tip.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{tip.reason}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}