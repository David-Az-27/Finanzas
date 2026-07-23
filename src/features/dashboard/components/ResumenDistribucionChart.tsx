'use client';

import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import type { DistribucionGeneralItem } from '../hooks/useDashboardStats';

interface ResumenDistribucionChartProps {
  data: DistribucionGeneralItem[];
  isLoading: boolean;
}

const COLORES = ['#8fc8c7', '#f43f5e', '#f59e0b', '#8b5cf6'];
const LABELS_COLOR_MAP: Record<string, string> = {
  Saldo: '#8fc8c7',
  Gastos: '#f43f5e',
  Pagos: '#f59e0b',
  Ahorros: '#8b5cf6',
};

export function ResumenDistribucionChart({ data, isLoading }: ResumenDistribucionChartProps) {
  const hayDatos = data.length > 0;

  const getOptions = () => ({
    backgroundColor: 'transparent',
    legend: { show: false },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#ffffff' },
      formatter: (params: any) => {
        const { name, value, marker } = params;
        const total = data.reduce((acc, curr) => acc + curr.valor, 0);
        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        return `
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${marker} <span style="font-weight: bold;">${name}</span>
            </div>
            <div>
              <span style="font-weight: bold; color: #ffffff;">${formatCurrency(value)}</span>
              <span style="margin-left: 4px; opacity: 0.75; color: #94A3B8;">(${percent}%)</span>
            </div>
          </div>
        `;
      },
    },
    animation: true,
    animationEasing: 'elasticOut',
    animationDuration: 1200,
    series: [
      {
        name: 'Distribución',
        type: 'pie',
        radius: ['35%', '85%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#1E293B',
          borderWidth: 3,
        },
        label: {
          show: true,
          position: 'inside',
          color: '#ffffff',
          fontSize: 9,
          fontWeight: 'bold',
          lineHeight: 14,
          formatter: (params: any) => {
            if (params.percent < 5) return ''; // Ocultar si es muy pequeño
            const value = formatCurrency(params.value);
            return `${params.percent}%\n${value}`;
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item) => ({
          value: item.valor,
          name: item.nombre,
          porcentaje: item.porcentaje,
          itemStyle: { color: LABELS_COLOR_MAP[item.nombre] || COLORES[0] },
        })),
      },
    ],
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="h-full"
    >
      <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-4 shadow-lg border border-white/10 h-full flex flex-col">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-white font-semibold text-sm">
            Resumen de Distribución
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 relative min-h-0">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#94A3B8]" />
            </div>
          ) : !hayDatos ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
              Sin datos disponibles
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex-1 w-full min-h-0">
                <ReactECharts option={getOptions()} style={{ height: '100%', width: '100%' }} lazyUpdate={true} />
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4 z-10 w-full">
                {data.map((item) => (
                  <div key={item.nombre} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: LABELS_COLOR_MAP[item.nombre] || COLORES[0] }}
                    />
                    <span className="text-zinc-400 text-xs font-medium">{item.nombre}</span>
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
