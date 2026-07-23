'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Categoria } from '@/shared/types';
import * as categoriasService from '../services/categorias.service';
import type { CrearCategoriaInput, ActualizarCategoriaInput } from '../types';

export function useCategorias(tipo?: 'ingreso' | 'gasto') {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = tipo
        ? await categoriasService.obtenerCategoriasPorTipo(tipo)
        : await categoriasService.obtenerCategorias();
      setCategorias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (input: CrearCategoriaInput) => {
    const nueva = await categoriasService.crearCategoria(input);
    setCategorias((prev) => [...prev, nueva]);
    return nueva;
  };

  const actualizar = async (id: string, input: ActualizarCategoriaInput) => {
    const actualizada = await categoriasService.actualizarCategoria(id, input);
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? actualizada : c))
    );
    return actualizada;
  };

  const eliminar = async (id: string) => {
    await categoriasService.eliminarCategoria(id);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    categorias,
    loading,
    error,
    recargar: cargar,
    crear,
    actualizar,
    eliminar,
  };
}
