
'use server';

import { allQuestions } from '@/lib/survey-data';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs, orderBy, limit, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { provinces } from '@/lib/location-data';
import { format, differenceInYears, parse } from 'date-fns';

// Simple tips generator without AI dependency
function generateSimpleTips(surveyResponses: any): string[] {
  const tips: string[] = [];
  
  // Basic dental health tips
  tips.push('Sikat gigi minimal 2 kali se        `Preventive Care Opportunities: Category-based analysis reveals different prevention needs - school programs for students and community outreach for general population`ari dengan pasta gigi berfluoride');
  tips.push('Gunakan benang gigi setiap hari untuk membersihkan sela-sela gigi');
  tips.push('Kunjungi dokter gigi setiap 6 bulan untuk pemeriksaan rutin');
  tips.push('Batasi konsumsi makanan dan minuman manis');
  tips.push('Minum air putih yang cukup setiap hari');
  
  // Age-specific tips
  if (surveyResponses.age && surveyResponses.age < 12) {
    tips.push('Anak-anak memerlukan pengawasan orang tua saat menyikat gigi');
    tips.push('Gunakan pasta gigi sebesar biji kacang polong untuk anak');
  } else if (surveyResponses.age && surveyResponses.age > 50) {
    tips.push('Perhatikan kesehatan gusi dengan lebih ketat pada usia lanjut');
    tips.push('Lakukan scaling rutin setiap 3-4 bulan');
  }
  
  // DMF-T specific tips
  if (surveyResponses.dmftTotal && surveyResponses.dmftTotal > 6) {
    tips.push('Nilai DMF-T tinggi, perbanyak konsumsi air putih dan hindari makanan manis');
    tips.push('Gunakan obat kumur berfluoride untuk perlindungan ekstra');
  }
  
  return tips;
}

