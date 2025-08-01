'use server';

import { redirect } from 'next/navigation';
import { generatePersonalizedTips } from '@/ai/flows/generate-personalized-tips';
import { allQuestions } from '@/lib/survey-data';

export async function submitSurvey(formData: Record<string, any>) {
  try {
    const surveyResponses: Record<string, any> = {};

    for (const questionId in formData) {
      const question = allQuestions.find(q => q.id === questionId);
      if (question && formData[questionId]) {
        surveyResponses[question.question] = formData[questionId];
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
