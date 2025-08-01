
'use server';

import { generatePersonalizedTips } from '@/ai/flows/generate-personalized-tips';
import { analyzeDentalData, type DentalAnalysisInput } from '@/ai/flows/analyze-dental-data';
import { allQuestions } from '@/lib/survey-data';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, collection, query, where, getDocs, orderBy, limit, getDoc, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { provinces } from '@/lib/location-data';
import { format } from 'date-fns';


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
      ...[81, 82, 83, 84, 85], ...[75, 74, 73, 72, 71]
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

    const result = await generatePersonalizedTips({ surveyResponses });

    if (!result || !result.tips || result.tips.length === 0) {
      return { error: 'Could not generate personalized tips at this time.' };
    }
    
    return { tips: result.tips };

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
      if (data['exam-date']) {
          data['exam-date'] = new Date(data['exam-date']);
      }
      if (data['birth-date']) {
          const [year, month, day] = data['birth-date'].split('-').map(Number);
          data['birth-date'] = { day: String(day), month: String(month), year: String(year) };
      }
      return { success: true, patient: data };
    } else {
      return { error: "Pasien tidak ditemukan." };
    }
  } catch (error: any) {
    console.error("Error fetching patient:", error);
    return { error: `Gagal mengambil data pasien: ${error.message}` };
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

    const patientList = patientSnapshot.docs.map(doc => doc.data() as DentalAnalysisInput['patients'][0]);
    
    const result = await analyzeDentalData({ patients: patientList, language: filters.language });

    if (!result) {
        return { error: 'Gagal menganalisis data. AI tidak memberikan respons.' };
    }

    return { analysis: result };

  } catch (error: any) {
    console.error("Error getting dashboard analysis:", error);
    return { error: `Gagal menghasilkan analisis: ${error.message || 'Error tidak diketahui'}` };
  }
}
