'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Heart, Shield, Utensils, Clock, Star } from 'lucide-react';

const tips = [
  {
    id: 1,
    title: 'Sikat Gigi yang Benar',
    description: 'Sikat gigi minimal 2 kali sehari dengan teknik yang benar. Gunakan pasta gigi berfluoride dan sikat dengan gerakan melingkar.',
    category: 'Kebersihan',
    icon: <Shield className="h-5 w-5" />,
    importance: 'Tinggi'
  },
  {
    id: 2,
    title: 'Konsumsi Makanan Sehat',
    description: 'Batasi makanan dan minuman manis. Perbanyak konsumsi buah, sayur, dan air putih untuk kesehatan gigi dan mulut.',
    category: 'Nutrisi',
    icon: <Utensils className="h-5 w-5" />,
    importance: 'Tinggi'
  },
  {
    id: 3,
    title: 'Kunjungi Dokter Gigi Rutin',
    description: 'Lakukan pemeriksaan gigi ke dokter gigi setiap 6 bulan sekali untuk deteksi dini masalah gigi dan mulut.',
    category: 'Pemeriksaan',
    icon: <Heart className="h-5 w-5" />,
    importance: 'Tinggi'
  },
  {
    id: 4,
    title: 'Gunakan Benang Gigi',
    description: 'Bersihkan sela-sela gigi dengan benang gigi setiap hari untuk menghilangkan plak yang tidak terjangkau sikat gigi.',
    category: 'Kebersihan',
    icon: <Shield className="h-5 w-5" />,
    importance: 'Sedang'
  },
  {
    id: 5,
    title: 'Hindari Kebiasaan Buruk',
    description: 'Jangan menggunakan gigi untuk membuka kemasan, menggigit kuku, atau mengunyah es batu.',
    category: 'Perilaku',
    icon: <Clock className="h-5 w-5" />,
    importance: 'Sedang'
  },
  {
    id: 6,
    title: 'Berkumur dengan Obat Kumur',
    description: 'Gunakan obat kumur antiseptik untuk membantu membunuh bakteri dan menjaga kesehatan gusi.',
    category: 'Kebersihan',
    icon: <Shield className="h-5 w-5" />,
    importance: 'Sedang'
  }
];

const getBadgeVariant = (importance: string) => {
  switch (importance) {
    case 'Tinggi':
      return 'destructive';
    case 'Sedang':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Kebersihan':
      return 'bg-blue-100 text-blue-800';
    case 'Nutrisi':
      return 'bg-green-100 text-green-800';
    case 'Pemeriksaan':
      return 'bg-purple-100 text-purple-800';
    case 'Perilaku':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TipsPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lightbulb className="h-8 w-8 text-yellow-500" />
              <CardTitle className="font-headline text-4xl">Tips Kesehatan Gigi</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Kumpulan tips dan saran untuk menjaga kesehatan gigi dan mulut Anda
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip) => (
                <Card key={tip.id} className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {tip.icon}
                        <h3 className="font-semibold leading-tight">{tip.title}</h3>
                      </div>
                      <Badge variant={getBadgeVariant(tip.importance)} className="shrink-0">
                        {tip.importance}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {tip.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getCategoryColor(tip.category)}`} variant="secondary">
                        {tip.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">Rekomendasi</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}