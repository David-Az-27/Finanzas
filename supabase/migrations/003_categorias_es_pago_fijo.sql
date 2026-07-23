-- =============================================================
-- Migration 003: Agregar campo es_pago_fijo a categorías
-- Permite distinguir entre gastos variables y pagos fijos
-- (Casa, Celular, TV, Seguros, etc.)
-- =============================================================

ALTER TABLE public.categorias
  ADD COLUMN es_pago_fijo BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.categorias.es_pago_fijo
  IS 'true = pago fijo recurrente (renta, servicios, suscripciones). false = gasto variable.';
