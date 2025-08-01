
'use server';

import { generatePersonalizedTips } from '@/ai/flows/generate-personalized-tips';
import { allQuestions } from '@/lib/survey-data';

// Helper to get question text by ID
const getQuestionText = (id: string) => {
  const question = allQuestions.find(q => q.id === id);
  return question ? question.question : id;
}

export async function submitSurvey(formData: Record<string, any>) {
  try {
    const surveyResponses: Record<string, any> = {};

    const { 'odontogram-chart': odontogramChartData, ...regularFormData } = formData;
    
    // Process regular form data
    for (const id in regularFormData) {
      if (regularFormData[id]) { // Ensure value is not empty
        surveyResponses[getQuestionText(id)] = regularFormData[id];
      }
    }
    
    // Process and flatten odontogram data
    if (odontogramChartData) {
      const clinicalCheck: Record<string, any> = {};
      
      const toothStatus: Record<string, string> = {};
      
      const allAdultTeethIds = [
        ...[18, 17, 16, 15, 14, 13, 12, 11], ...[21, 22, 23, 24, 25, 26, 27, 28],
        ...[31, 32, 33, 34, 35, 36, 37, 38], ...[48, 47, 46, 45, 44, 43, 42, 41]
      ];
      const allChildTeethIds = [
        ...[55, 54, 53, 52, 51], ...[61, 62, 63, 64, 65],
        ...[71, 72, 73, 74, 75], ...[85, 84, 83, 82, 81]
      ];
      
      for (const key in odontogramChartData) {
        if (key.startsWith('tooth-')) {
          if(odontogramChartData[key]) toothStatus[key] = odontogramChartData[key];
        } else {
          if(odontogramChartData[key]) clinicalCheck[key] = odontogramChartData[key];
        }
      }

      // Calculate scores and add to responses
      const dmf = { D: 0, M: 0, F: 0 };
      const def = { d: 0, e: 0, f: 0 };
      
      // DMF-T Calculation (Gigi Tetap)
      // D = Decay (1, 2), M = Missing (4), F = Filling (3)
      allAdultTeethIds.forEach(id => {
          const status = odontogramChartData[`tooth-${id}`];
          if (status === '1' || status === '2') dmf.D++;
          if (status === '4') dmf.M++;
          if (status === '3') dmf.F++;
      });
      
      // def-t Calculation (Gigi Sulung)
      // d = decay (B, C), e = evoliation/extracted (E), f = filling (D)
      allChildTeethIds.forEach(id => {
          const status = odontogramChartData[`tooth-${id}`];
          if (status === 'B' || status === 'C') def.d++;
          if (status === 'E') def.e++;
          if (status === 'D') def.f++;
      });
      
      surveyResponses['DMF-T Score'] = `D: ${dmf.D}, M: ${dmf.M}, F: ${dmf.F}, Total: ${dmf.D + dmf.M + dmf.F}`;
      surveyResponses['def-t Score'] = `d: ${def.d}, e: ${def.e}, f: ${def.f}, Total: ${def.d + def.e + def.f}`;


      if(Object.keys(toothStatus).length > 0) {
        // Instead of JSON.stringify, let's add each tooth status individually.
        for (const toothId in toothStatus) {
            // Only add teeth that are not healthy (status != '0' or 'A')
            if (toothStatus[toothId] !== '0' && toothStatus[toothId] !== 'A') {
                surveyResponses[`Status Gigi ${toothId.replace('tooth-','')}`] = toothStatus[toothId];
            }
        }
      }
      
      // Add other clinical checks to the main response object
      if (clinicalCheck.bleedingGums) surveyResponses['Gusi berdarah'] = clinicalCheck.bleedingGums === '1' ? 'Ya' : 'Tidak';
      if (clinicalCheck.oralLesion) surveyResponses['Lesi Mukosa Oral'] = clinicalCheck.oralLesion === '1' ? 'Ya' : 'Tidak';
      if (clinicalCheck.treatmentNeed) {
         const treatmentMap: Record<string, string> = { '0': 'tidak perlu perawatan', '1': 'perlu, tidak segera', '2': 'perlu, segera' };
         surveyResponses['Kebutuhan perawatan segera'] = treatmentMap[clinicalCheck.treatmentNeed] || clinicalCheck.treatmentNeed;
      }
      if (clinicalCheck.referral) {
        const referralMap: Record<string, string> = { '0': 'tidak perlu rujukan', '1': 'perlu rujukan' };
        surveyResponses['Rujukan'] = referralMap[clinicalCheck.referral] || clinicalCheck.referral;
        if (clinicalCheck.referral === '1' && clinicalCheck.referralLocation) {
          surveyResponses['Lokasi Rujukan'] = clinicalCheck.referralLocation;
        }
      }
    }

    if (Object.keys(surveyResponses).length === 0) {
      return { error: 'No responses provided.' };
    }

    const result = await generatePersonalizedTips({ surveyResponses });

    if (!result || !result.tips || result.tips.length === 0) {
      return { error: 'Could not generate personalized tips at this time.' };
    }
    
    return { tips: result.tips };

  } catch (error) {
    console.error("Error submitting survey:", error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}
