
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized dental care tips based on user survey responses.
 *
 * The flow takes survey responses as input and returns personalized tips to improve oral hygiene.
 * It exports the `generatePersonalizedTips` function, the `PersonalizedTipsInput` type, and the `PersonalizedTipsOutput` type.
 */
import type { Genkit } from 'genkit';
import {z} from 'genkit';

const PersonalizedTipsInputSchema = z.object({
  surveyResponses: z.record(z.string(), z.any()).describe('A record of survey questions and user responses.'),
});
export type PersonalizedTipsInput = z.infer<typeof PersonalizedTipsInputSchema>;

const PersonalizedTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('An array of personalized dental care tips.'),
});
export type PersonalizedTipsOutput = z.infer<typeof PersonalizedTipsOutputSchema>;

export async function generatePersonalizedTips(ai: Genkit, input: PersonalizedTipsInput): Promise<PersonalizedTipsOutput> {
  const prompt = ai.definePrompt({
    name: 'personalizedTipsPrompt',
    input: {schema: PersonalizedTipsInputSchema},
    output: {schema: PersonalizedTipsOutputSchema},
    prompt: `You are a helpful dental health advisor. Based on the following survey responses, provide personalized dental care tips to the user.

  Survey Responses:
  {{#each (Object.entries surveyResponses)}}
    {{@key}}: {{this.[1]}}
  {{/each}}
  
  Tips:`,
  });
  
  const generatePersonalizedTipsFlow = ai.defineFlow(
    {
      name: 'generatePersonalizedTipsFlow',
      inputSchema: PersonalizedTipsInputSchema,
      outputSchema: PersonalizedTipsOutputSchema,
    },
    async input => {
      const {output} = await prompt(input);
      return output!;
    }
  );

  return generatePersonalizedTipsFlow(input);
}
