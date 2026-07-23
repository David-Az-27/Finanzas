'use client';

import { useState, useEffect, useCallback } from 'react';
import * as movimientosService from '../services/movimientos.service';
import type {
  Movimiento,
  CrearMovimientoInput,
  ActualizarMovimientoInput,
} from '../types';

export function useMovimientos(cuentaId?: string) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movimientosService.obtenerMovimientos();
      const filtered = cuentaId ? data.filter(m => m.cuenta_id === cuentaId) : data;
      setMovimientos(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }, [cuentaId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (input: CrearMovimientoInput) => {
    const nuevo = await movimientosService.crearMovimiento(input);
    // Recargar para obtener las relaciones
    await cargar();
    return nuevo;
  };

  const actualizar = async (id: string, input: ActualizarMovimientoInput) => {
    const actualizado = await movimientosService.actualizarMovimiento(id, input);
    await cargar();
    return actualizado;
  };

  const eliminar = async (id: string) => {
    await movimientosService.eliminarMovimiento(id);
    setMovimientos((prev) => prev.filter((m) => m.id !== id));
  };

  return {
    movimientos,
    loading,
    error,
    recargar: cargar,
    crear,
    actualizar,
    eliminar,
  };
}
