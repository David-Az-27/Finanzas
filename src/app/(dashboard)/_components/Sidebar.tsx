'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowRightLeft, Tags, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { LogoutButton } from '@/features/auth';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cuentas', label: 'Cuentas', icon: Wallet },
  { href: '/movimientos', label: 'Movimientos', icon: ArrowRightLeft },
  { href: '/categorias', label: 'Categorías', icon: Tags },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    // Bottom Dock Navbar para Mobile
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl glass-card bg-slate-900/80 p-2 shadow-2xl">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center gap-1 p-2 transition-all"
              >
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-white/10 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-indicator"
                      className="absolute -bottom-1 h-1 w-1 rounded-full bg-emerald-400"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-zinc-300'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  // Sidebar Colapsable para Desktop (usando sticky para flexbox natural)
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-white/5 bg-slate-950 shadow-sm"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Botón de colapsar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-zinc-400 shadow-sm transition-colors hover:bg-slate-700 hover:text-zinc-200 z-50"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Logo */}
      <div className={`flex h-20 items-center border-b border-white/5 px-4 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-emerald text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <span className="text-lg font-bold">D</span>
        </div>
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap text-xl font-bold tracking-tight text-white"
            >
              DIMO
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-2 px-3 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-4 rounded-xl px-3 py-3 transition-all duration-300 ${
                isActive
                  ? 'bg-white/10 text-emerald-400'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Indicador de ruta activa lateral */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              )}

              {/* Tooltip cuando está colapsado */}
              {isCollapsed && (
                <div className="pointer-events-none absolute left-14 opacity-0 transition-opacity group-hover:opacity-100 z-50">
                  <div className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-200 shadow-xl border border-white/10 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <div className={`rounded-xl bg-white/5 p-1 transition-all ${isCollapsed ? 'flex justify-center' : ''}`}>
          {isCollapsed ? (
             <div className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 text-rose-400 transition-colors cursor-pointer" title="Cerrar sesión">
                <LogoutButton />
             </div>
          ) : (
            <LogoutButton />
          )}
        </div>
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 px-2 text-center text-xs font-medium text-slate-500 overflow-hidden whitespace-nowrap"
            >
              DIMO v0.4
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
