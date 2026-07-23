'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '../services/auth.service';
import type { LoginInput, RegistroInput } from '../types';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (input: LoginInput) => {
    try {
      setLoading(true);
      setError(null);
      await authService.iniciarSesion(input);
      router.push('/'); // Redirige al dashboard
      router.refresh(); // Refresca los Server Components para obtener la sesión actualizada
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const registro = async (input: RegistroInput) => {
    try {
      setLoading(true);
      setError(null);
      await authService.registrarUsuario(input);
      router.push('/'); // Redirige al dashboard
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.cerrarSesion();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    registro,
    logout,
    loading,
    error,
    setError,
  };
}
