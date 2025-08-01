import Link from 'next/link';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function TipsContent({ tipsJSON }: { tipsJSON: string | null }) {
  if (!tipsJSON) {
    return (
      <div className="text-center text-destructive">
        <p>Gagal memuat saran. Silakan coba lagi.</p>
      </div>
    );
  }

  const tips = JSON.parse(tipsJSON) as string[];

  return (
    <ul className="space-y-3">
      {tips.map((tip, index) => (
        <li key={index} className="flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
          <span>{tip}</span>
        </li>
      ))}
    </ul>
  );
}

function TipsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
         <li key={i} className="flex items-start space-x-3">
          <Skeleton className="h-5 w-5 mt-0.5 rounded-full" />
          <Skeleton className="h-5 w-full" />
        </li>
      ))}
    </div>
  )
}

export default function TipsPage({ searchParams }: { searchParams: { tips: string } }) {
  const tipsJSON = searchParams.tips || null;

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl">Terima Kasih!</CardTitle>
          <CardDescription className="text-lg">
            Berikut adalah beberapa saran kesehatan gigi khusus untuk Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TipsSkeleton />}>
            <TipsContent tipsJSON={tipsJSON} />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Ulangi Survey</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
