import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query as firestoreQuery, where, orderBy, limit as firestoreLimit, startAfter, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// GET - Ambil semua pasien
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const province = searchParams.get('province') || '';
    const category = searchParams.get('category') || '';
    
    // Get all patients from Firebase
    const patientsRef = collection(db, 'patients');
    let query = firestoreQuery(patientsRef, orderBy('exam-date', 'desc'));
    
    if (province) {
      query = firestoreQuery(patientsRef, where('province', '==', province), orderBy('exam-date', 'desc'));
    }
    
    const patientSnapshot = await getDocs(query);
    let patients = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    // Client-side filtering for search and category
    if (search) {
      patients = patients.filter(p => 
        (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
        (p['exam-id'] && p['exam-id'].toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (category) {
      patients = patients.filter(p => p['patient-category'] === category);
    }
    
    // Pagination
    const total = patients.length;
    const offset = (page - 1) * limit;
    const paginatedPatients = patients.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedPatients,
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
    
    // Add patient to Firebase
    const patientsRef = collection(db, 'patients');
    const docRef = await addDoc(patientsRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Patient created successfully',
      data: { id: docRef.id, ...data }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}