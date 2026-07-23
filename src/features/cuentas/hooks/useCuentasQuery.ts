'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerCuentas,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta,
} from '../services/cuentas.service';
import type { CrearCuentaInput, ActualizarCuentaInput } from '../types';

export function useCuentas() {
  return useQuery({
    queryKey: ['cuentas'],
    queryFn: obtenerCuentas,
  });
}

export function useCrearCuenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CrearCuentaInput) => crearCuenta(input),
    onSuccess: () => {
      // Invalida la caché para forzar un refetch
      queryClient.invalidateQueries({ queryKey: ['cuentas'] });
    },
  });
}

export function useActualizarCuenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarCuentaInput }) =>
      actualizarCuenta(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuentas'] });
    },
  });
}

export function useEliminarCuenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eliminarCuenta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuentas'] });
    },
  });
}
