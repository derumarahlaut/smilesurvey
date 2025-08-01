'use server';

import { redirect } from 'next/navigation';
import { generatePersonalizedTips } from '@/ai/flows/generate-personalized-tips';
import { allQuestions } from '@/lib/survey-data';
import { format } from 'date-fns';

export async function submitSurvey(formData: Record<string, any>) {
  try {
    const surveyResponses: Record<string, any> = {};

    // Manually add province and city to the responses object for the prompt
    if (formData.province) {
        surveyResponses['Provinsi'] = formData.province;
    }
     if (formData.city) {
        surveyResponses['Kota/Kabupaten'] = formData.city;
    }

    for (const questionId in formData) {
      if (questionId === 'province' || questionId === 'city') continue;

      const question = allQuestions.find(q => q.id === questionId);
      if (question && formData[questionId]) {
        if (formData[questionId] instanceof Date) {
            surveyResponses[question.question] = format(formData[questionId], 'yyyy-MM-dd');
        } else {
            surveyResponses[question.question] = formData[questionId];
        }
      }
    }

    if (Object.keys(surveyResponses).length <= 2) { // check for more than just province/city
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
