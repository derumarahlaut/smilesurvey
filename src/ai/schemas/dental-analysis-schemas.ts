
import { z } from 'zod';

const PatientDataSchema = z.record(z.string(), z.any()).describe('A single patient record containing all their survey and clinical data.');

const EducationSummarySchema = z.object({
    'SD': z.number(),
    'SMP': z.number(),
    'SMA': z.number(),
    'Diploma 1/2/3': z.number(),
    'D4/S1': z.number(),
    'S2': z.number(),
    'S3': z.number(),
    'Tidak sekolah': z.number(),
    'Jumlah': z.number(),
}).describe("Summary of patient education levels.");

const OccupationSummarySchema = z.object({
    'ASN/PNS/PPPK': z.number(),
    'TNI/POLRI': z.number(),
    'PEGAWAI BUMN': z.number(),
    'PEGAWAI SWASTA': z.number(),
    'WIRASWASTA/WIRAUSAHA': z.number(),
    'PELAJAR/MAHASISWA': z.number(),
    'PENGURUS/IBU RUMAH TANGGA': z.number(),
    'ASISTEN RUMAH TANGGA': z.number(),
    'TIDAK BEKERJA': z.number(),
    'Jumlah': z.number(),
}).describe("Summary of patient occupations.");

const GenderSummarySchema = z.object({
    'Laki-laki': z.number(),
    'Perempuan': z.number(),
    'Jumlah': z.number(),
}).describe("Summary of patient genders.");

const AgeGroupSummarySchema = z.object({
    'Antara 5-10 tahun (anak-anak)': z.number(),
    'Antara 10-18 tahun (remaja)': z.number(),
    'Antara 18-60 tahun (produktif)': z.number(),
    '60 tahun ke atas (lansia)': z.number(),
    'Jumlah': z.number(),
}).describe("Summary of patient age groups.");


const SummaryTablesSchema = z.object({
    education: EducationSummarySchema,
    occupation: OccupationSummarySchema,
    gender: GenderSummarySchema,
    ageGroup: AgeGroupSummarySchema,
}).describe('Pre-calculated summary tables of patient demographics.');


export const DentalAnalysisInputSchema = z.object({
  patients: z.array(PatientDataSchema).describe('An array of all patient data records to be analyzed.'),
  language: z.string().optional().default('indonesian').describe('The language for the analysis output. Supported: "english", "indonesian".'),
  summaryTables: SummaryTablesSchema,
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
  summaryTables: SummaryTablesSchema,
  keyFindings: z.array(z.string()).describe('A list of the most significant qualitative findings, trends, or notable patterns discovered in the data (e.g., common dental issues, demographic trends, regional disparities).'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations for public health interventions, educational campaigns, or policy changes based on the key findings.'),
});
export type DentalAnalysisOutput = z.infer<typeof DentalAnalysisOutputSchema>;
