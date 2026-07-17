// ─────────────────────────────────────────────────
// Tipos generados a partir del schema de Supabase
// En producción, usar: npx supabase gen types typescript
// ─────────────────────────────────────────────────

export type TipoCuenta = 'efectivo' | 'ahorros' | 'corriente' | 'inversion' | 'bolsillo';
export type TipoCategoria = 'ingreso' | 'gasto';
export type TipoMovimiento = 'ingreso' | 'gasto' | 'transferencia';
export type MetodoPago = 'efectivo' | 'transferencia' | 'tc' | 'td' | 'pse';

export interface Cuenta {
  id: string;
  user_id: string;
  nombre: string;
  institucion: string | null;
  tipo: TipoCuenta;
  tasa_rendimiento: number | null;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  user_id: string;
  nombre: string;
  tipo: TipoCategoria;
  icono: string | null;
}

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
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────
// Database type para Supabase Client tipado
// ─────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      cuentas: {
        Row: Cuenta;
        Insert: Omit<Cuenta, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Cuenta, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      categorias: {
        Row: Categoria;
        Insert: Omit<Categoria, 'id'> & { id?: string };
        Update: Partial<Omit<Categoria, 'id' | 'user_id'>>;
      };
      movimientos: {
        Row: Movimiento;
        Insert: Omit<Movimiento, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Movimiento, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
    Enums: {
      tipo_cuenta: TipoCuenta;
      tipo_categoria: TipoCategoria;
      tipo_movimiento: TipoMovimiento;
      metodo_pago: MetodoPago;
    };
  };
}
