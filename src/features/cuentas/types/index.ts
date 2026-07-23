import type { Cuenta, TipoCuenta } from '@/shared/types';

/** Datos para crear una cuenta nueva */
export interface CrearCuentaInput {
  nombre: string;
  tipo: TipoCuenta;
  es_para_ahorro: boolean;
  institucion?: string;
  tasa_rendimiento?: number;
  limite_credito?: number;
  dia_corte?: number;
  dia_pago?: number;
}

/** Datos para actualizar una cuenta existente */
export interface ActualizarCuentaInput {
  nombre?: string;
  tipo?: TipoCuenta;
  es_para_ahorro?: boolean;
  institucion?: string | null;
  tasa_rendimiento?: number | null;
  limite_credito?: number | null;
  dia_corte?: number | null;
  dia_pago?: number | null;
}

/** Cuenta con saldo calculado (para la UI) */
export interface CuentaConSaldo extends Cuenta {
  saldo: number;
}
