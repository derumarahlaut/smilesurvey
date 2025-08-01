
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { List, Home, FileText, BarChart, Users, MapPin, Activity, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import { getDashboardAnalysis } from '@/app/actions';
import type { DentalAnalysisOutput } from '@/ai/flows/analyze-dental-data';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<DentalAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getDashboardAnalysis();
        if (result.error) {
          setError(result.error);
        } else if (result.analysis) {
          setAnalysis(result.analysis);
        }
      } catch (e: any) {
        setError('Terjadi kesalahan tak terduga saat mengambil data analisis.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-start justify-start p-4 md:p-8">
      <div className="w-full max-w-7xl space-y-8">
        <Card className="shadow-xl w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline text-4xl">Dashboard Analisis Data</CardTitle>
              <CardDescription>Ringkasan dan analisis komprehensif dari data pemeriksaan gigi.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Link href="/" passHref>
                   <Button variant="outline">
                      <Home className="mr-2 h-4 w-4" />
                      Form Input
                   </Button>
                </Link>
                <Link href="/master" passHref>
                   <Button variant="outline">
                      <List className="mr-2 h-4 w-4" />
                      Tabel Master
                   </Button>
                </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <h2 className="text-2xl font-semibold text-muted-foreground">Menganalisis Data...</h2>
                  <p className="text-muted-foreground mt-2">AI sedang bekerja untuk menganalisis seluruh data pasien. Mohon tunggu sejenak.</p>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="my-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Gagal Memuat Analisis</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : analysis ? (
              <div className="space-y-6">
                 {/* Ringkasan Umum */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> Ringkasan Umum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{analysis.executiveSummary}</p>
                    </CardContent>
                </Card>
                
                {/* Statistik Utama */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard title="Total Pasien" value={analysis.keyStatistics.totalPatients} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Rata-rata DMF-T" value={analysis.keyStatistics.averageDmft.toFixed(2)} icon={<BarChart className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Rata-rata def-t" value={analysis.keyStatistics.averageDeft.toFixed(2)} icon={<BarChart className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Provinsi Teratas" value={analysis.keyStatistics.topProvince} icon={<MapPin className="h-4 w-4 text-muted-foreground" />} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Temuan Kunci */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Activity /> Temuan Kunci</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                                {analysis.keyFindings.map((finding, index) => (
                                    <li key={index}>{finding}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Rekomendasi */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lightbulb /> Rekomendasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                                {analysis.recommendations.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

              </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold text-muted-foreground">Tidak ada data untuk dianalisis.</h2>
                    <p className="text-muted-foreground mt-2">Silakan tambahkan data pasien terlebih dahulu melalui form input.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
