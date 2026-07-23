'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerPresupuestos, obtenerTodosPresupuestos, upsertPresupuesto } from '../services/presupuestos.service';

export function usePresupuestos(mesAnio: string) {
  return useQuery({
    queryKey: ['presupuestos', mesAnio],
    queryFn: () => obtenerPresupuestos(mesAnio),
  });
}

export function useTodosPresupuestos() {
  return useQuery({
    queryKey: ['presupuestos', 'todos'],
    queryFn: () => obtenerTodosPresupuestos(),
  });
}

export function useUpsertPresupuesto(mesAnio: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { categoria_id: string; monto: number; mes_anio: string }) => 
      upsertPresupuesto(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuestos', mesAnio] });
    },
  });
}
