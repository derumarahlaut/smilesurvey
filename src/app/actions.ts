'use server';

import { redirect } from 'next/navigation';
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
      
      // Separate tooth statuses from other clinical data
      const toothStatus: Record<string, string> = {};
      for (const key in odontogramChartData) {
        if (key.startsWith('tooth-')) {
          if(odontogramChartData[key]) toothStatus[key] = odontogramChartData[key];
        } else {
          if(odontogramChartData[key]) clinicalCheck[key] = odontogramChartData[key];
        }
      }

      if(Object.keys(toothStatus).length > 0) {
        surveyResponses['Status Gigi Geligi'] = JSON.stringify(toothStatus, null, 2);
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
    
    const tips = result.tips;

    const params = new URLSearchParams();
    params.set('tips', JSON.stringify(tips));
    
    redirect(`/tips?${params.toString()}`);

  } catch (error) {
    console.error("Error submitting survey:", error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}
