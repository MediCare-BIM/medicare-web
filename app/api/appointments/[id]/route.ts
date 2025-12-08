import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Enums } from '@/lib/database.types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { status }: { status: Enums<'appointment_status'> } = await request.json();

  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .eq('doctor_id', user.id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (status === 'cancelled') {
    await supabase.from('notifications').insert({
      doctor_id: user.id,
      appointment_id: appointment.id,
      type: 'cancelled',
    });
  } else if (status === 'confirmed') {
    await supabase.from('notifications').insert({
        doctor_id: user.id,
        appointment_id: appointment.id,
        type: 'updated',
      });
  }

  return NextResponse.json(appointment);
}
