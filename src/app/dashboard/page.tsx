
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { List, Home } from 'lucide-react';

export default async function DashboardPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-4xl">Dashboard Analisis Data</CardTitle>
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
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-muted-foreground">Analisis Data Segera Hadir</h2>
              <p className="text-muted-foreground mt-2">Fitur rekapitulasi dan analisis data menggunakan AI sedang dalam pengembangan.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
