'use client';

import { useState } from 'react';

import { Loader2, Wallet, TrendingUp, DollarSign, PiggyBank, Landmark, Trash2, CreditCard, Pencil } from 'lucide-react';
import { useCuentas, useEliminarCuenta } from '../hooks/useCuentasQuery';
import { useMovimientos } from '@/features/movimientos/hooks/useMovimientosQuery';
import { BankLogo } from '@/components/ui/BankLogo';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CuentaForm } from './CuentaForm';
import { formatCurrency } from '@/shared/lib/utils';
import type { Cuenta } from '@/shared/types';
import { motion } from 'framer-motion';

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  efectivo: { icon: DollarSign, label: 'Efectivo', color: 'text-emerald-400', bgColor: 'bg-emerald-950/30' },
  ahorros: { icon: PiggyBank, label: 'Ahorros', color: 'text-blue-400', bgColor: 'bg-blue-950/30' },
  corriente: { icon: Wallet, label: 'Corriente', color: 'text-indigo-400', bgColor: 'bg-indigo-950/30' },
  inversion: { icon: TrendingUp, label: 'Inversión', color: 'text-amber-400', bgColor: 'bg-amber-950/30' },
  bolsillo: { icon: Landmark, label: 'Bolsillo', color: 'text-purple-400', bgColor: 'bg-purple-950/30' },
  tarjeta_credito: { icon: CreditCard, label: 'Tarjeta de Crédito', color: 'text-rose-400', bgColor: 'bg-rose-950/30' },
};

export const getCardStyle = (institucion: string | null, tipo: string) => {
  const inst = (institucion || '').toLowerCase().trim();
  
  if (inst.includes('bancolombia') || inst === 'bc') {
    return {
      bg: 'bg-gradient-to-br from-[#E6C200] via-[#CFA400] to-[#B38000] shadow-xl border border-white/20', // Softer, warmer Bancolombia yellow
      textColor: 'text-black',
      descColor: 'text-black/70',
      brand: 'Bancolombia',
      logoVariant: 'bancolombia'
    };
  }
  if (inst.includes('bogota') || inst === 'bdb' || inst.includes('bogotá')) {
    return {
      bg: 'bg-gradient-to-br from-[#004B8D] via-[#003B73] to-[#001533] shadow-xl border border-blue-400/40',
      textColor: 'text-white',
      descColor: 'text-blue-200',
      brand: 'Banco de Bogotá',
    };
  }
  if (inst.includes('villas') || inst === 'av villas') {
    return {
      bg: 'bg-gradient-to-r from-[#8B0000] via-[#660000] to-[#400000] shadow-xl border border-red-500/30',
      textColor: 'text-white',
      descColor: 'text-red-200',
      brand: 'AV Villas',
    };
  }
  if (inst.includes('nu') || inst.includes('nubank')) {
    return {
      bg: 'bg-gradient-to-tr from-[#54028a] to-[#3a0066] shadow-xl border border-[#c664f4]/30', // Darker Nu Purple
      textColor: 'text-white',
      descColor: 'text-white/80',
      brand: 'Nu',
    };
  }
  
  if (tipo === 'tarjeta_credito') {
    return {
      bg: 'bg-white/10 backdrop-blur-3xl shadow-xl border border-white/20',
      textColor: 'text-white',
      descColor: 'text-zinc-300',
      brand: 'CREDIT CARD',
    };
  }
  return {
    bg: 'bg-black/40 backdrop-blur-2xl shadow-xl border border-white/10',
    textColor: 'text-white',
    descColor: 'text-zinc-400',
    brand: 'DEBIT CARD',
  };
};

