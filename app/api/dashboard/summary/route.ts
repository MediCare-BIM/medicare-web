import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }


  // const [
  //   appointmentsCountData,
  //   highPriorityData,
  //   dailyAvgData
  // ] = await Promise.all([
  //   supabase
  //     .from("appointments")
  //     .select("id", { count: "exact" })
  //     .gte("appointment_date", todayStart)
  //     .lte("appointment_date", todayEnd),

  //   supabase
  //     .from("appointments")
  //     .select("id", { count: "exact" })
  //     .eq("priority", "High")
  //     .gte("appointment_date", todayStart)
  //     .lte("appointment_date", todayEnd),

  //   supabase.rpc("get_daily_appointment_average"),
  // ]);

  // console.log(appointmentsCountData, highPriorityData, dailyAvgData);

  // const { count: appointmentsCount, error: appointmentsError } = appointmentsCountData;
  // const { count: highPriorityCount, error: highPriorityError } = highPriorityData;
  // const { data: dailyAvg, error: dailyAvgError } = dailyAvgData;

  // if (appointmentsError || highPriorityError || dailyAvgError) {
  //   return NextResponse.json({
  //     error: "An error occurred while fetching summary data.",
  //     details: {
  //       appointmentsError: appointmentsError?.message,
  //       highPriorityError: highPriorityError?.message,
  //       dailyAvgError: dailyAvgError?.message,
  //     },
  //   }, { status: 500 });
  // }
  return NextResponse.json({ hello: 'test' });
  // return NextResponse.json({
  //   patientsToday: appointmentsCount ?? 0,
  //   highPriority: highPriorityCount ?? 0,
  //   dailyAverage: dailyAvg ? Number(dailyAvg).toFixed(1) : "0.0",
  // });
}
