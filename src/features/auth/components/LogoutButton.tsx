'use client';

import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LogoutButton() {
  const { logout, loading } = useAuth();

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Cerrar sesión"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5" />
      )}
      <span>Cerrar sesión</span>
    </button>
  );
}
