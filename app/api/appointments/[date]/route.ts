import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfDay, endOfDay, isValid } from 'date-fns'
import { parseISO } from 'date-fns/parseISO'


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { date } = await params;
  const parsedDate = parseISO(date)

  if (!isValid(parsedDate)) {
    return NextResponse.json(
      { error: 'Invalid date format. Use YYYY-MM-DD.' },
      { status: 400 }
    )
  }

  const from = startOfDay(parsedDate).toISOString();
  const to = endOfDay(parsedDate).toISOString();


  const { data: doctorData, error: doctorError } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();


  if (doctorError) {
    return NextResponse.json({ error: doctorError.message }, { status: 500 })
  }

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, start_time, end_time')
    .eq('doctor_id', doctorData.id)
    .lt('start_time', to)
    .gt('end_time', from)


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(appointments)
}
