
"use client";

import { useState } from 'react';
import { SurveyForm } from '@/components/survey-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function Home() {
  const [tips, setTips] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSurveySubmit = (generatedTips: string[]) => {
    setTips(generatedTips);
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl">FORM PEMERIKSAAN GIGI</CardTitle>
          </CardHeader>
          <CardContent>
            <SurveyForm 
              onSurveySubmit={handleSurveySubmit} 
              setIsLoading={setIsLoading}
              onInteraction={() => setHasInteracted(true)}
            />
          </CardContent>
        </Card>

        {(isLoading || tips) && hasInteracted && (
          <Card className="w-full max-w-6xl shadow-xl animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Saran Kesehatan Gigi Untuk Anda</CardTitle>
              <CardDescription>
                Berdasarkan data yang Anda berikan, berikut adalah beberapa saran yang dipersonalisasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Menganalisis data Anda...</span>
                </div>
              ) : tips && (
                <ul className="space-y-3">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
