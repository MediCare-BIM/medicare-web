import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Tables } from '@/lib/database.types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter'); // 'future' or 'past'

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let query = supabase
    .from('appointments')
    .select('*, patients (*)')
    .eq('doctor_id', user.id);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  if (filter === 'future') {
    query = query.gte('scheduled_at', now.toISOString());
  } else if (filter === 'past') {
    query = query.lt('scheduled_at', now.toISOString());
  } else if (filter === 'today') {
    query = query.gte('scheduled_at', startOfDay).lt('scheduled_at', endOfDay);
  }

  const { data: appointments, error } = await query.order('scheduled_at', { ascending: filter !== 'past' });
console.log('Appointments fetched:', appointments);


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(appointments);
}

type PatientInsert = Tables<'patients'>;

export async function POST(request: Request) {
  const body = await request.json();
  const { patient, scheduled_at, reason }: {
    patient: Omit<PatientInsert, 'id' | 'created_at' | 'updated_at'>;
    scheduled_at: string;
    reason?: string | null;
  } = body;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find patient or create a new one
  let patientId;
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('id')
    .or(`email.eq.${patient.email},phone.eq.${patient.phone}`)
    .single();

  if (existingPatient) {
    patientId = existingPatient.id;
  } else {
    const { data: newPatient, error: patientError } = await supabase
      .from('patients')
      .insert({
        full_name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
      })
      .select('id')
      .single();

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 500 });
    }
    patientId = newPatient.id;
  }

  // Create appointment
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      doctor_id: user.id,
      patient_id: patientId,
      scheduled_at,
      reason,
    })
    .select('*')
    .single();

  if (appointmentError) {
    return NextResponse.json({ error: appointmentError.message }, { status: 500 });
  }

  // Create notification
  await supabase.from('notifications').insert({
    doctor_id: user.id,
    appointment_id: appointment.id,
    type: 'new',
  });

  return NextResponse.json(appointment);
}