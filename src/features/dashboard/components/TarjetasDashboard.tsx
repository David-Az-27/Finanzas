'use client';

import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/utils';
import { getCardStyle } from '@/features/cuentas/components/CuentasGrid';
import { BankLogo } from '@/components/ui/BankLogo';

interface TarjetaDashboardItem {
  id: string;
  nombre: string;
  institucion: string | null;
  tipo: string;
  limite_credito: number | null;
  dia_corte: number | null;
  dia_pago: number | null;
  saldo: number;
}

interface TarjetasDashboardProps {
  cuentas: TarjetaDashboardItem[];
  isLoading: boolean;
}

export function TarjetasDashboard({ cuentas, isLoading }: TarjetasDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#62aeae] animate-pulse" />
          <div className="h-5 w-40 bg-white/5 backdrop-blur-2xl shadow-xl rounded animate-pulse" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-[220px] rounded-2xl bg-white/5 backdrop-blur-2xl shadow-xl border border-white/10 animate-pulse flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#94A3B8]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tarjetasCredito = cuentas.filter(c => c.tipo === 'tarjeta_credito');

  if (tarjetasCredito.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-[#62aeae]" />
        <h3 className="text-base font-bold text-white">Mis Tarjetas de Crédito</h3>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetasCredito.map((cuenta, index) => {
          const saldoReal = cuenta.saldo || 0;
          const last4 = cuenta.id ? cuenta.id.replace(/[^0-9]/g, '').slice(-4).padStart(4, '0') : '0000';
          const cardStyle = getCardStyle(cuenta.institucion, cuenta.tipo);
          
          const deuda = Math.abs(Math.min(0, saldoReal));
          const limite = cuenta.limite_credito || 1;
          const porcentaje = Math.min((deuda / limite) * 100, 100);

          return (
            <motion.div
              key={cuenta.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="h-full"
            >
              <div className={`group relative overflow-hidden rounded-2xl p-6 h-full min-h-[220px] flex flex-col justify-between shadow-lg border transition-all hover:shadow-xl ${cardStyle.bg}`}>
                
                {/* Chip & Logo */}
                <div className="flex justify-between items-start">
                  <div className="w-11 h-8 bg-gradient-to-br from-amber-100 via-amber-300 to-amber-500 rounded-md opacity-90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] border border-amber-600/50 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-[1px] bg-amber-700/40 absolute"></div>
                    <div className="h-full w-[1px] bg-amber-700/40 absolute"></div>
                  </div>
                  <BankLogo 
                    bankName={cuenta.institucion || cardStyle.brand} 
                    className={cardStyle.descColor} 
                  />
                </div>

                {/* Name & Suffix */}
                <div className="mt-4">
                  <div className="text-lg font-mono text-zinc-300 tracking-[0.2em] mb-1 opacity-80">•••• •••• •••• {last4}</div>
                  <div className="text-sm font-semibold text-white uppercase tracking-widest truncate">{cuenta.nombre}</div>
                </div>

                {/* Balances / Progress */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-zinc-400 mb-2 font-mono">
                    <span className="text-rose-400 font-medium">Deuda: {formatCurrency(deuda)}</span>
                    <span>Límite: {formatCurrency(cuenta.limite_credito || 0)}</span>
                  </div>
                  <Progress value={porcentaje} className="h-1.5 bg-zinc-800/80" indicatorClassName="bg-rose-500" />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 uppercase font-medium">
                    {cuenta.dia_corte ? <span>Corte: Día {cuenta.dia_corte}</span> : <span></span>}
                    {cuenta.dia_pago ? <span>Pago: Día {cuenta.dia_pago}</span> : <span></span>}
                  </div>
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
