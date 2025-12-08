
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env file.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

const seed = async () => {
  const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
    email: `doctor-${Math.random().toString(36).substring(7)}@example.com`,
    password: 'password',
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating user:', error);
    return;
  }

  console.log('Created user:', user);

  const patients = [];
  for (let i = 0; i < 10; i++) {
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .insert({
        full_name: `Patient ${i}`,
        email: `patient-${i}@example.com`,
        phone: `123-456-789${i}`,
      })
      .select()
      .single();

    if (patientError) {
      console.error('Error creating patient:', patientError);
      return;
    }
    patients.push(patient);
  }

  console.log('Created patients:', patients);

  const appointments = [];
  for (const patient of patients) {
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        doctor_id: user.id,
        patient_id: patient.id,
        scheduled_at: new Date().toISOString(),
        reason: 'Checkup',
        priority: Math.random() > 0.5 ? 'high' : 'medium',
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      return;
    }
    appointments.push(appointment);
  }

  console.log('Created appointments:', appointments);
};

seed();
