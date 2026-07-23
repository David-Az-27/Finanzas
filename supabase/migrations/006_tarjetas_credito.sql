-- =============================================================
-- FINOVA v0.6 — Tarjetas de Crédito y Cuotas
-- =============================================================

-- 1. Añadir 'tarjeta_credito' al ENUM tipo_cuenta
ALTER TYPE public.tipo_cuenta ADD VALUE IF NOT EXISTS 'tarjeta_credito';

-- 2. Añadir campos a la tabla cuentas
ALTER TABLE public.cuentas 
ADD COLUMN IF NOT EXISTS limite_credito DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS dia_corte INT,
ADD COLUMN IF NOT EXISTS dia_pago INT;

-- 3. Añadir metadato de cuotas a movimientos
ALTER TABLE public.movimientos 
ADD COLUMN IF NOT EXISTS cuotas INT DEFAULT 1;

COMMENT ON COLUMN public.cuentas.limite_credito IS 'Límite máximo de la tarjeta de crédito';
COMMENT ON COLUMN public.cuentas.dia_corte IS 'Día del mes en que cierra la facturación (1-31)';
COMMENT ON COLUMN public.cuentas.dia_pago IS 'Día límite de pago (1-31)';
COMMENT ON COLUMN public.movimientos.cuotas IS 'Número de cuotas de una compra';
