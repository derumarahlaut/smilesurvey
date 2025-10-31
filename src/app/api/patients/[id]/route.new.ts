import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// GET - Ambil detail pasien berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get patient data from Firebase
    const patientRef = doc(db, 'patients', id);
    const patientSnap = await getDoc(patientRef);
    
    if (!patientSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    const patientData = { id: patientSnap.id, ...patientSnap.data() };
    
    return NextResponse.json({
      success: true,
      data: patientData
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT - Update pasien
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Update patient in Firebase
    const patientRef = doc(db, 'patients', id);
    await updateDoc(patientRef, {
      ...data,
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully'
    });
    
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
    
    // Delete patient from Firebase
    const patientRef = doc(db, 'patients', id);
    await deleteDoc(patientRef);
    
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