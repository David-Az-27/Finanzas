-- =============================================================
-- FINOVA v0.1 — Schema Inicial
-- Base de datos: Supabase (PostgreSQL)
-- Ejecutar en: Supabase SQL Editor
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. EXTENSIONES NECESARIAS
-- ─────────────────────────────────────────────────────────────
-- moddatetime se usa para auto-actualizar updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- ─────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────────────────────

-- Tipos de cuenta bancaria / financiera
CREATE TYPE public.tipo_cuenta AS ENUM (
  'efectivo',
  'ahorros',
  'corriente',
  'inversion',
  'bolsillo'
);

-- Tipos de categoría
CREATE TYPE public.tipo_categoria AS ENUM (
  'ingreso',
  'gasto'
);

-- Tipos de movimiento
CREATE TYPE public.tipo_movimiento AS ENUM (
  'ingreso',
  'gasto',
  'transferencia'
);

-- Métodos de pago
CREATE TYPE public.metodo_pago AS ENUM (
  'efectivo',
  'transferencia',
  'tc',   -- tarjeta de crédito
  'td',   -- tarjeta de débito
  'pse'
);

-- ─────────────────────────────────────────────────────────────
-- 2. TABLA: cuentas
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.cuentas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  institucion     TEXT,
  tipo            public.tipo_cuenta NOT NULL,
  tasa_rendimiento DECIMAL(5,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentarios descriptivos
COMMENT ON TABLE  public.cuentas IS 'Cuentas financieras del usuario (bancos, efectivo, inversiones)';
COMMENT ON COLUMN public.cuentas.tasa_rendimiento IS 'Tasa de rendimiento anual en %. Ej: 9.20';

-- Índice para consultas filtradas por usuario
CREATE INDEX idx_cuentas_user_id ON public.cuentas(user_id);

-- Trigger: auto-actualizar updated_at
CREATE TRIGGER trg_cuentas_updated_at
  BEFORE UPDATE ON public.cuentas
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ─────────────────────────────────────────────────────────────
-- 3. TABLA: categorias
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.categorias (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre   TEXT NOT NULL,
  tipo     public.tipo_categoria NOT NULL,
  icono    TEXT  -- Nombre del ícono de lucide-react. Ej: 'wallet', 'car', 'trending-up'
);

COMMENT ON TABLE  public.categorias IS 'Categorías de ingreso y gasto definidas por el usuario';
COMMENT ON COLUMN public.categorias.icono IS 'Nombre del ícono de lucide-react para la UI';

CREATE INDEX idx_categorias_user_id ON public.categorias(user_id);

-- ─────────────────────────────────────────────────────────────
-- 4. TABLA: movimientos
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.movimientos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monto             DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  tipo              public.tipo_movimiento NOT NULL,
  metodo_pago       public.metodo_pago,
  cuenta_id         UUID NOT NULL REFERENCES public.cuentas(id) ON DELETE CASCADE,
  cuenta_destino_id UUID REFERENCES public.cuentas(id) ON DELETE SET NULL,
  categoria_id      UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  fecha             TIMESTAMPTZ NOT NULL DEFAULT now(),
  nota              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.movimientos IS 'Movimientos financieros: ingresos, gastos y transferencias';
COMMENT ON COLUMN public.movimientos.cuenta_destino_id IS 'Solo se usa cuando tipo = transferencia';
COMMENT ON COLUMN public.movimientos.categoria_id IS 'Obligatorio para ingresos/gastos, opcional para transferencias';

-- Índices de rendimiento
CREATE INDEX idx_movimientos_user_id ON public.movimientos(user_id);
CREATE INDEX idx_movimientos_fecha   ON public.movimientos(fecha DESC);
CREATE INDEX idx_movimientos_cuenta  ON public.movimientos(cuenta_id);
CREATE INDEX idx_movimientos_tipo    ON public.movimientos(tipo);

-- Constraint: transferencias deben tener cuenta_destino_id
ALTER TABLE public.movimientos
  ADD CONSTRAINT chk_transferencia_destino
  CHECK (
    (tipo = 'transferencia' AND cuenta_destino_id IS NOT NULL)
    OR
    (tipo <> 'transferencia')
  );

-- Constraint: ingresos y gastos deben tener categoria_id
ALTER TABLE public.movimientos
  ADD CONSTRAINT chk_categoria_requerida
  CHECK (
    (tipo IN ('ingreso', 'gasto') AND categoria_id IS NOT NULL)
    OR
    (tipo = 'transferencia')
  );

-- Trigger: auto-actualizar updated_at
CREATE TRIGGER trg_movimientos_updated_at
  BEFORE UPDATE ON public.movimientos
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ─────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- ── Habilitar RLS en todas las tablas ──
ALTER TABLE public.cuentas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;

-- ── Políticas para: cuentas ──

CREATE POLICY "Usuarios ven solo sus cuentas"
  ON public.cuentas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propias cuentas"
  ON public.cuentas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan solo sus cuentas"
  ON public.cuentas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan solo sus cuentas"
  ON public.cuentas FOR DELETE
  USING (auth.uid() = user_id);

-- ── Políticas para: categorias ──

CREATE POLICY "Usuarios ven solo sus categorias"
  ON public.categorias FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propias categorias"
  ON public.categorias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan solo sus categorias"
  ON public.categorias FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan solo sus categorias"
  ON public.categorias FOR DELETE
  USING (auth.uid() = user_id);

-- ── Políticas para: movimientos ──

CREATE POLICY "Usuarios ven solo sus movimientos"
  ON public.movimientos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propios movimientos"
  ON public.movimientos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan solo sus movimientos"
  ON public.movimientos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan solo sus movimientos"
  ON public.movimientos FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================
-- ✅ Schema creado exitosamente.
-- 
-- Resumen:
--   • 4 Enums: tipo_cuenta, tipo_categoria, tipo_movimiento, metodo_pago
--   • 3 Tablas: cuentas, categorias, movimientos
--   • 12 Políticas RLS (4 por tabla: SELECT, INSERT, UPDATE, DELETE)
--   • 2 Triggers (updated_at automático en cuentas y movimientos)
--   • 6 Índices de rendimiento
--   • 2 CHECK constraints (transferencia→destino, ingreso/gasto→categoría)
-- =============================================================
