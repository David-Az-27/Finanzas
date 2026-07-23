export type TipoMovimiento = 'ingreso' | 'gasto' | 'transferencia';
export type MetodoPago = 'efectivo' | 'transferencia' | 'tc' | 'td' | 'pse';

export interface Movimiento {
  id: string;
  user_id: string;
  monto: number;
  tipo: TipoMovimiento;
  metodo_pago: MetodoPago | null;
  cuenta_id: string;
  cuenta_destino_id: string | null;
  categoria_id: string | null;
  fecha: string;
  nota: string | null;
  cuotas: number;
  created_at: string;
  updated_at: string;
  
  cuentas?: { nombre: string; tipo: string };
  cuenta_destino?: { nombre: string; tipo: string };
  categorias?: { nombre: string; tipo: string; es_pago_fijo: boolean };
}

export interface CrearMovimientoInput {
  monto: number;
  tipo: TipoMovimiento;
  metodo_pago?: MetodoPago;
  cuenta_id: string;
  cuenta_destino_id?: string;
  categoria_id?: string;
  fecha: string;
  nota?: string;
  cuotas?: number;
}

export interface ActualizarMovimientoInput extends Partial<CrearMovimientoInput> {}