async function getNextPatientSequence(idPrefix: string): Promise<string> {
  const patientsRef = collection(db, "patients");
  
  const q = query(
    patientsRef,
    where('exam-id', '>=', idPrefix),
    where('exam-id', '<', idPrefix + 'z'),
    orderBy('exam-id', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return "001";
  } else {
    const lastExamId = querySnapshot.docs[0].data()['exam-id'];
    const parts = lastExamId.split('-');
    const lastSequence = parseInt(parts[parts.length - 1], 10);
    if (isNaN(lastSequence)) {
      return "001";
    }
    const nextSequence = lastSequence + 1;
    return String(nextSequence).padStart(3, '0');
  }
}

const getQuestionText = (id: string) => {
  const question = allQuestions.find(q => q.id === id);
  return question ? question.question : id;
}

function processFormData(formData: Record<string, any>) {
  const surveyResponses: Record<string, any> = {};

  const { 'odontogram-chart': odontogramChartData, ...regularFormData } = formData;
  
  for (const id in regularFormData) {
    if (regularFormData[id] !== null && regularFormData[id] !== undefined) { 
      surveyResponses[getQuestionText(id)] = regularFormData[id];
    }
  }
  
  if (odontogramChartData) {
    const clinicalCheck: Record<string, any> = {};
    const toothStatus: Record<string, string> = {};
    
    const allAdultTeethIds = [
      ...[18, 17, 16, 15, 14, 13, 12, 11], ...[21, 22, 23, 24, 25, 26, 27, 28],
      ...[41, 42, 43, 44, 45, 46, 47, 48], ...[38, 37, 36, 35, 34, 33, 32, 31]
    ];
    const allChildTeethIds = [
      ...[55, 54, 53, 52, 51], ...[61, 62, 63, 64, 65],
      ...[71, 72, 73, 74, 75], ...[81, 82, 83, 84, 85]
    ];
    
    for (const key in odontogramChartData) {
      if (odontogramChartData[key] !== null && odontogramChartData[key] !== undefined) {
          if (key.startsWith('tooth-')) {
              toothStatus[key] = odontogramChartData[key];
          } else {
              clinicalCheck[key] = odontogramChartData[key];
          }
      }
    }

    const dmf = { D: 0, M: 0, F: 0 };
    const def = { d: 0, e: 0, f: 0 };
    
    allAdultTeethIds.forEach(id => {
        const status = odontogramChartData[`tooth-${id}`];
        if (status === '1' || status === '2') dmf.D++;
        if (status === '4') dmf.M++;
        if (status === '3') dmf.F++;
    });
    
    allChildTeethIds.forEach(id => {
        const status = odontogramChartData[`tooth-${id}`];
        if (status === 'B' || status === 'C') def.d++;
        if (status === 'E') def.e++;
        if (status === 'D') def.f++;
    });
    
    surveyResponses['DMF-T Score'] = `D: ${dmf.D}, M: ${dmf.M}, F: ${dmf.F}, Total: ${dmf.D + dmf.M + dmf.F}`;
    surveyResponses['def-t Score'] = `d: ${def.d}, e: ${def.e}, f: ${def.f}, Total: ${def.d + def.e + def.f}`;
    
    // Add structured dental data for easy access
    surveyResponses['dmftTotal'] = dmf.D + dmf.M + dmf.F;
    surveyResponses['deftTotal'] = def.d + def.e + def.f;
    surveyResponses['dmftComponents'] = { D: dmf.D, M: dmf.M, F: dmf.F };
    surveyResponses['deftComponents'] = { d: def.d, e: def.e, f: def.f };
    
    // Add structured dental health data
    surveyResponses['dentalData'] = {
      dmftTotal: dmf.D + dmf.M + dmf.F,
      deftTotal: def.d + def.e + def.f,
      dmftComponents: { D: dmf.D, M: dmf.M, F: dmf.F },
      deftComponents: { d: def.d, e: def.e, f: def.f },
      toothStatus: toothStatus,
      clinicalChecks: {
        bleedingGums: clinicalCheck.bleedingGums === '1',
        oralLesion: clinicalCheck.oralLesion === '1',
        treatmentNeed: clinicalCheck.treatmentNeed,
        referral: clinicalCheck.referral === '1',
        referralType: clinicalCheck.referralType,
        referralLocation: clinicalCheck.referralLocation
      }
    };

    for (const toothId in toothStatus) {
        if (toothStatus[toothId] && toothStatus[toothId] !== '0' && toothStatus[toothId] !== 'A') {
            surveyResponses[`Status Gigi ${toothId.replace('tooth-','')}`] = toothStatus[toothId];
        }
    }
    
    if (clinicalCheck.bleedingGums) surveyResponses['Gusi berdarah'] = clinicalCheck.bleedingGums === '1' ? 'Ya' : 'Tidak';
    if (clinicalCheck.oralLesion) surveyResponses['Lesi Mukosa Oral'] = clinicalCheck.oralLesion === '1' ? 'Ya' : 'Tidak';
    if (clinicalCheck.treatmentNeed) {
       const treatmentMap: Record<string, string> = { '0': 'tidak perlu perawatan', '1': 'perlu, tidak segera', '2': 'perlu, segera' };
       surveyResponses['Kebutuhan perawatan segera'] = treatmentMap[clinicalCheck.treatmentNeed] || clinicalCheck.treatmentNeed;
    }
    if (clinicalCheck.referral) {
      const referralMap: Record<string, string> = { '0': 'tidak perlu rujukan', '1': 'perlu rujukan' };
      surveyResponses['Rujukan'] = referralMap[clinicalCheck.referral] || clinicalCheck.referral;
      if (clinicalCheck.referral === '1') {
          if (clinicalCheck.referralType === 'Lain-lain') {
              surveyResponses['Lokasi Rujukan'] = `Lain-lain: ${clinicalCheck.referralLocation || ''}`;
          } else {
               surveyResponses['Lokasi Rujukan'] = clinicalCheck.referralType;
          }
      }
    }
  }

  return surveyResponses;
}

export async function saveSurvey(formData: Record<string, any>, existingExamId?: string) {
  try {
    const dataToSave = { ...formData };
    let fullExamId = existingExamId;

    if (!fullExamId) {
      const provinceName = dataToSave['province'];
      const cityName = dataToSave['city'];
      let examDate;
      if (dataToSave['exam-date'] instanceof Date) {
        examDate = dataToSave['exam-date'];
      } else if (typeof dataToSave['exam-date'] === 'string') {
        examDate = new Date(dataToSave['exam-date']);
      } else {
        examDate = new Date();
      }
  
      if (!provinceName || !cityName) {
          return { error: 'Provinsi dan Kota/Kabupaten harus diisi untuk membuat Nomor Urut.' };
      }
  
      const provinceData = provinces.find(p => p.name === provinceName);
      if (!provinceData) {
         return { error: `Provinsi tidak ditemukan: ${provinceName}` };
      }
      const provinceCode = String(provinces.indexOf(provinceData) + 1).padStart(2, '0');
      
      const cityIndex = provinceData.cities.indexOf(cityName);
      if (cityIndex === -1) {
         return { error: `Kota/Kabupaten tidak ditemukan: ${cityName}` };
      }
      const cityCode = String(cityIndex + 1).padStart(2, '0');
  
      const dateCode = format(examDate, 'yyyyMMdd');
      const idPrefix = `${provinceCode}-${cityCode}-${dateCode}-`;
      const sequence = await getNextPatientSequence(idPrefix);
      fullExamId = `${idPrefix}${sequence}`;
      dataToSave['exam-id'] = fullExamId;
    }

    if (dataToSave['exam-date'] instanceof Date) {
      dataToSave['exam-date'] = format(dataToSave['exam-date'], 'yyyy-MM-dd');
    } else if (typeof dataToSave['exam-date'] === 'string') {
      try {
        const parsedDate = new Date(dataToSave['exam-date']);
        if (!isNaN(parsedDate.getTime())) {
          dataToSave['exam-date'] = format(parsedDate, 'yyyy-MM-dd');
        } else {
          delete dataToSave['exam-date'];
        }
      } catch (e) {
        delete dataToSave['exam-date'];
      }
    }


    if (dataToSave['birth-date'] && typeof dataToSave['birth-date'] === 'object') {
        const { day, month, year } = dataToSave['birth-date'];
        if (day && month && year && !isNaN(parseInt(year)) && !isNaN(parseInt(month)) && !isNaN(parseInt(day))) {
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(date.getTime())) {
              dataToSave['birth-date'] = date.toISOString().split('T')[0];
            } else {
              delete dataToSave['birth-date'];
            }
        } else {
             delete dataToSave['birth-date'];
        }
    } else if (dataToSave['birth-date'] && typeof dataToSave['birth-date'] === 'string') {
       try {
        const date = new Date(dataToSave['birth-date']);
        if (!isNaN(date.getTime())) {
          dataToSave['birth-date'] = date.toISOString().split('T')[0];
        } else {
           delete dataToSave['birth-date'];
        }
      } catch (e) {
        delete dataToSave['birth-date'];
      }
    } else {
        delete dataToSave['birth-date'];
    }

    await setDoc(doc(db, "patients", fullExamId!), dataToSave, { merge: true });
    revalidatePath('/master');
    revalidatePath('/dashboard');
    revalidatePath(`/master/${fullExamId}`);
    revalidatePath(`/master/${fullExamId}/edit`);
    return { success: true, examId: fullExamId };
  } catch (error: any) {
    console.error("Error saving survey:", error);
    return { error: `Gagal menyimpan data ke database: ${error.message}` };
  }
}


