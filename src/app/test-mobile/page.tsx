'use client';

import { useForm } from "react-hook-form";
import { Odontogram } from "@/components/odontogram";

export default function TestMobilePage() {
  const form = useForm({
    defaultValues: {
      'odontogram-chart': {}
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
            Mobile Preview - Odontogram
          </h1>
          
          <div className="bg-yellow-100 p-4 rounded-lg mb-6">
            <h2 className="font-bold text-lg mb-2">📱 Panduan Mobile:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Desktop:</strong> Kecilkan ukuran browser untuk simulasi mobile</li>
              <li><strong>Touch Device:</strong> Swipe/geser chart ke kiri dan kanan</li>
              <li><strong>Scrollbar:</strong> Muncul di bawah chart saat konten lebih lebar dari layar</li>
              <li><strong>Responsif:</strong> Semua gigi (18-48) dapat diakses dengan scroll horizontal</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg">
            <h3 className="font-bold mb-4 text-center">Odontogram dengan Scroll Horizontal</h3>
            <Odontogram form={form} />
          </div>

          <div className="mt-6 bg-green-100 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">💡 Fitur Mobile:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold">Chart Odontogram:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Scroll horizontal yang smooth</li>
                  <li>Touch-friendly swipe gesture</li>
                  <li>Dropdown tanpa arrow untuk tampilan compact</li>
                  <li>Visual indicator untuk mobile</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Tabel Skor DMF-T/def-t:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Scroll horizontal untuk tabel</li>
                  <li>Responsive design</li>
                  <li>Custom scrollbar mobile</li>
                  <li>Optimized untuk semua device</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">🦷 Daftar Gigi yang Dapat Diakses:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold">Gigi Dewasa:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Upper Right:</strong> 18, 17, 16, 15, 14, 13, 12, 11</li>
                  <li><strong>Upper Left:</strong> 21, 22, 23, 24, 25, 26, 27, 28</li>
                  <li><strong>Lower Left:</strong> 31, 32, 33, 34, 35, 36, 37, 38</li>
                  <li><strong>Lower Right:</strong> 41, 42, 43, 44, 45, 46, 47, 48</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold">Akses Mobile:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Semua gigi dapat diakses dengan scroll</li>
                  <li>Gigi ujung (18, 28, 38, 48) tidak terpotong</li>
                  <li>Swipe gesture untuk navigasi mudah</li>
                  <li>Tampilan compact untuk mobile</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Gunakan Developer Tools → Responsive Mode untuk simulasi berbagai ukuran layar.<br/>
              <strong>Aplikasi dioptimalkan untuk desktop, tablet, dan mobile!</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}