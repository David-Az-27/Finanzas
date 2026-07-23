import { createClient } from '@/shared/lib/supabase/client';

export interface Presupuesto {
  id: string;
  user_id: string;
  categoria_id: string;
  monto: number;
  mes_anio: string;
  created_at: string;
  updated_at: string;
  categorias?: {
    id: string;
    nombre: string;
    icono: string;
    tipo: string;
    es_pago_fijo: boolean;
    dia_pago: number | null;
  };
}

export interface CrearPresupuestoInput {
  categoria_id: string;
  monto: number;
  mes_anio: string;
}

export async function obtenerPresupuestos(mesAnio: string): Promise<Presupuesto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('presupuestos')
    .select(`
      *,
      categorias (id, nombre, icono, tipo, es_pago_fijo, dia_pago)
    `)
    .eq('mes_anio', mesAnio);

  if (error) {
    console.error('Error obteniendo presupuestos:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error('No se pudieron cargar los presupuestos: ' + error.message);
  }

  return data as Presupuesto[];
}

export async function obtenerTodosPresupuestos(): Promise<Presupuesto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('presupuestos')
    .select(`
      *,
      categorias (id, nombre, icono, tipo, es_pago_fijo, dia_pago)
    `);

  if (error) {
    console.error('Error obteniendo todos los presupuestos:', error);
    throw new Error('No se pudieron cargar los presupuestos');
  }

  return data as Presupuesto[];
}

export async function upsertPresupuesto(input: CrearPresupuestoInput): Promise<Presupuesto> {
  const supabase = createClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('No autorizado');

  const payload = {
    user_id: userData.user.id,
    categoria_id: input.categoria_id,
    monto: input.monto,
    mes_anio: input.mes_anio,
  };

  const { data, error } = await supabase
    .from('presupuestos')
    .upsert(payload, { onConflict: 'user_id, categoria_id, mes_anio' })
    .select()
    .single();

  if (error) {
    console.error('Error al guardar presupuesto:', error);
    throw new Error('No se pudo guardar el presupuesto');
  }

  return data as Presupuesto;
}
