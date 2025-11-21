import { createClient } from '@/lib/supabase/server';
import { JwtPayload } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<JwtPayload | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect('/auth/login');
  }

  return data.claims;
}
