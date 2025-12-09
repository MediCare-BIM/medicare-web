
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*, patients(name, avatar_url)")
    .gte("appointment_date", todayStart)
    .lte("appointment_date", todayEnd)
    .order("appointment_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(appointments);
}
