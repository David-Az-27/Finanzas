'use client';

import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PresupuestoData } from '../hooks/useDashboardStats';
import { formatCurrency } from '@/shared/lib/utils';
import { motion } from 'framer-motion';

interface PresupuestoVsRealChartProps {
  data: PresupuestoData[];
  isLoading: boolean;
}

const COLORES = ['#8fc8c7', '#f43f5e', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#6366f1', '#ec4899'];

export function PresupuestoVsRealChart({ data, isLoading }: PresupuestoVsRealChartProps) {
  const hayDatos = data.length > 0;

  const datosMapeados = data
    .filter(d => d.real > 0)
    .map((d, index) => ({
      name: d.categoria,
      value: d.real,
      realValue: d.real,
      presupuestoValue: d.presupuesto,
      itemStyle: { color: COLORES[index % COLORES.length] }
    }));

  const getOptions = () => {

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1E293B',
        borderColor: '#334155',
        textStyle: { color: '#ffffff' },
        formatter: (params: any) => {
          const { name, data, marker } = params;
          const total = datosMapeados.reduce((acc, curr) => acc + curr.value, 0);
          const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
          return `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${marker} <span style="font-weight: bold;">${name}</span>
                <span style="margin-left: 4px; opacity: 0.75; color: #94A3B8;">(${percent}%)</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; gap: 12px;">
                  <span style="color: #94A3B8;">Planificado:</span>
                  <span style="font-weight: bold; color: #ffffff;">${formatCurrency(data.presupuestoValue)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 12px;">
                  <span style="color: #94A3B8;">Ejecutado (Real):</span>
                  <span style="font-weight: bold; color: #ffffff;">${formatCurrency(data.realValue)}</span>
                </div>
              </div>
            </div>
          `;
        },
      },
      legend: { show: false },
      series: [
        {
          name: 'Resumen de Gastos',
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['50%', '40%'],
          itemStyle: {
            borderRadius: 4, // Bordes redondeados sutiles
            borderColor: '#1E293B', // Separador oscuro para mantener contraste
            borderWidth: 2
          },
          label: {
            show: false // Ocultamos los labels estáticos para que se vea limpio, usamos el tooltip
          },
          data: datosMapeados 
        }
      ]
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="h-full"
    >
      <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-4 shadow-lg border border-white/10 h-full flex flex-col">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-white font-semibold text-sm">Resumen de Gastos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex items-center justify-center">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px] w-full">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#94A3B8]" />
            </div>
          ) : !hayDatos ? (
            <div className="flex items-center justify-center text-zinc-400 text-sm h-[300px] w-full">
              Sin gastos este mes
            </div>
          ) : (
            <div className="w-full h-full min-h-[150px] flex flex-col items-center justify-center">
              <div className="flex-1 w-full min-h-0">
                <ReactECharts option={getOptions()} style={{ height: '100%', width: '100%' }} lazyUpdate={true} />
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4 z-10 w-full pb-2 px-2">
                {datosMapeados.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORES[index % COLORES.length] }}
                    />
                    <span className="text-zinc-400 text-xs font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
