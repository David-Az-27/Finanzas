'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from '../services/categorias.service';
import type { CrearCategoriaInput, ActualizarCategoriaInput } from '../types';
import { toast } from 'sonner';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: obtenerCategorias,
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CrearCategoriaInput) => crearCategoria(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ActualizarCategoriaInput }) =>
      actualizarCategoria(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eliminarCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría eliminada con éxito');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar: ${error.message || 'Intenta de nuevo'}`);
    }
  });
}
