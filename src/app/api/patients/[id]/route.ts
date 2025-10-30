import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET - Ambil detail pasien berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get patient data
    const patientQuery = `
      SELECT p.*, c.* 
      FROM patients p 
      LEFT JOIN clinical_checks c ON p.id = c.patient_id 
      WHERE p.id = ?
    `;
    
    const [patientRows] = await pool.execute<RowDataPacket[]>(patientQuery, [id]);
    
    if (patientRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    const patient = patientRows[0];
    
    // Get tooth status
    const toothQuery = `
      SELECT * FROM tooth_status 
      WHERE patient_id = ? 
      ORDER BY tooth_number
    `;
    
    const [toothRows] = await pool.execute<RowDataPacket[]>(toothQuery, [id]);
    
    return NextResponse.json({
      success: true,
      data: {
        ...patient,
        tooth_status: toothRows
      }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT - Update data pasien
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update patient
      const patientQuery = `
        UPDATE patients SET 
          exam_id = ?, exam_date = ?, province = ?, city = ?, 
          agency = ?, examiner = ?, recorder = ?, patient_category = ?,
          name = ?, village = ?, district = ?, kecamatan = ?, 
          occupation = ?, address = ?, birth_date = ?, gender = ?,
          phone = ?, email = ?, education = ?, school_name = ?,
          class_level = ?, parent_occupation = ?, parent_education = ?,
          verifier_name = ?, verified_at = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const patientParams = [
        data.exam_id, data.exam_date, data.province, data.city,
        data.agency, data.examiner, data.recorder, data.patient_category,
        data.name, data.village, data.district, data.kecamatan,
        data.occupation, data.address, data.birth_date, data.gender,
        data.phone, data.email, data.education, data.school_name,
        data.class_level, data.parent_occupation, data.parent_education,
        data.verifier_name, data.verified_at, id
      ];
      
      await connection.execute(patientQuery, patientParams);
      
      // Update tooth status if provided
      if (data.tooth_status && Array.isArray(data.tooth_status)) {
        // Delete existing tooth status
        await connection.execute('DELETE FROM tooth_status WHERE patient_id = ?', [id]);
        
        // Insert new tooth status
        for (const tooth of data.tooth_status) {
          const toothQuery = `
            INSERT INTO tooth_status (patient_id, tooth_number, tooth_type, status_code, status_description)
            VALUES (?, ?, ?, ?, ?)
          `;
          await connection.execute(toothQuery, [
            id, tooth.tooth_number, tooth.tooth_type,
            tooth.status_code, tooth.status_description
          ]);
        }
      }
      
      // Update clinical checks if provided
      if (data.clinical_checks) {
        const clinicalQuery = `
          INSERT INTO clinical_checks (
            patient_id, dmf_d, dmf_m, dmf_f, dmf_total,
            def_d, def_e, def_f, def_total, bleeding_gums,
            oral_lesion, calculus, debris, referral_needed, referral_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            dmf_d = VALUES(dmf_d), dmf_m = VALUES(dmf_m), dmf_f = VALUES(dmf_f),
            dmf_total = VALUES(dmf_total), def_d = VALUES(def_d), def_e = VALUES(def_e),
            def_f = VALUES(def_f), def_total = VALUES(def_total),
            bleeding_gums = VALUES(bleeding_gums), oral_lesion = VALUES(oral_lesion),
            calculus = VALUES(calculus), debris = VALUES(debris),
            referral_needed = VALUES(referral_needed), referral_type = VALUES(referral_type),
            updated_at = NOW()
        `;
        
        const clinicalParams = [
          id, data.clinical_checks.dmf_d || 0, data.clinical_checks.dmf_m || 0,
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
        message: 'Patient updated successfully'
      });
      
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pasien
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM patients WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}