export function CuentasGrid() {
  const { data: cuentas, isLoading: loadingCuentas, error } = useCuentas();
  const { data: movimientos = [], isLoading: loadingMovimientos } = useMovimientos();
  const { mutate: eliminarCuenta } = useEliminarCuenta();
  
  const [editingCuenta, setEditingCuenta] = useState<Cuenta | null>(null);

  const isLoading = loadingCuentas || loadingMovimientos;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-6 text-center text-rose-400">
        <p>Error al cargar las cuentas.</p>
      </div>
    );
  }

  if (!cuentas || cuentas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl/50 py-16 text-center shadow-sm">
        <Wallet className="mb-4 h-12 w-12 text-zinc-400" />
        <h3 className="text-lg font-medium text-white">No hay cuentas</h3>
        <p className="mt-1 text-sm text-zinc-400">Comienza creando tu primera cuenta.</p>
      </div>
    );
  }

  const saldoPorCuenta = new Map<string, number>();
  cuentas.forEach(c => saldoPorCuenta.set(c.id, 0));

  movimientos.forEach(m => {
    const monto = Number(m.monto);
    if (m.tipo === 'ingreso') {
      saldoPorCuenta.set(m.cuenta_id, (saldoPorCuenta.get(m.cuenta_id) || 0) + monto);
    } else if (m.tipo === 'gasto') {
      saldoPorCuenta.set(m.cuenta_id, (saldoPorCuenta.get(m.cuenta_id) || 0) - monto);
    } else if (m.tipo === 'transferencia') {
      saldoPorCuenta.set(m.cuenta_id, (saldoPorCuenta.get(m.cuenta_id) || 0) - monto);
      if (m.cuenta_destino_id) {
        saldoPorCuenta.set(m.cuenta_destino_id, (saldoPorCuenta.get(m.cuenta_destino_id) || 0) + monto);
      }
    }
  });

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cuentas.map((cuenta: Cuenta, index: number) => {
        const config = typeConfig[cuenta.tipo] || typeConfig.efectivo;
        const saldoReal = saldoPorCuenta.get(cuenta.id) || 0;
        const last4 = cuenta.id ? cuenta.id.replace(/[^0-9]/g, '').slice(-4).padStart(4, '0') : '0000';
        const cardStyle = getCardStyle(cuenta.institucion, cuenta.tipo);
        
        const isCredit = cuenta.tipo === 'tarjeta_credito';
        const deuda = Math.abs(Math.min(0, saldoReal));
        const limite = cuenta.limite_credito || 1;
        const porcentaje = Math.min((deuda / limite) * 100, 100);

        return (
          <motion.div
            key={cuenta.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="h-full"
          >
            <div className={`group relative overflow-hidden rounded-2xl p-6 h-full min-h-[220px] flex flex-col justify-between shadow-xl transition-all hover:shadow-2xl border ${cardStyle.bg}`}>
              
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
              {isCredit ? (
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
              ) : (
                <div className="mt-6 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Saldo</span>
                    <span className={`text-2xl font-bold font-mono ${saldoReal < 0 ? 'text-rose-400' : 'text-white'}`}>
                      {formatCurrency(saldoReal)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {cuenta.tasa_rendimiento ? (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-sans">
                        <TrendingUp className="h-3 w-3" />
                        +{cuenta.tasa_rendimiento}% TEA
                      </span>
                    ) : (
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/70`}>
                        {config.label}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setEditingCuenta(cuenta)}
                  className="h-8 w-8 text-zinc-400 hover:bg-[#62aeae]/20 hover:text-[#62aeae] rounded-full"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:bg-rose-500/20 hover:text-rose-400 rounded-full" />}>
                    <Trash2 className="h-4 w-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white/5 backdrop-blur-2xl shadow-xl border-slate-700 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar esta cuenta?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Se eliminarán permanentemente los datos de la cuenta "{cuenta.nombre}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-slate-600 hover:bg-zinc-800 text-white">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => eliminarCuenta(cuenta.id)}
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

            </div>
          </motion.div>
        );
      })}
    </div>
      
      {/* Edit Dialog */}
      <Dialog open={!!editingCuenta} onOpenChange={(open) => !open && setEditingCuenta(null)}>
        <DialogContent className="sm:max-w-[500px] bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-white">Editar Cuenta</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Modifica los detalles de tu cuenta, billetera o tarjeta.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {editingCuenta && (
              <CuentaForm 
                initialData={editingCuenta}
                onSuccess={() => setEditingCuenta(null)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
