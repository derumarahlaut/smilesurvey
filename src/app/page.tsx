
"use client";

import { SurveyForm } from '@/components/survey-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl">FORM PEMERIKSAAN GIGI</CardTitle>
          </CardHeader>
          <CardContent>
            <SurveyForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
