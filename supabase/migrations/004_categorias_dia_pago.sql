-- =============================================================
-- Migration 004: Agregar campo dia_pago a categorías
-- Permite especificar el día exacto de pago para gastos fijos
-- =============================================================

ALTER TABLE public.categorias
  ADD COLUMN dia_pago INTEGER CHECK (dia_pago >= 1 AND dia_pago <= 31);

COMMENT ON COLUMN public.categorias.dia_pago
  IS 'Día del mes (1-31) en que se debe realizar el pago fijo. Null si es gasto variable.';
