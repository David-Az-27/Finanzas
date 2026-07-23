import { createClient } from '@/shared/lib/supabase/client';
import type { Cuenta } from '@/shared/types';
import type { CrearCuentaInput, ActualizarCuentaInput } from '../types';

const supabase = createClient();

export async function obtenerCuentas(): Promise<Cuenta[]> {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Cuenta[];
}

export async function obtenerCuentaPorId(id: string): Promise<Cuenta> {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Cuenta;
}

export async function crearCuenta(input: CrearCuentaInput): Promise<Cuenta> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('cuentas')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Cuenta;
}

export async function actualizarCuenta(
  id: string,
  input: ActualizarCuentaInput
): Promise<Cuenta> {
  const { data, error } = await supabase
    .from('cuentas')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Cuenta;
}

export async function eliminarCuenta(id: string): Promise<void> {
  const { error } = await supabase
    .from('cuentas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