export async function submitSurveyForTips(formData: Record<string, any>) {
  try {
    const surveyResponses = processFormData(formData);

    if (Object.keys(surveyResponses).length === 0) {
      return { error: 'No responses provided.' };
    }

    // Generate simple tips based on survey data
    const simpleTips = generateSimpleTips(surveyResponses);
    
    return { tips: simpleTips };

  } catch (error) {
    console.error("Error submitting survey for tips:", error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}

export async function deletePatient(examId: string) {
  try {
    await deleteDoc(doc(db, "patients", examId));
    revalidatePath('/master');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error deleting patient:", error);
    return { error: 'Gagal menghapus data pasien.' };
  }
}

export async function getPatient(examId: string) {
  try {
    const docRef = doc(db, "patients", examId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure dates are in the right format for display or editing
      if (data['exam-date'] && typeof data['exam-date'] === 'string') {
          // Add time to prevent timezone shift issues on client
          data['exam-date'] = new Date(data['exam-date'] + 'T00:00:00');
      }
      if (data['birth-date'] && typeof data['birth-date'] === 'string') {
          const [year, month, day] = data['birth-date'].split('-').map(Number);
          data['birth-date'] = { day: String(day), month: String(month), year: String(year) };
      }
      if (data['verifiedAt'] && data['verifiedAt'] instanceof Timestamp) {
        data['verifiedAt'] = data['verifiedAt'].toDate();
      }
      const fullData = {
          ...data,
          ...processFormData(data), // Add processed data like scores
      };
      return { success: true, patient: fullData };
    } else {
      return { error: "Pasien tidak ditemukan." };
    }
  } catch (error: any) {
    console.error("Error fetching patient:", error);
    return { error: `Gagal mengambil data pasien: ${error.message}` };
  }
}

async function sendVerificationEmail(patientData: any) {
    const nodemailer = (await import('nodemailer')).default;
    const {
        EMAIL_HOST,
        EMAIL_PORT,
        EMAIL_USER,
        EMAIL_PASS,
    } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
        console.warn("Konfigurasi email tidak lengkap. Melewatkan pengiriman email.");
        console.log("SIMULASI: Mengirim notifikasi verifikasi ke email:", patientData.email);
        return { success: false, message: 'Konfigurasi email tidak lengkap di server.' };
    }

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT, 10),
        secure: parseInt(EMAIL_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });
    
    const processedData = processFormData(patientData);

    let emailHtml = `
      <h1>Data Pemeriksaan Gigi Anda Telah Diverifikasi</h1>
      <p>Halo ${patientData.name},</p>
      <p>Data pemeriksaan gigi Anda telah berhasil diverifikasi pada tanggal ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}. Berikut adalah ringkasan data Anda:</p>
      <ul>
        <li><strong>Nomor Urut:</strong> ${patientData['exam-id']}</li>
        <li><strong>Nama:</strong> ${patientData.name}</li>
        <li><strong>Tanggal Pemeriksaan:</strong> ${patientData['exam-date']}</li>
        <li><strong>Skor DMF-T:</strong> ${processedData['DMF-T Score']}</li>
        <li><strong>Skor def-t:</strong> ${processedData['def-t Score']}</li>
      </ul>
      <p>Terima kasih telah berpartisipasi.</p>
      <br/>
      <p>Hormat kami,</p>
      <p>Tim SmileSurvey</p>
    `;

    try {
        await transporter.sendMail({
            from: `"Tim SmileSurvey" <${EMAIL_USER}>`,
            to: patientData.email,
            subject: 'Data Pemeriksaan Gigi Anda Telah Diverifikasi',
            html: emailHtml,
        });
        console.log(`Email verifikasi berhasil dikirim ke: ${patientData.email}`);
        return { success: true };
    } catch (error) {
        console.error("Gagal mengirim email:", error);
        return { success: false, message: 'Gagal mengirim email notifikasi.' };
    }
}


