-- Add cuotas column to movimientos
ALTER TABLE movimientos ADD COLUMN cuotas integer DEFAULT 1 NOT NULL;
