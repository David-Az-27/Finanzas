'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, Clock, Trophy } from 'lucide-react';
import type { GastoTopItem, PagosStats } from '../hooks/useDashboardStats';

interface PresupuestoVsRealCardProps {
  porcentajeAhorro: { presupuesto: number; real: number };
  pagosStats: PagosStats;
  gastosTop3: GastoTopItem[];
  isLoading: boolean;
}

const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32'];

export function PresupuestoVsRealCard({
  porcentajeAhorro,
  pagosStats,
  gastosTop3,
  isLoading,
}: PresupuestoVsRealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="h-full"
    >
      <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-6 shadow-lg border border-white/10 h-full flex flex-col">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-white font-bold text-base">
            Presupuesto vs Real
          </CardTitle>
          <p className="text-xs text-zinc-400 font-medium">Comparación</p>
        </CardHeader>
        <CardContent className="flex-1 p-0 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-white/10" />
              ))}
            </div>
          ) : (
            <>
              {/* ── Pagos ── */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pagos</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-transparent border border-white/10 p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase">Pagados</p>
                      <p className="text-lg font-bold text-white">{pagosStats.pagados}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-transparent border border-white/10 p-3">
                    <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase">Pendientes</p>
                      <p className="text-lg font-bold text-white">{pagosStats.pendientes}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Gastos más altos ── */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Gastos más altos</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">Ranking</p>
                <div className="space-y-2">
                  {gastosTop3.map((item, i) => (
                    <div
                      key={item.nombre}
                      className="flex items-center justify-between rounded-lg bg-transparent border border-white/10 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#0B1120]"
                          style={{ backgroundColor: MEDAL_COLORS[i] || '#94A3B8' }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-white truncate capitalize">
                          {item.nombre}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-zinc-400 tabular-nums whitespace-nowrap ml-2">
                        {formatCurrency(item.monto)}
                      </span>
                    </div>
                  ))}
                  {gastosTop3.length === 0 && (
                    <p className="text-xs text-zinc-400 text-center py-2">Sin gastos</p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
