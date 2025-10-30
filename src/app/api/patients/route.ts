import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Ambil semua pasien
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const province = searchParams.get('province') || '';
    const category = searchParams.get('category') || '';
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, c.dmf_total, c.def_total, c.referral_needed 
      FROM patients p 
      LEFT JOIN clinical_checks c ON p.id = c.patient_id 
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (search) {
      query += ` AND (p.name LIKE ? OR p.exam_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (province) {
      query += ` AND p.province = ?`;
      params.push(province);
    }
    
    if (category) {
      query += ` AND p.patient_category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    
    // Count total
    let countQuery = `SELECT COUNT(*) as total FROM patients p WHERE 1=1`;
    const countParams: any[] = [];
    
    if (search) {
      countQuery += ` AND (p.name LIKE ? OR p.exam_id LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (province) {
      countQuery += ` AND p.province = ?`;
      countParams.push(province);
    }
    
    if (category) {
      countQuery += ` AND p.patient_category = ?`;
      countParams.push(category);
    }
    
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countParams);
    const total = countResult[0].total;
    
    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST - Tambah pasien baru
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert patient
      const patientQuery = `
        INSERT INTO patients (
          exam_id, exam_date, province, city, agency, examiner, recorder,
          patient_category, name, village, district, kecamatan, occupation,
          address, birth_date, gender, phone, email, education,
          school_name, class_level, parent_occupation, parent_education,
          verifier_name, verified_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const patientParams = [
        data.exam_id, data.exam_date, data.province, data.city, 
        data.agency, data.examiner, data.recorder, data.patient_category,
        data.name, data.village, data.district, data.kecamatan, data.occupation,
        data.address, data.birth_date, data.gender, data.phone, data.email,
        data.education, data.school_name, data.class_level, data.parent_occupation,
        data.parent_education, data.verifier_name, data.verified_at
      ];
      
      const [patientResult] = await connection.execute<ResultSetHeader>(patientQuery, patientParams);
      const patientId = patientResult.insertId;
      
      // Insert tooth status if provided
      if (data.tooth_status && Array.isArray(data.tooth_status)) {
        for (const tooth of data.tooth_status) {
          const toothQuery = `
            INSERT INTO tooth_status (patient_id, tooth_number, tooth_type, status_code, status_description)
            VALUES (?, ?, ?, ?, ?)
          `;
          await connection.execute(toothQuery, [
            patientId, tooth.tooth_number, tooth.tooth_type, 
            tooth.status_code, tooth.status_description
          ]);
        }
      }
      
      // Insert clinical checks if provided
      if (data.clinical_checks) {
        const clinicalQuery = `
          INSERT INTO clinical_checks (
            patient_id, dmf_d, dmf_m, dmf_f, dmf_total,
            def_d, def_e, def_f, def_total, bleeding_gums,
            oral_lesion, calculus, debris, referral_needed, referral_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const clinicalParams = [
          patientId, data.clinical_checks.dmf_d || 0, data.clinical_checks.dmf_m || 0,
          data.clinical_checks.dmf_f || 0, data.clinical_checks.dmf_total || 0,
          data.clinical_checks.def_d || 0, data.clinical_checks.def_e || 0,
          data.clinical_checks.def_f || 0, data.clinical_checks.def_total || 0,
          data.clinical_checks.bleeding_gums || false, data.clinical_checks.oral_lesion || false,
          data.clinical_checks.calculus || false, data.clinical_checks.debris || false,
          data.clinical_checks.referral_needed || false, data.clinical_checks.referral_type
        ];
        
        await connection.execute(clinicalQuery, clinicalParams);
      }
      
      await connection.commit();
      connection.release();
      
      return NextResponse.json({
        success: true,
        message: 'Patient created successfully',
        patient_id: patientId
      });
      
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}