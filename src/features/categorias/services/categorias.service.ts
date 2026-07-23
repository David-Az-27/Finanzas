import { createClient } from '@/shared/lib/supabase/client';
import type { Categoria } from '@/shared/types';
import type { CrearCategoriaInput, ActualizarCategoriaInput } from '../types';

const supabase = createClient();

export async function obtenerCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data as Categoria[];
}

export async function obtenerCategoriasPorTipo(
  tipo: 'ingreso' | 'gasto'
): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('tipo', tipo)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data as Categoria[];
}

export async function crearCategoria(input: CrearCategoriaInput): Promise<Categoria> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('categorias')
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Categoria;
}

export async function actualizarCategoria(
  id: string,
  input: ActualizarCategoriaInput
): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Categoria;
}

export async function eliminarCategoria(id: string): Promise<void> {
  // Primero eliminamos los presupuestos asociados (por si la base de datos no tiene ON DELETE CASCADE)
  const { error: errorPresupuestos } = await supabase
    .from('presupuestos')
    .delete()
    .eq('categoria_id', id);

  if (errorPresupuestos) throw errorPresupuestos;

  // Luego eliminamos la categoría
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
