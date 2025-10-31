
"use client";

import { AuthProvider, useAuth } from '../contexts/auth-context';

// Simple UI components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-3 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-3 ${className}`}>
    {children}
  </div>
);

// Simple Survey Form placeholder
const SurveyForm = () => (
  <div className="text-center py-8">
    <p className="text-gray-600">
      Form pemeriksaan gigi sedang dalam pengembangan. 
      Silakan gunakan halaman Master untuk melihat data pasien yang sudah ada.
    </p>
    <a 
      href="/master" 
      className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
    >
      Lihat Data Master
    </a>
  </div>
);

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
          <p className="text-gray-600">Anda harus login untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function HomeContent() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl">FORM PEMERIKSAAN GIGI</CardTitle>
          </CardHeader>
          <CardContent>
            <SurveyForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <HomeContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
