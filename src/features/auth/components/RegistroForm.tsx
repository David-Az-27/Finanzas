'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function RegistroForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registro, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await registro({ email, password });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400">
          <span className="text-xl font-bold text-gray-950">F</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-gray-400">
          Únete a Finova y toma el control de tu dinero
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300" htmlFor="email">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-colors"
              placeholder="tu@correo.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300" htmlFor="password">
            Contraseña
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">La contraseña debe tener al menos 6 caracteres.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
