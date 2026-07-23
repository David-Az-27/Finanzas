import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('movimientos').select('*').order('created_at', { ascending: false });
  return NextResponse.json({ data, error });
}
