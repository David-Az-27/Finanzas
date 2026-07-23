-- =============================================================
-- Migration 005: Agregar flag es_para_ahorro a cuentas
-- Permite al usuario designar estrictamente qué cuenta cuenta como ahorro
-- independientemente de su tipo bancario.
-- =============================================================

ALTER TABLE public.cuentas
  ADD COLUMN es_para_ahorro BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.cuentas.es_para_ahorro
  IS 'Indica si el saldo de esta cuenta se considera "Ahorro Total" (true) o "Disponible" (false).';
