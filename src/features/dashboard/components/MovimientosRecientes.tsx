'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from 'lucide-react';

interface MovimientosRecientesProps {
  movimientos: any[];
  isLoading: boolean;
}

export function MovimientosRecientes({ movimientos, isLoading }: MovimientosRecientesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-6 shadow-lg border border-white/10 h-full">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-white font-bold text-base">Movimientos Recientes</CardTitle>
          <p className="text-xs text-zinc-400 font-medium">Últimas transacciones del mes</p>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-white/10" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
              </div>
            ))
          ) : movimientos.length === 0 ? (
            <div className="text-center py-6 text-zinc-400 text-sm">No hay movimientos recientes</div>
          ) : (
            movimientos.map((mov) => {
              const esIngreso = mov.tipo === 'ingreso';
              const esGasto = mov.tipo === 'gasto';
              const Icon = esIngreso ? ArrowUpRight : esGasto ? ArrowDownLeft : ArrowRightLeft;

              return (
                <div
                  key={mov.id}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-transparent p-2 transition-colors hover:border-white/10 hover:bg-transparent"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-105 ${
                        esIngreso
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : esGasto
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-indigo-500/10 text-indigo-500'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white capitalize">
                        {mov.descripcion || mov.categorias?.nombre || 'Movimiento'}
                      </p>
                      <p className="truncate text-xs text-zinc-400 font-medium mt-0.5">
                        {formatDate(mov.fecha)} • {mov.cuentas?.nombre}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p
                      className={`text-sm font-bold tracking-tight tabular-nums ${
                        esIngreso ? 'text-emerald-400' : esGasto ? 'text-white' : 'text-indigo-400'
                      }`}
                    >
                      {esIngreso ? '+' : esGasto ? '-' : ''}
                      {formatCurrency(Number(mov.monto))}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
