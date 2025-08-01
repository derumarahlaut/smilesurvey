
import { z } from 'zod';

const PatientDataSchema = z.record(z.string(), z.any()).describe('A single patient record containing all their survey and clinical data.');

const SummaryTableSchema = z.record(z.string(), z.number());

export const DentalAnalysisInputSchema = z.object({
  patients: z.array(PatientDataSchema).describe('An array of all patient data records to be analyzed.'),
  language: z.string().optional().default('indonesian').describe('The language for the analysis output. Supported: "english", "indonesian".'),
  summaryTables: z.object({
      education: SummaryTableSchema,
      occupation: SummaryTableSchema,
      gender: SummaryTableSchema,
      ageGroup: SummaryTableSchema,
  }).describe('Pre-calculated summary tables of patient demographics.'),
});
export type DentalAnalysisInput = z.infer<typeof DentalAnalysisInputSchema>;

export const DentalAnalysisOutputSchema = z.object({
  executiveSummary: z.string().describe('A brief, high-level summary of the overall dental health status and key takeaways from the data.'),
  keyStatistics: z.object({
    totalPatients: z.number().describe('The total number of patients in the dataset.'),
    averageDmft: z.number().describe('The calculated average DMF-T score across all applicable patients.'),
    averageDeft: z.number().describe('The calculated average def-t score across all applicable patients.'),
    topProvince: z.string().describe('The province with the highest number of patient records.'),
  }).describe('Core quantitative metrics derived from the data.'),
  summaryTables: z.object({
      education: SummaryTableSchema,
      occupation: SummaryTableSchema,
      gender: SummaryTableSchema,
      ageGroup: SummaryTableSchema,
  }).describe('The pre-calculated summary tables of patient demographics passed from the input.'),
  keyFindings: z.array(z.string()).describe('A list of the most significant qualitative findings, trends, or notable patterns discovered in the data (e.g., common dental issues, demographic trends, regional disparities).'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations for public health interventions, educational campaigns, or policy changes based on the key findings.'),
});
export type DentalAnalysisOutput = z.infer<typeof DentalAnalysisOutputSchema>;
