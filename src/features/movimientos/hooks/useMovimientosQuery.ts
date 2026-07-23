'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerMovimientos,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
} from '../services/movimientos.service';
import type { CrearMovimientoInput, ActualizarMovimientoInput } from '../types';

export function useMovimientos() {
  return useQuery({
    queryKey: ['movimientos'],
    queryFn: obtenerMovimientos,
  });
}

export function useCrearMovimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CrearMovimientoInput) => crearMovimiento(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
    },
  });
}

export function useActualizarMovimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarMovimientoInput }) =>
      actualizarMovimiento(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
    },
  });
}

export function useEliminarMovimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eliminarMovimiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
    },
  });
}
