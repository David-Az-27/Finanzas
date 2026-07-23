'use client';

import { Wallet, TrendingUp, TrendingDown, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/shared/lib/utils';

interface StatCardsProps {
  saldoActual: number;
  ingresosMes: number;
  gastosMes: number;
  ahorroEmergencia: number;
  totalPagos: number;
  isLoading: boolean;
}

export function StatCards({
  saldoActual,
  ingresosMes,
  gastosMes,
  ahorroEmergencia,
  totalPagos,
  isLoading,
}: StatCardsProps) {
  const cards = [
    {
      id: 'saldo',
      label: 'Saldo Disponible',
      subtitle: 'Dinero Disponible',
      value: saldoActual,
      icon: Wallet,
      gradient: 'bg-[#62aeae]/10 text-[#62aeae] border border-[#62aeae]/20',
      shadow: 'shadow-[0_0_15px_rgba(98,174,174,0.15)]',
    },
    {
      id: 'ingresos',
      label: 'Ingresos',
      subtitle: 'Ingresos Reales',
      value: ingresosMes,
      icon: TrendingUp,
      gradient: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    },
    {
      id: 'gastos',
      label: 'Gastos (Consumo)',
      subtitle: 'Gastos Variables',
      value: gastosMes,
      icon: TrendingDown,
      gradient: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    },
    {
      id: 'ahorro',
      label: 'Ahorro Emergencia',
      subtitle: 'Histórico',
      value: ahorroEmergencia,
      icon: Shield,
      gradient: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    },
    {
      id: 'pagos',
      label: 'Pagos Fijos',
      subtitle: 'Cuotas y Servicios',
      value: totalPagos,
      icon: CreditCard,
      gradient: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
          >
            <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-6 shadow-lg border border-white/10 group relative overflow-hidden h-full">
              <CardContent className="p-0 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      {card.label}
                    </p>
                    <p className="text-[10px] font-medium text-zinc-400">{card.subtitle}</p>
                    {isLoading ? (
                      <div className="h-7 w-24 animate-pulse rounded-md bg-white/10 mt-2" />
                    ) : (
                      <p className="text-xl font-bold tracking-tight text-white mt-2">
                        {formatCurrency(card.value)}
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.gradient} ${card.shadow} transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
