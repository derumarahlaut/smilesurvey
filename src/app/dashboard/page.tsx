
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { List, Home, FileText, BarChart, Users, MapPin, Activity, Lightbulb, AlertTriangle, Loader2, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { getDashboardAnalysis } from '@/app/actions';
import type { DentalAnalysisOutput } from '@/ai/flows/analyze-dental-data';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { provinces, getCitiesByProvince } from '@/lib/location-data';
import { cn } from '@/lib/utils';


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
  const [language, setLanguage] = useState('indonesian');
  
  // Filter states
  const [provinceFilter, setProvinceFilter] = useState<string | undefined>(undefined);
  const [cityFilter, setCityFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        language,
        province: provinceFilter,
        city: cityFilter,
        dateRange: dateRange,
      };
      const result = await getDashboardAnalysis(filters);
      if (result.error) {
        setError(result.error);
        setAnalysis(null);
      } else {
        setAnalysis(result.analysis);
      }
    } catch (e: any) {
      setError('Terjadi kesalahan tak terduga saat mengambil data analisis.');
      console.error(e);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [language, provinceFilter, cityFilter, dateRange]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);
  
  useEffect(() => {
    if (provinceFilter) {
      setAvailableCities(getCitiesByProvince(provinceFilter));
      setCityFilter(undefined);
    } else {
      setAvailableCities([]);
      setCityFilter(undefined);
    }
  }, [provinceFilter]);

  const clearFilters = () => {
      setProvinceFilter(undefined);
      setCityFilter(undefined);
      setDateRange(undefined);
  };

  const isFilterActive = provinceFilter || cityFilter || dateRange;

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-start justify-start p-4 md:p-8">
      <div className="w-full max-w-7xl space-y-8">
        <Card className="shadow-xl w-full">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="font-headline text-4xl">Dashboard Analisis Data</CardTitle>
                  <CardDescription>Ringkasan dan analisis komprehensif dari data pemeriksaan gigi.</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
            </div>
            <div className="border-t pt-4 mt-4 space-y-4">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Filter Data</h3>
                         <Select onValueChange={setProvinceFilter} value={provinceFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Pilih Provinsi" />
                            </SelectTrigger>
                            <SelectContent>
                                {provinces.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setCityFilter} value={cityFilter} disabled={!provinceFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Pilih Kota/Kab." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                  "w-full sm:w-[260px] justify-start text-left font-normal",
                                  !dateRange && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                  dateRange.to ? (
                                    <>
                                      {format(dateRange.from, "LLL dd, y")} -{" "}
                                      {format(dateRange.to, "LLL dd, y")}
                                    </>
                                  ) : (
                                    format(dateRange.from, "LLL dd, y")
                                  )
                                ) : (
                                  <span>Pilih Rentang Tanggal</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                              />
                            </PopoverContent>
                          </Popover>
                          {isFilterActive && (
                            <Button variant="ghost" size="icon" onClick={clearFilters}>
                                <X className="h-4 w-4" />
                            </Button>
                          )}
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant={language === 'indonesian' ? 'secondary' : 'outline'} size="sm" onClick={() => setLanguage('indonesian')}>ID</Button>
                        <Button variant={language === 'english' ? 'secondary' : 'outline'} size="sm" onClick={() => setLanguage('english')}>EN</Button>
                    </div>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <h2 className="text-2xl font-semibold text-muted-foreground">Menganalisis Data...</h2>
                  <p className="text-muted-foreground mt-2">AI sedang bekerja untuk menganalisis data pasien. Mohon tunggu sejenak.</p>
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
                        <CardTitle className="flex items-center gap-2"><FileText /> {language === 'english' ? 'Executive Summary' : 'Ringkasan Umum'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{analysis.executiveSummary}</p>
                    </CardContent>
                </Card>
                
                {/* Statistik Utama */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard title={language === 'english' ? 'Total Patients' : 'Total Pasien'} value={analysis.keyStatistics.totalPatients} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title={language === 'english' ? 'Average DMF-T' : 'Rata-rata DMF-T'} value={analysis.keyStatistics.averageDmft.toFixed(2)} icon={<BarChart className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title={language === 'english' ? 'Average def-t' : 'Rata-rata def-t'} value={analysis.keyStatistics.averageDeft.toFixed(2)} icon={<BarChart className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title={language === 'english' ? 'Top Province' : 'Provinsi Teratas'} value={analysis.keyStatistics.topProvince} icon={<MapPin className="h-4 w-4 text-muted-foreground" />} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Temuan Kunci */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Activity /> {language === 'english' ? 'Key Findings' : 'Temuan Kunci'}</CardTitle>
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
                            <CardTitle className="flex items-center gap-2"><Lightbulb /> {language === 'english' ? 'Recommendations' : 'Rekomendasi'}</CardTitle>
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
                    <h2 className="text-2xl font-semibold text-muted-foreground">{language === 'english' ? 'No Data to Analyze' : 'Tidak Ada Data untuk Dianalisis'}</h2>
                    <p className="text-muted-foreground mt-2">{language === 'english' ? 'No patient data found matching the selected filters. Please adjust filters or add new patient data.' : 'Tidak ada data pasien yang cocok dengan filter yang dipilih. Silakan sesuaikan filter atau tambahkan data pasien baru.'}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
