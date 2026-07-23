'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Cuenta } from '@/shared/types';
import * as cuentasService from '../services/cuentas.service';
import type { CrearCuentaInput, ActualizarCuentaInput } from '../types';

export function useCuentas() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cuentasService.obtenerCuentas();
      setCuentas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuentas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (input: CrearCuentaInput) => {
    const nueva = await cuentasService.crearCuenta(input);
    setCuentas((prev) => [...prev, nueva]);
    return nueva;
  };

  const actualizar = async (id: string, input: ActualizarCuentaInput) => {
    const actualizada = await cuentasService.actualizarCuenta(id, input);
    setCuentas((prev) =>
      prev.map((c) => (c.id === id ? actualizada : c))
    );
    return actualizada;
  };

  const eliminar = async (id: string) => {
    await cuentasService.eliminarCuenta(id);
    setCuentas((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    cuentas,
    loading,
    error,
    recargar: cargar,
    crear,
    actualizar,
    eliminar,
  };
}
