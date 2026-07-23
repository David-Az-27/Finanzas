import type { Categoria, TipoCategoria } from '@/shared/types';

/** Datos para crear una categoría nueva */
export interface CrearCategoriaInput {
  nombre: string;
  tipo: TipoCategoria;
  icono?: string;
  es_pago_fijo?: boolean;
  dia_pago?: number | null;
}

/** Datos para actualizar una categoría existente */
export interface ActualizarCategoriaInput {
  nombre?: string;
  tipo?: TipoCategoria;
  icono?: string | null;
  es_pago_fijo?: boolean;
  dia_pago?: number | null;
}

/** Re-exportar para comodidad */
export type { Categoria, TipoCategoria };
