import { createClient } from '@/shared/lib/supabase/client';
import type { Movimiento, CrearMovimientoInput, ActualizarMovimientoInput } from '../types';

export async function obtenerMovimientos(): Promise<Movimiento[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('movimientos')
    .select(`
      *,
      cuentas!movimientos_cuenta_id_fkey(nombre, tipo),
      cuenta_destino:cuentas!movimientos_cuenta_destino_id_fkey(nombre, tipo),
      categorias(nombre, tipo, es_pago_fijo)
    `)
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  
  // Transform the response to match the Movimiento type safely
  return data.map(item => ({
    ...item,
    cuentas: item.cuentas as any,
    cuenta_destino: item.cuenta_destino as any,
    categorias: item.categorias as any
  })) as Movimiento[];
}

export async function crearMovimiento(input: CrearMovimientoInput): Promise<Movimiento> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('movimientos')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Movimiento;
}

export async function actualizarMovimiento(id: string, input: ActualizarMovimientoInput): Promise<Movimiento> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('movimientos')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as Movimiento;
}

export async function eliminarMovimiento(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('movimientos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
