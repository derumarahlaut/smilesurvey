import { sections } from '@/lib/survey-data';
import { SurveyForm } from '@/components/survey-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ToothIcon } from '@/components/icons';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ToothIcon className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-4xl">Survei Kesehatan Gigi</CardTitle>
          <CardDescription className="text-lg">
            Formulir Pemeriksaan Kesehatan Gigi sesuai standar WHO.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SurveyForm sections={sections} />
        </CardContent>
      </Card>
    </main>
  );
}
