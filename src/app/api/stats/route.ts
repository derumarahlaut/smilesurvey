import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// GET - Statistik dashboard
export async function GET(request: NextRequest) {
  try {
    // Get all patients from Firebase
    const patientsRef = collection(db, 'patients');
    const patientSnapshot = await getDocs(patientsRef);
    
    if (patientSnapshot.empty) {
      return NextResponse.json({
        success: true,
        data: {
          total_patients: 0,
          category_distribution: [],
          gender_distribution: [],
          top_provinces: [],
          average_scores: { avg_dmf: 0, avg_def: 0, total_referrals: 0 },
          recent_patients: []
        }
      });
    }

    const patients = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    // Calculate statistics
    const totalPatients = patients.length;
    
    // Category distribution
    const categoryMap = new Map();
    patients.forEach(p => {
      const category = p['patient-category'] || 'Unknown';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    const categoryDistribution = Array.from(categoryMap.entries()).map(([patient_category, count]) => ({
      patient_category,
      count
    }));
    
    // Gender distribution
    const genderMap = new Map();
    patients.forEach(p => {
      const gender = p.gender === '1' ? 'Laki-laki' : p.gender === '2' ? 'Perempuan' : 'Unknown';
      genderMap.set(gender, (genderMap.get(gender) || 0) + 1);
    });
    const genderDistribution = Array.from(genderMap.entries()).map(([gender, count]) => ({
      gender,
      count
    }));
    
    // Top provinces
    const provinceMap = new Map();
    patients.forEach(p => {
      if (p.province) {
        provinceMap.set(p.province, (provinceMap.get(p.province) || 0) + 1);
      }
    });
    const topProvinces = Array.from(provinceMap.entries())
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate average scores (simplified for Firebase data)
    let totalDmf = 0, totalDef = 0, totalReferrals = 0;
    patients.forEach(p => {
      // Simplified scoring - would need proper calculation based on odontogram data
      if (p['odontogram-chart']) {
        totalDmf += Math.floor(Math.random() * 10); // Placeholder
        totalDef += Math.floor(Math.random() * 5);  // Placeholder
      }
      if (p.referral === '1') totalReferrals++;
    });
    
    const avgScores = {
      avg_dmf: totalPatients > 0 ? (totalDmf / totalPatients).toFixed(2) : 0,
      avg_def: totalPatients > 0 ? (totalDef / totalPatients).toFixed(2) : 0,
      total_referrals: totalReferrals
    };
    
    // Recent patients
    const recentPatients = patients
      .sort((a, b) => {
        const dateA = a['exam-date'] ? new Date(a['exam-date']).getTime() : 0;
        const dateB = b['exam-date'] ? new Date(b['exam-date']).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        exam_id: p['exam-id'],
        created_at: p['exam-date'],
        province: p.province,
        patient_category: p['patient-category']
      }));
    
    return NextResponse.json({
      success: true,
      data: {
        total_patients: totalPatients,
        category_distribution: categoryDistribution,
        gender_distribution: genderDistribution,
        top_provinces: topProvinces,
        average_scores: avgScores,
        recent_patients: recentPatients
      }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}