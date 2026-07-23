'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, CalendarDays } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/utils';
import type { ProximoPagoItem } from '../hooks/useDashboardStats';

interface ProximosPagosProps {
  pagos: ProximoPagoItem[];
  isLoading: boolean;
}

export function ProximosPagos({ pagos, isLoading }: ProximosPagosProps) {
  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-6 shadow-lg border border-white/10 h-full flex flex-col">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-white font-bold text-base flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-zinc-400" />
            Próximos Pagos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#94A3B8]" />
        </CardContent>
      </Card>
    );
  }

  // Ordenar: vencidos primero, luego próximos, luego pendientes, luego pagados
  const orden = { vencido: 0, proximo: 1, pendiente: 2, pagado: 3 };
  const pagosOrdenados = [...pagos].sort((a, b) => orden[a.estado] - orden[b.estado]);

  return (
    <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-6 shadow-lg border border-white/10 h-full flex flex-col">
      <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4">
        <CardTitle className="text-white font-bold text-base flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#62aeae]" />
          Próximos Pagos
        </CardTitle>
        <p className="text-xs text-zinc-400 font-medium mt-1">
          Estado de tus obligaciones fijas
        </p>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {pagosOrdenados.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-400 text-sm py-8">
            No tienes pagos fijos configurados
          </div>
        ) : (
          <div className="space-y-4">
            {pagosOrdenados.map((pago, i) => {
              let Icon = Clock;
              let colorClass = 'text-zinc-400';
              let bgClass = 'bg-white/10/20';
              let estadoText = pago.dia_pago ? `Día ${pago.dia_pago}` : 'Sin día';

              if (pago.estado === 'pagado') {
                Icon = CheckCircle2;
                colorClass = 'text-emerald-400';
                bgClass = 'bg-emerald-400/10';
                estadoText = 'Pagado';
              } else if (pago.estado === 'vencido') {
                Icon = AlertCircle;
                colorClass = 'text-red-400';
                bgClass = 'bg-red-400/10';
                estadoText = `¡Venció el día ${pago.dia_pago}!`;
              } else if (pago.estado === 'proximo') {
                Icon = Clock;
                colorClass = 'text-amber-400';
                bgClass = 'bg-amber-400/10';
                estadoText = `Próximo (Día ${pago.dia_pago})`;
              }

              return (
                <motion.div
                  key={pago.nombre + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-transparent hover:bg-transparent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgClass}`}>
                      <Icon className={`h-4 w-4 ${colorClass}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{pago.nombre}</p>
                      <p className={`text-xs font-medium ${colorClass}`}>
                        {estadoText}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(pago.monto)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
