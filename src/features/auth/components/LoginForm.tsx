'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, Variants } from 'framer-motion';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login({ email, password });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-md relative z-10"
    >
      {/* Mobile Logo Branding */}
      <motion.div variants={itemVariants} className="mb-12 lg:hidden flex items-center justify-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <span className="text-2xl font-black text-[#070b14]">D</span>
        </div>
        <span className="text-4xl font-black tracking-tighter text-white">DIMO</span>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Iniciar sesión</h2>
        <p className="text-slate-400 text-lg">Qué gusto verte de nuevo.</p>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 flex items-center gap-3 rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-400 border border-rose-500/20 backdrop-blur-md"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemVariants}>
          <label className="mb-2 block text-sm font-semibold text-slate-300" htmlFor="email">
            Correo electrónico
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 backdrop-blur-sm"
              placeholder="tu@correo.com"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="mb-2 block text-sm font-semibold text-slate-300" htmlFor="password">
            Contraseña
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-2xl border border-white/5 bg-white/[0.03] py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-emerald-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-500 px-4 py-4 text-base font-bold text-[#070b14] shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:bg-emerald-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Efecto de brillo */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
            
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <span>Acceder a mi cuenta</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="mt-12 text-center">
        <p className="text-slate-400">
          ¿No tienes una cuenta en DIMO?{' '}
          <Link href="/registro" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-400 after:transition-all hover:after:w-full">
            Crea una ahora
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
