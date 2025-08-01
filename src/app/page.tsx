
"use client";

import { SurveyForm } from '@/components/survey-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { List, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-4xl">FORM PEMERIKSAAN GIGI</CardTitle>
            <div className="flex gap-2">
              <Link href="/master" passHref>
                 <Button variant="outline">
                    <List className="mr-2 h-4 w-4" />
                    Tabel Master
                 </Button>
              </Link>
              <Link href="/dashboard" passHref>
                 <Button variant="outline">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                 </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <SurveyForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
