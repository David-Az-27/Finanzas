'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowRightLeft, Tags, User, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { LogoutButton } from '@/features/auth';
import { motion } from 'framer-motion';
import { useMonth } from '@/shared/context/MonthContext';
import { format, subMonths, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { QuickAdd } from './QuickAdd';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cuentas', label: 'Cuentas', icon: Wallet },
  { href: '/movimientos', label: 'Control Financiero', icon: Target },
];

export function Navigation() {
  const pathname = usePathname();
  const { selectedMonth, setSelectedMonth } = useMonth();

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-transparent/80 px-4 backdrop-blur-md md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-half-baked-500 text-white shadow-sm">
            <span className="text-lg font-bold">D</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">DIMO</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                  isActive
                    ? 'text-half-baked-50 bg-half-baked-500 font-semibold'
                    : 'text-zinc-400 hover:bg-white/5 backdrop-blur-2xl shadow-xl hover:text-white font-medium'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Month Selector + User / Logout */}
        <div className="flex items-center gap-4">
          <QuickAdd />

          <div className="hidden sm:flex items-center gap-2 bg-white/5 backdrop-blur-2xl shadow-xl rounded-full px-3 py-1.5 border border-white/10 shadow-sm">
            <button 
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-[10px] text-[#62aeae] font-semibold tracking-wider uppercase">Mes</span>
              <span className="text-xs text-white font-medium">{format(selectedMonth, 'MMM yyyy', { locale: es })}</span>
            </div>
            <button 
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 backdrop-blur-2xl shadow-xl text-zinc-400 border border-white/10">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-transparent/90 p-2 backdrop-blur-md shadow-2xl md:hidden">
        <nav className="flex items-center justify-around pb-safe">
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
                  className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-300 ${
                    isActive ? 'text-half-baked-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-indicator"
                      className="absolute -bottom-1 h-1 w-1 rounded-full bg-half-baked-400"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-half-baked-400' : 'text-zinc-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
