
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '../contexts/auth-context';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

// Navigation Header
const Navigation = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold">SmileSurvey</Link>
          {user && (
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="hover:bg-blue-700 px-3 py-2 rounded">Home</Link>
              <Link href="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">Dashboard</Link>
              <Link href="/master" className="hover:bg-blue-700 px-3 py-2 rounded">Data Master</Link>
              <Link href="/admin/users" className="hover:bg-blue-700 px-3 py-2 rounded">Users</Link>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm">Hai, {user.email}</span>
              <button 
                onClick={logout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="text-sm">Silakan login untuk mengakses sistem</div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Simple Survey Form
const SurveyForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    category: 'Umum',
    location: '',
    phone: '',
    tooth_pain: '',
    bleeding_gums: '',
    brushing_frequency: '',
    sugar_intake: '',
    dental_visit: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const patient = {
        ...formData,
        age: parseInt(formData.age) || 0,
        date: new Date().toLocaleDateString('id-ID'),
        patient_id: `SM-${Date.now()}`,
        answers: {
          tooth_pain: formData.tooth_pain,
          bleeding_gums: formData.bleeding_gums,
          brushing_frequency: formData.brushing_frequency,
          sugar_intake: formData.sugar_intake,
          dental_visit: formData.dental_visit
        },
        verification_status: 'pending'
      };

      await addDoc(collection(db, 'patients'), patient);
      
      alert('Data pasien berhasil disimpan!');
      setFormData({
        name: '',
        age: '',
        category: 'Umum',
        location: '',
        phone: '',
        tooth_pain: '',
        bleeding_gums: '',
        brushing_frequency: '',
        sugar_intake: '',
        dental_visit: ''
      });
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama lengkap"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Umur</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan umur"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Kategori</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Umum">Umum</option>
            <option value="Siswa SD">Siswa SD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Lokasi</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Kota/Kabupaten"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">No. Telepon</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="08xxxxxxxxxx"
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Pemeriksaan Kesehatan Gigi</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Apakah Anda mengalami sakit gigi?</label>
            <select
              name="tooth_pain"
              value={formData.tooth_pain}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih jawaban</option>
              <option value="ya">Ya</option>
              <option value="tidak">Tidak</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Apakah gusi Anda sering berdarah?</label>
            <select
              name="bleeding_gums"
              value={formData.bleeding_gums}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih jawaban</option>
              <option value="ya">Ya</option>
              <option value="tidak">Tidak</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Berapa kali Anda sikat gigi sehari?</label>
            <select
              name="brushing_frequency"
              value={formData.brushing_frequency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih jawaban</option>
              <option value="kurang_dari_2x">Kurang dari 2x</option>
              <option value="2x_sehari">2x sehari</option>
              <option value="lebih_dari_2x">Lebih dari 2x</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Seberapa sering Anda mengonsumsi makanan/minuman manis?</label>
            <select
              name="sugar_intake"
              value={formData.sugar_intake}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih jawaban</option>
              <option value="jarang">Jarang</option>
              <option value="kadang">Kadang-kadang</option>
              <option value="sering">Sering</option>
              <option value="sangat_sering">Sangat sering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kapan terakhir Anda ke dokter gigi?</label>
            <select
              name="dental_visit"
              value={formData.dental_visit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih jawaban</option>
              <option value="kurang_dari_6_bulan">Kurang dari 6 bulan</option>
              <option value="6_bulan_1_tahun">6 bulan - 1 tahun</option>
              <option value="lebih_dari_1_tahun">Lebih dari 1 tahun</option>
              <option value="tidak_pernah">Tidak pernah</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium"
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Data Pasien'}
        </button>
      </div>
    </form>
  );
};

// Login Form Component
const LoginForm = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(credentials.email, credentials.password);
    } catch (error) {
      alert('Login gagal. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login SmileSurvey</CardTitle>
          <p className="text-gray-600 mt-2">Masuk untuk mengakses sistem survei kesehatan gigi</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password Anda"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
            >
              {isLoading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Demo credentials:</p>
            <p>Email: admin@smilesurvey.com</p>
            <p>Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function HomeContent() {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">FORM PEMERIKSAAN GIGI</h1>
            <p className="text-gray-600">Sistem Survei Kesehatan Gigi dan Mulut</p>
          </div>
          
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Input Data Pasien Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <SurveyForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
