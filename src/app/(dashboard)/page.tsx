'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useDashboardStats,
  StatCards,
  ResumenDistribucionChart,
  PresupuestoVsRealCard,
  PresupuestoVsRealChart,
  ResumenFlujoChart,
  ResumenPagosChart,
  FlujoCajaChart,
  MovimientosRecientes,
  ProximosPagos,
  TarjetasDashboard,
} from '@/features/dashboard';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useMonth } from '@/shared/context/MonthContext';
import type { PeriodoDashboard } from '@/features/dashboard/hooks/useDashboardStats';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
};

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>('mensual');
  const { selectedMonth } = useMonth();
  const alertedRef = useRef<string>("");
  
  const {
    saldoActual,
    ingresosMes,
    gastosMes,
    ahorroEmergencia,
    totalPagos,
    pagosStats,
    gastosTop3,
    distribucionGeneral,
    resumenFlujo,
    resumenGastos,
    resumenPagos,
    resumenIngresos,
    tendenciaGastos,
    flujoCaja,
    listaProximosPagos,
    ultimosMovimientos,
    alertasPresupuesto,
    cuentas,
    isLoading,
  } = useDashboardStats(periodo, selectedMonth);

  useEffect(() => {
    if (!isLoading && alertasPresupuesto && alertasPresupuesto.length > 0) {
      const alertKey = alertasPresupuesto.join('|') + periodo + selectedMonth.toISOString();
      if (alertedRef.current !== alertKey) {
        alertedRef.current = alertKey;
        alertasPresupuesto.forEach((msg, index) => {
          setTimeout(() => {
            let toastType: 'success' | 'error' | 'default' = 'default';
            let title = 'Información';
            
            if (msg.includes('Felicidades')) {
              toastType = 'success';
              title = '¡Meta Alcanzada!';
            } else if (msg.includes('excedido')) {
              toastType = 'error';
              title = 'Presupuesto Excedido';
            } else if (msg.includes('Atención')) {
              toastType = 'default';
              title = 'Alerta de Presupuesto';
            }

            const options = {
              description: msg.replace(/^(⚠️|❌|✅)\s*/, ''), // Remover el emoji del mensaje ya que Sonner pone su propio icono
              position: 'bottom-right' as const,
              dismissible: true,
              duration: 5000,
            };

            if (toastType === 'default') {
               toast(title, { ...options, icon: '⚠️' });
            } else {
               toast[toastType](title, options);
            }
          }, index * 400);
        });
      }
    }
  }, [alertasPresupuesto, isLoading, periodo, selectedMonth]);

  const mesActual = format(selectedMonth, 'MMMM yyyy', { locale: es }).toUpperCase();

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Header: Mes + Título + Filtros ── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {mesActual}
          </h1>
          <div className="hidden sm:block">
            <p className="text-sm text-zinc-400">Resumen financiero y métricas</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoDashboard)} className="w-[300px] sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border border-white/5">
              <TabsTrigger value="mensual" className="text-xs data-[state=active]:bg-white/5 backdrop-blur-2xl shadow-xl">Mensual</TabsTrigger>
              <TabsTrigger value="q1" className="text-xs data-[state=active]:bg-white/5 backdrop-blur-2xl shadow-xl">Quincena 1</TabsTrigger>
              <TabsTrigger value="q2" className="text-xs data-[state=active]:bg-white/5 backdrop-blur-2xl shadow-xl">Quincena 2</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* ── Main Layout (Left Sidebar + Right Content) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* COLUMNA IZQUIERDA (1/4) */}
        <motion.div variants={itemVariants} className="col-span-1 flex flex-col gap-6">
          <div className="min-h-[300px]">
            <PresupuestoVsRealCard
              porcentajeAhorro={{presupuesto: 0, real: 0}}
              pagosStats={pagosStats}
              gastosTop3={gastosTop3}
              isLoading={isLoading}
            />
          </div>
          <div className="flex-1 min-h-[250px]">
            <ProximosPagos pagos={listaProximosPagos} isLoading={isLoading} />
          </div>
        </motion.div>

        {/* COLUMNA DERECHA (3/4) */}
        <motion.div variants={itemVariants} className="col-span-1 xl:col-span-3 flex flex-col gap-6">
          
          {/* Fila 1: KPIs */}
          <div className="w-full">
            <StatCards
              saldoActual={saldoActual}
              ingresosMes={ingresosMes}
              gastosMes={gastosMes}
              ahorroEmergencia={ahorroEmergencia}
              totalPagos={totalPagos}
              isLoading={isLoading}
            />
          </div>

          {/* Fila 2: 3 Gráficas pequeñas (Flujo, Gastos, Pagos) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-[250px]">
              <ResumenFlujoChart data={resumenFlujo} isLoading={isLoading} />
            </div>
            <div className="h-[250px]">
              <PresupuestoVsRealChart data={resumenGastos} isLoading={isLoading} />
            </div>
            <div className="h-[250px]">
              <ResumenPagosChart data={resumenPagos} isLoading={isLoading} />
            </div>
          </div>

          {/* Fila 3: 2 Gráficas medianas (Dona, Flujo Caja) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[280px]">
              <ResumenDistribucionChart data={distribucionGeneral} isLoading={isLoading} />
            </div>
            <div className="h-[280px]">
              <FlujoCajaChart data={flujoCaja} isLoading={isLoading} />
            </div>
          </div>

          {/* Fila 4: Movimientos Recientes */}
          <div className="w-full">
            <MovimientosRecientes movimientos={ultimosMovimientos} isLoading={isLoading} />
          </div>

          {/* Tarjetas de Crédito */}
          <TarjetasDashboard cuentas={cuentas} isLoading={isLoading} />

        </motion.div>
      </div>
    </motion.div>
  );
}
