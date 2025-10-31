"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProtectedRoute } from '../../components/protected-route';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800"
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const Navigation = () => (
  <nav className="bg-blue-600 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-bold">SmileSurvey</Link>
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="hover:bg-blue-700 px-3 py-2 rounded">Home</Link>
          <Link href="/dashboard" className="bg-blue-700 px-3 py-2 rounded">Dashboard</Link>
          <Link href="/master" className="hover:bg-blue-700 px-3 py-2 rounded">Data Master</Link>
          <Link href="/admin/users" className="hover:bg-blue-700 px-3 py-2 rounded">Users</Link>
        </div>
      </div>
    </div>
  </nav>
);

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    siswaSD: 0,
    umum: 0,
    verified: 0,
    pending: 0,
    toothPainYes: 0,
    bleedingGumsYes: 0,
    goodBrushingHabits: 0,
    highSugarIntake: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const patientsRef = collection(db, 'patients');
        const snapshot = await getDocs(patientsRef);
        const patients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const newStats = {
          totalPatients: patients.length,
          siswaSD: patients.filter(p => p.category === 'Siswa SD').length,
          umum: patients.filter(p => p.category === 'Umum').length,
          verified: patients.filter(p => p.verification_status === 'verified').length,
          pending: patients.filter(p => p.verification_status !== 'verified').length,
          toothPainYes: patients.filter(p => p.answers?.tooth_pain === 'ya').length,
          bleedingGumsYes: patients.filter(p => p.answers?.bleeding_gums === 'ya').length,
          goodBrushingHabits: patients.filter(p => p.answers?.brushing_frequency === '2x_sehari' || p.answers?.brushing_frequency === 'lebih_dari_2x').length,
          highSugarIntake: patients.filter(p => p.answers?.sugar_intake === 'sering' || p.answers?.sugar_intake === 'sangat_sering').length
        };

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
          <Navigation />
          <div className="container mx-auto p-8">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navigation />
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Analytics</h1>
            <p className="text-gray-600">Ringkasan data survei kesehatan gigi dan mulut</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Pasien"
              value={stats.totalPatients}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Siswa SD"
              value={stats.siswaSD}
              subtitle={`${stats.totalPatients > 0 ? Math.round((stats.siswaSD / stats.totalPatients) * 100) : 0}% dari total`}
              icon="🎒"
              color="green"
            />
            <StatCard
              title="Umum"
              value={stats.umum}
              subtitle={`${stats.totalPatients > 0 ? Math.round((stats.umum / stats.totalPatients) * 100) : 0}% dari total`}
              icon="👨‍👩‍👧‍👦"
              color="purple"
            />
            <StatCard
              title="Terverifikasi"
              value={stats.verified}
              subtitle={`${stats.pending} menunggu`}
              icon="✅"
              color="green"
            />
          </div>

          {/* Health Issues Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Masalah Kesehatan Gigi</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🦷</span>
                    <div>
                      <p className="font-medium">Sakit Gigi</p>
                      <p className="text-sm text-gray-600">{stats.toothPainYes} pasien melaporkan sakit gigi</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {stats.totalPatients > 0 ? Math.round((stats.toothPainYes / stats.totalPatients) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🩸</span>
                    <div>
                      <p className="font-medium">Gusi Berdarah</p>
                      <p className="text-sm text-gray-600">{stats.bleedingGumsYes} pasien mengalami gusi berdarah</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {stats.totalPatients > 0 ? Math.round((stats.bleedingGumsYes / stats.totalPatients) * 100) : 0}%
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Kebiasaan Kesehatan</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🪥</span>
                    <div>
                      <p className="font-medium">Kebiasaan Sikat Gigi Baik</p>
                      <p className="text-sm text-gray-600">{stats.goodBrushingHabits} pasien sikat gigi ≥2x/hari</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {stats.totalPatients > 0 ? Math.round((stats.goodBrushingHabits / stats.totalPatients) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🍭</span>
                    <div>
                      <p className="font-medium">Konsumsi Gula Tinggi</p>
                      <p className="text-sm text-gray-600">{stats.highSugarIntake} pasien sering konsumsi manis</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {stats.totalPatients > 0 ? Math.round((stats.highSugarIntake / stats.totalPatients) * 100) : 0}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/"
                className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">➕</span>
                <div>
                  <p className="font-medium">Tambah Pasien Baru</p>
                  <p className="text-sm text-gray-600">Input data survei baru</p>
                </div>
              </Link>
              
              <Link
                href="/master"
                className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-medium">Lihat Data Master</p>
                  <p className="text-sm text-gray-600">Kelola data pasien</p>
                </div>
              </Link>
              
              <Link
                href="/admin/users"
                className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-medium">Kelola User</p>
                  <p className="text-sm text-gray-600">Manajemen pengguna</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}