-- =============================================================
-- FINOVA v0.4.5 — Schema Presupuestos
-- Base de datos: Supabase (PostgreSQL)
-- Ejecutar en: Supabase SQL Editor
-- =============================================================

CREATE TABLE public.presupuestos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  monto        DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  mes_anio     TEXT NOT NULL, -- Formato 'YYYY-MM'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.presupuestos IS 'Presupuestos definidos por el usuario por categoría y mes';

-- Índices de rendimiento
CREATE INDEX idx_presupuestos_user_id ON public.presupuestos(user_id);
CREATE INDEX idx_presupuestos_mes_anio ON public.presupuestos(mes_anio);

-- Constraint: Único presupuesto por categoría y mes para un usuario
ALTER TABLE public.presupuestos
  ADD CONSTRAINT unq_user_categoria_mes
  UNIQUE (user_id, categoria_id, mes_anio);

-- Trigger: auto-actualizar updated_at
CREATE TRIGGER trg_presupuestos_updated_at
  BEFORE UPDATE ON public.presupuestos
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven solo sus presupuestos"
  ON public.presupuestos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propios presupuestos"
  ON public.presupuestos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan solo sus presupuestos"
  ON public.presupuestos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan solo sus presupuestos"
  ON public.presupuestos FOR DELETE
  USING (auth.uid() = user_id);