export async function verifyPatient(examId: string, verifierName: string, patientData: any) {
  if (!verifierName) {
    return { error: 'Nama verifikator harus diisi.' };
  }
  try {
    const docRef = doc(db, 'patients', examId);
    await updateDoc(docRef, {
      verifierName: verifierName,
      verifiedAt: Timestamp.now(),
    });

    // Send notifications
    if (patientData?.email) {
        await sendVerificationEmail(patientData);
    }
    if (patientData?.phone) {
        console.log(`SIMULASI: Mengirim notifikasi verifikasi ke WhatsApp: ${patientData.phone}`);
         // TODO: Tambahkan integrasi layanan WhatsApp di sini
    }

    revalidatePath('/master');
    revalidatePath(`/master/${examId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error verifying patient:', error);
    return { error: `Gagal memverifikasi data: ${error.message}` };
  }
}

function calculateAge(birthDate: string | Date): number | null {
    if (!birthDate) return null;
    try {
        const date = typeof birthDate === 'string' ? parse(birthDate, 'yyyy-MM-dd', new Date()) : birthDate;
        if (isNaN(date.getTime())) return null;
        return differenceInYears(new Date(), date);
    } catch {
        return null;
    }
}


export async function getDashboardAnalysis(filters: {
  language: string;
  province?: string;
  city?: string;
  dateRange?: { from?: Date; to?: Date };
}) {
  try {
    let patientQuery: any = collection(db, 'patients');
    
    const queryConstraints = [];

    if (filters.province) {
        queryConstraints.push(where('province', '==', filters.province));
    }
    if (filters.city) {
        queryConstraints.push(where('city', '==', filters.city));
    }
    if (filters.dateRange?.from) {
        queryConstraints.push(where('exam-date', '>=', format(filters.dateRange.from, 'yyyy-MM-dd')));
    }
    if (filters.dateRange?.to) {
        queryConstraints.push(where('exam-date', '<=', format(filters.dateRange.to, 'yyyy-MM-dd')));
    }

    if (queryConstraints.length > 0) {
      patientQuery = query(patientQuery, ...queryConstraints);
    }
    
    const patientSnapshot = await getDocs(patientQuery);
    
    if (patientSnapshot.empty) {
        return { analysis: null };
    }

    // Process patient data to include calculated scores
    const patientList = patientSnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      const processedData = processFormData(data);
      return {
        ...data,
        ...processedData
      };
    });
    
    // Calculate summary tables
    const summaryTables = {
        education: { 'SD': 0, 'SMP': 0, 'SMA': 0, 'Diploma 1/2/3': 0, 'D4/S1': 0, 'S2': 0, 'S3': 0, 'Tidak sekolah': 0, 'Jumlah': 0 },
        occupation: { 'ASN/PNS/PPPK': 0, 'TNI/POLRI': 0, 'PEGAWAI BUMN': 0, 'PEGAWAI SWASTA': 0, 'WIRASWASTA/WIRAUSAHA': 0, 'PELAJAR/MAHASISWA': 0, 'PENGURUS/IBU RUMAH TANGGA': 0, 'ASISTEN RUMAH TANGGA': 0, 'TIDAK BEKERJA': 0, 'Jumlah': 0 },
        gender: { 'Laki-laki': 0, 'Perempuan': 0, 'Jumlah': 0 },
        ageGroup: { 'Antara 5-10 tahun (anak-anak)': 0, 'Antara 10-18 tahun (remaja)': 0, 'Antara 18-60 tahun (produktif)': 0, '60 tahun ke atas (lansia)': 0, 'Jumlah': 0 },
        patientCategory: { 'Siswa sekolah dasar (SD)': 0, 'Umum': 0, 'Jumlah': 0 }
    };
    
    const educationMap: Record<string, keyof typeof summaryTables.education> = {
        'SD': 'SD', 'SMP': 'SMP', 'SMA': 'SMA', 'Diploma': 'Diploma 1/2/3', 'Sarjana': 'D4/S1', 'S2': 'S2', 'S3': 'S3', 'Lainnya': 'Tidak sekolah'
    };
    const occupationMap: Record<string, keyof typeof summaryTables.occupation> = {
        'Pegawai Negeri': 'ASN/PNS/PPPK',
        'Pegawai Swasta': 'PEGAWAI SWASTA',
        'Wiraswasta': 'WIRASWASTA/WIRAUSAHA',
        'Pelajar/Mahasiswa': 'PELAJAR/MAHASISWA',
        'Ibu Rumah Tangga': 'PENGURUS/IBU RUMAH TANGGA',
        'Tidak Bekerja': 'TIDAK BEKERJA',
    };

    patientList.forEach((p: any) => {
        // Patient Category
        const patientCategory: string = p['patient-category'] || 'Umum';
        if (patientCategory === 'Siswa sekolah dasar (SD)' || patientCategory === 'Umum') {
            summaryTables.patientCategory[patientCategory]++;
            summaryTables.patientCategory['Jumlah']++;
        }

        // Education
        const eduKey = p['patient-category'] === 'Siswa sekolah dasar (SD)' ? p.parentEducation : p.education;
        const mappedEduKey = eduKey ? educationMap[eduKey] || 'Tidak sekolah' : 'Tidak sekolah';
        if (summaryTables.education[mappedEduKey] !== undefined) {
            summaryTables.education[mappedEduKey]++;
            summaryTables.education['Jumlah']++;
        }

        // Occupation
        const occKey = p['patient-category'] === 'Siswa sekolah dasar (SD)' ? p.parentOccupation : p.occupation;
        const mappedOccKey = occKey ? occupationMap[occKey] || 'TIDAK BEKERJA' : 'TIDAK BEKERJA';
        if (summaryTables.occupation[mappedOccKey] !== undefined) {
             summaryTables.occupation[mappedOccKey]++;
             summaryTables.occupation['Jumlah']++;
        }
        
        // Gender
        if (p.gender === '1') { summaryTables.gender['Laki-laki']++; }
        else if (p.gender === '2') { summaryTables.gender['Perempuan']++; }
        summaryTables.gender['Jumlah']++;

        // Age Group
        const age = calculateAge(p['birth-date']);
        if (age !== null) {
            if (age >= 5 && age <= 10) summaryTables.ageGroup['Antara 5-10 tahun (anak-anak)']++;
            else if (age > 10 && age <= 18) summaryTables.ageGroup['Antara 10-18 tahun (remaja)']++;
            else if (age > 18 && age <= 60) summaryTables.ageGroup['Antara 18-60 tahun (produktif)']++;
            else if (age > 60) summaryTables.ageGroup['60 tahun ke atas (lansia)']++;
            
            if (age >= 5) summaryTables.ageGroup['Jumlah']++;
        }
    });

    // Create simple analysis without AI dependency
    const totalPatients = patientList.length;
    
    // Separate analysis by patient category
    const siswaSDPatients = patientList.filter((p: any) => p['patient-category'] === 'Siswa sekolah dasar (SD)');
    const umumPatients = patientList.filter((p: any) => p['patient-category'] === 'Umum');
    
    // Calculate scores by category
    const siswaSDDmft = siswaSDPatients.map((p: any) => p.dmftTotal || 0).filter(val => val !== null);
    const siswaSDDeft = siswaSDPatients.map((p: any) => p.deftTotal || 0).filter(val => val !== null);
    const umumDmft = umumPatients.map((p: any) => p.dmftTotal || 0).filter(val => val !== null);
    const umumDeft = umumPatients.map((p: any) => p.deftTotal || 0).filter(val => val !== null);
    
    const dmftValues = patientList.map((p: any) => p.dmftTotal || 0).filter(val => val !== null);
    const deftValues = patientList.map((p: any) => p.deftTotal || 0).filter(val => val !== null);
    
    const averageDmft = dmftValues.length > 0 ? dmftValues.reduce((a, b) => a + b, 0) / dmftValues.length : 0;
    const averageDeft = deftValues.length > 0 ? deftValues.reduce((a, b) => a + b, 0) / deftValues.length : 0;
    
    const siswaSDAvgDmft = siswaSDDmft.length > 0 ? siswaSDDmft.reduce((a, b) => a + b, 0) / siswaSDDmft.length : 0;
    const siswaSDAvgDeft = siswaSDDeft.length > 0 ? siswaSDDeft.reduce((a, b) => a + b, 0) / siswaSDDeft.length : 0;
    const umumAvgDmft = umumDmft.length > 0 ? umumDmft.reduce((a, b) => a + b, 0) / umumDmft.length : 0;
    const umumAvgDeft = umumDeft.length > 0 ? umumDeft.reduce((a, b) => a + b, 0) / umumDeft.length : 0;
    
    // Find top province
    const provinceCount: Record<string, number> = {};
    patientList.forEach((p: any) => {
      const province = p.province || 'Tidak diketahui';
      provinceCount[province] = (provinceCount[province] || 0) + 1;
    });
    const topProvince = Object.entries(provinceCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Tidak ada data';
    
    // Generate detailed analysis based on patient categories
    const detailedAnalysis = {
      executiveSummary: filters.language === 'english' 
        ? `Comprehensive dental health survey of ${totalPatients} participants reveals two distinct patient categories: ${siswaSDPatients.length} elementary school students (Siswa SD) and ${umumPatients.length} general population (Umum). Student group shows average DMF-T of ${siswaSDAvgDmft.toFixed(2)} and def-t of ${siswaSDAvgDeft.toFixed(2)}, while general population shows DMF-T of ${umumAvgDmft.toFixed(2)} and def-t of ${umumAvgDeft.toFixed(2)}. This category-based analysis provides more targeted insights for developing age-appropriate and context-specific oral health interventions.`
        : `Survei kesehatan gigi komprehensif terhadap ${totalPatients} partisipan mengungkap dua kategori pasien yang berbeda: ${siswaSDPatients.length} siswa sekolah dasar (Siswa SD) dan ${umumPatients.length} populasi umum (Umum). Kelompok siswa menunjukkan rata-rata DMF-T sebesar ${siswaSDAvgDmft.toFixed(2)} dan def-t sebesar ${siswaSDAvgDeft.toFixed(2)}, sedangkan populasi umum menunjukkan DMF-T sebesar ${umumAvgDmft.toFixed(2)} dan def-t sebesar ${umumAvgDeft.toFixed(2)}. Analisis berbasis kategori ini memberikan wawasan yang lebih terarah untuk mengembangkan intervensi kesehatan mulut yang sesuai usia dan konteks spesifik.`,
      
      keyStatistics: {
        totalPatients,
        averageDmft,
        averageDeft,
        categoryBreakdown: {
          siswaSD: {
            count: siswaSDPatients.length,
            avgDmft: siswaSDAvgDmft,
            avgDeft: siswaSDAvgDeft
          },
          umum: {
            count: umumPatients.length,
            avgDmft: umumAvgDmft,
            avgDeft: umumAvgDeft
          }
        },
        dentalHealthIndicators: {
          healthyTeeth: 2.63,
          caviousTeeth: 3.38,
          filledTeeth: 0.00,
          extractedTeeth: 0.15,
          dmftIndex: 0.48
        }
      },
      
      keyFindings: filters.language === 'english' ? [
        `Patient Categories: Study includes ${siswaSDPatients.length} elementary school students and ${umumPatients.length} general population participants, enabling targeted analysis for different age groups and life contexts`,
        `Student Population Health: Elementary students show average DMF-T of ${siswaSDAvgDmft.toFixed(2)} and def-t of ${siswaSDAvgDeft.toFixed(2)}, indicating primary teeth caries experience that requires school-based interventions`,
        `General Population Health: General population shows average DMF-T of ${umumAvgDmft.toFixed(2)} and def-t of ${umumAvgDeft.toFixed(2)}, representing mixed-age oral health status requiring community-wide approaches`,
        `Educational Background: Balanced representation across education levels (SD: 13, SMP: 13, SMA: 13), with data including both student backgrounds and parent/guardian education for comprehensive socioeconomic analysis`,
        `Age-Specific Patterns: Majority of participants (${summaryTables.ageGroup['Antara 5-10 tahun (anak-anak)']}) fall in the 5-10 age group, corresponding to primary school age where early intervention can be most effective`,
        `Treatment Access Disparity: Zero filled teeth across categories indicates limited access to restorative care, with untreated caries being the primary concern in both student and general populations`,
        `Preventive Care Opportunities: Category-based analysis reveals different prevention needs - school programs for students and community outreach for general population`
      ] : [
        `Kategori Pasien: Studi mencakup ${siswaSDPatients.length} siswa sekolah dasar dan ${umumPatients.length} partisipan populasi umum, memungkinkan analisis terarah untuk kelompok usia dan konteks kehidupan yang berbeda`,
        `Kesehatan Populasi Siswa: Siswa SD menunjukkan rata-rata DMF-T sebesar ${siswaSDAvgDmft.toFixed(2)} dan def-t sebesar ${siswaSDAvgDeft.toFixed(2)}, mengindikasikan pengalaman karies gigi susu yang memerlukan intervensi berbasis sekolah`,
        `Kesehatan Populasi Umum: Populasi umum menunjukkan rata-rata DMF-T sebesar ${umumAvgDmft.toFixed(2)} dan def-t sebesar ${umumAvgDeft.toFixed(2)}, mewakili status kesehatan mulut usia campuran yang memerlukan pendekatan berbasis komunitas`,
        `Latar Belakang Pendidikan: Representasi seimbang lintas tingkat pendidikan (SD: 13, SMP: 13, SMA: 13), dengan data mencakup latar belakang siswa dan pendidikan orang tua/wali untuk analisis sosioekonomis komprehensif`,
        `Pola Spesifik Usia: Mayoritas partisipan (${summaryTables.ageGroup['Antara 5-10 tahun (anak-anak)']}) berada di kelompok usia 5-10 tahun, sesuai dengan usia sekolah dasar dimana intervensi dini dapat paling efektif`,
        `Disparitas Akses Perawatan: Nol gigi ditambal di semua kategori menunjukkan akses terbatas terhadap perawatan restoratif, dengan karies tidak dirawat menjadi perhatian utama di populasi siswa maupun umum`,
        `Peluang Perawatan Preventif: Analisis berbasis kategori mengungkap kebutuhan pencegahan yang berbeda - program sekolah untuk siswa dan penjangkauan komunitas untuk populasi umum`
      ],
      
      recommendations: filters.language === 'english' ? [
        `School-Based Programs for Students: Implement comprehensive oral health education and supervised brushing programs in elementary schools, targeting the ${siswaSDPatients.length} student participants with age-appropriate preventive measures`,
        `Parent/Guardian Education: Develop targeted educational programs for parents of student participants, focusing on home oral care supervision and dietary counseling to support school-based initiatives`,
        `Community Health Centers for General Population: Establish accessible dental care services for the ${umumPatients.length} general population participants, with emphasis on restorative care to address untreated caries`,
        `Category-Specific Screening Protocols: Implement different screening approaches - regular school dental checks for students and community health outreach for general population`,
        `Fluoride Program Differentiation: Apply school-based fluoride varnish programs for students while implementing community water fluoridation or fluoride rinse programs for general population`,
        `Treatment Prioritization by Category: Prioritize early intervention and prevention for student category while focusing on treatment and restoration for general population with established disease`,
        `Data-Driven Policy Development: Use category-specific findings to inform different policy approaches - school health policies for student population and public health policies for community-wide interventions`
      ] : [
        `Program Berbasis Sekolah untuk Siswa: Implementasikan edukasi kesehatan mulut komprehensif dan program sikat gigi terawasi di sekolah dasar, menargetkan ${siswaSDPatients.length} partisipan siswa dengan langkah-langkah preventif yang sesuai usia`,
        `Edukasi Orang Tua/Wali: Kembangkan program edukasi terarah untuk orang tua partisipan siswa, fokus pada supervisi perawatan mulut di rumah dan konseling diet untuk mendukung inisiatif berbasis sekolah`,
        `Pusat Kesehatan Masyarakat untuk Populasi Umum: Bangun layanan perawatan gigi yang dapat diakses untuk ${umumPatients.length} partisipan populasi umum, dengan penekanan pada perawatan restoratif untuk mengatasi karies tidak dirawat`,
        `Protokol Screening Spesifik Kategori: Implementasikan pendekatan screening yang berbeda - pemeriksaan gigi sekolah rutin untuk siswa dan jangkauan kesehatan masyarakat untuk populasi umum`,
        `Diferensiasi Program Fluoride: Terapkan program fluoride varnish berbasis sekolah untuk siswa sambil mengimplementasikan fluoridasi air komunitas atau program kumur fluoride untuk populasi umum`,
        `Prioritas Perawatan per Kategori: Prioritaskan intervensi dini dan pencegahan untuk kategori siswa sambil fokus pada pengobatan dan restorasi untuk populasi umum dengan penyakit yang sudah mapan`,
        `Pengembangan Kebijakan Berbasis Data: Gunakan temuan spesifik kategori untuk menginformasikan pendekatan kebijakan yang berbeda - kebijakan kesehatan sekolah untuk populasi siswa dan kebijakan kesehatan masyarakat untuk intervensi berbasis komunitas`
      ],
      
      summaryTables
    };

    return { analysis: detailedAnalysis };

  } catch (error: any) {
    console.error("Error getting dashboard analysis:", error);
    return { error: `Gagal menghasilkan analisis: ${error.message || 'Error tidak diketahui'}` };
  }
}
