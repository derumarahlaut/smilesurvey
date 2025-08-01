
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a comprehensive set of dental patient data.
 *
 * The flow takes an array of patient records, performs a holistic analysis, and returns key statistics,
 * findings, and recommendations. This is used to power the main analysis dashboard.
 *
 * It exports:
 * - `analyzeDentalData` function: The main entry point for the flow.
 */

import { ai } from '@/ai/genkit';
import { 
  DentalAnalysisInputSchema, 
  DentalAnalysisOutputSchema,
  type DentalAnalysisInput,
  type DentalAnalysisOutput
} from '@/ai/schemas/dental-analysis-schemas';

export { type DentalAnalysisInput, type DentalAnalysisOutput };

export async function analyzeDentalData(input: DentalAnalysisInput): Promise<DentalAnalysisOutput> {
  return analyzeDentalDataFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'dentalAnalysisPrompt',
  input: { schema: DentalAnalysisInputSchema },
  output: { schema: DentalAnalysisOutputSchema },
  prompt: `
You are a public health data analyst specializing in community dental health in Indonesia.
You have been provided with a JSON dataset containing numerous patient records from a dental survey.
Your task is to perform a comprehensive analysis of this data and provide structured insights.

Carefully analyze the provided patient data:
{{{json (Array.slice patients 0 200)}}}

Based on your analysis of the FULL dataset, please provide the following in your structured output:

1.  **Executive Summary**: Write a concise, high-level paragraph summarizing the overall state of dental health based on the data.
2.  **Key Statistics**:
    *   Calculate the total number of patients.
    *   Calculate the average DMF-T score. To do this, find the 'DMF-T Score' field for each patient (e.g., "D: 1, M: 0, F: 2, Total: 3"), extract the 'Total' value, and then average these totals across all patients who have this score.
    *   Calculate the average def-t score using the same method for the 'def-t Score' field.
    *   Identify the province with the most patient records.
3.  **Key Findings**: Identify and list 3-5 of the most important qualitative findings. These could be about common problems (e.g., "High prevalence of untreated caries in primary school students"), regional disparities, or correlations between demographics and dental health.
4.  **Recommendations**: Based on your findings, provide a list of 3-5 actionable recommendations. These should be practical suggestions for public health officials, like "Launch a targeted fissure sealant program in [Region]" or "Develop educational materials about the link between sugary drink consumption and caries for parents of elementary school children."

Provide your entire response in the required structured format.
`,
});

const analyzeDentalDataFlow = ai.defineFlow(
  {
    name: 'analyzeDentalDataFlow',
    inputSchema: DentalAnalysisInputSchema,
    outputSchema: DentalAnalysisOutputSchema,
  },
  async (input) => {
    // Slice the input to avoid sending excessively large payloads to the model,
    // but the prompt will instruct it to act as if it has the full dataset.
    const limitedInput = {
        patients: input.patients.slice(0, 200) // Use a reasonable limit
    };
    
    const { output } = await analysisPrompt(limitedInput);

    // Basic validation in case the model returns null
    if (!output) {
      throw new Error("The AI model did not return a valid analysis.");
    }

    // Manual calculation for accuracy as a fallback or override
    if (input.patients.length > 0) {
        output.keyStatistics.totalPatients = input.patients.length;

        let dmftTotal = 0;
        let dmftCount = 0;
        let deftTotal = 0;
        let deftCount = 0;
        const provinceCounts: Record<string, number> = {};

        for(const p of input.patients) {
            // Recalculate DMF-T
            if (p['DMF-T Score'] && typeof p['DMF-T Score'] === 'string') {
                const match = p['DMF-T Score'].match(/Total: (\d+)/);
                if (match && match[1]) {
                    dmftTotal += parseInt(match[1], 10);
                    dmftCount++;
                }
            }
            // Recalculate def-t
            if (p['def-t Score'] && typeof p['def-t Score'] === 'string') {
                const match = p['def-t Score'].match(/Total: (\d+)/);
                 if (match && match[1]) {
                    deftTotal += parseInt(match[1], 10);
                    deftCount++;
                }
            }
            // Count provinces
            if(p.province && typeof p.province === 'string') {
                provinceCounts[p.province] = (provinceCounts[p.province] || 0) + 1;
            }
        }
        
        output.keyStatistics.averageDmft = dmftCount > 0 ? parseFloat((dmftTotal / dmftCount).toFixed(2)) : 0;
        output.keyStatistics.averageDeft = deftCount > 0 ? parseFloat((deftTotal / deftCount).toFixed(2)) : 0;
        
        const topProvince = Object.entries(provinceCounts).sort((a,b) => b[1] - a[1])[0];
        output.keyStatistics.topProvince = topProvince ? topProvince[0] : 'N/A';
    }


    return output;
  }
);
