import { createClient } from '@/shared/lib/supabase/client';
import type { LoginInput, RegistroInput } from '../types';

const supabase = createClient();

/**
 * Inicia sesión con correo y contraseña.
 */
export async function iniciarSesion({ email, password }: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
    }
    throw new Error(error.message);
  }

  return data;
}

/**
 * Registra un nuevo usuario con correo y contraseña.
 */
export async function registrarUsuario({ email, password }: RegistroInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      throw new Error('El usuario ya está registrado con este correo.');
    }
    throw new Error(error.message);
  }

  return data;
}

/**
 * Cierra la sesión actual.
 */
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
