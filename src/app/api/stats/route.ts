import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket } from 'mysql2';

// GET - Statistik dashboard
export async function GET(request: NextRequest) {
  try {
    // Total patients
    const [totalResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM patients'
    );
    
    // Patients by category
    const [categoryResult] = await pool.execute<RowDataPacket[]>(`
      SELECT patient_category, COUNT(*) as count 
      FROM patients 
      GROUP BY patient_category
    `);
    
    // Patients by gender
    const [genderResult] = await pool.execute<RowDataPacket[]>(`
      SELECT gender, COUNT(*) as count 
      FROM patients 
      GROUP BY gender
    `);
    
    // Top provinces
    const [provinceResult] = await pool.execute<RowDataPacket[]>(`
      SELECT province, COUNT(*) as count 
      FROM patients 
      WHERE province IS NOT NULL
      GROUP BY province 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    // Average DMF-T and def-t
    const [avgScores] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        AVG(dmf_total) as avg_dmf,
        AVG(def_total) as avg_def,
        COUNT(CASE WHEN referral_needed = 1 THEN 1 END) as total_referrals
      FROM clinical_checks
    `);
    
    // Recent patients
    const [recentPatients] = await pool.execute<RowDataPacket[]>(`
      SELECT p.id, p.name, p.exam_id, p.created_at, p.province, p.patient_category
      FROM patients p
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    
    return NextResponse.json({
      success: true,
      data: {
        total_patients: totalResult[0].total,
        category_distribution: categoryResult,
        gender_distribution: genderResult,
        top_provinces: provinceResult,
        average_scores: avgScores[0],
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