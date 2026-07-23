'use client';

import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';
import type { FlujoCajaData } from '../hooks/useDashboardStats';
import * as echarts from 'echarts';

interface FlujoCajaChartProps {
  data: FlujoCajaData[];
  isLoading: boolean;
}

export function FlujoCajaChart({ data, isLoading }: FlujoCajaChartProps) {
  const hayDatos = data && data.length > 0;

  const getOptions = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#ffffff', fontSize: 12 },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        let res = `<div style="font-weight: 600; margin-bottom: 4px;">Día ${params[0].axisValue}</div>`;
        params.forEach((param: any) => {
          res += `<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <span style="color: #94A3B8;">${param.marker} ${param.seriesName}:</span>
            <span style="font-weight: bold; color: #ffffff;">${formatCurrency(param.value)}</span>
          </div>`;
        });
        return res;
      },
    },
    legend: {
      data: ['Ingresos', 'Gastos'],
      textStyle: { color: '#94A3B8', fontSize: 11 },
      top: 0,
      itemWidth: 14,
      itemHeight: 2,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d.dia),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94A3B8',
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
      axisLabel: {
        color: '#94A3B8',
        fontSize: 10,
        formatter: (value: number) => {
          if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
          if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
          return `$${value}`;
        },
      },
    },
    animation: true,
    animationEasing: 'elasticOut',
    animationDuration: 1200,
    series: [
      {
        name: 'Ingresos',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#10B981' }, // Emerald
        itemStyle: { color: '#10B981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ])
        },
        data: data.map((d) => d.ingresos),
      },
      {
        name: 'Gastos',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#6366F1' }, // Indigo
        itemStyle: { color: '#6366F1' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0)' }
          ])
        },
        data: data.map((d) => d.gastos),
      },
      {
        name: 'Ingresos (Proy.)',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#10B981', type: 'dashed' },
        itemStyle: { color: '#10B981' },
        data: data.map((d) => d.ingresosProyectados),
      },
      {
        name: 'Gastos (Proy.)',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, color: '#6366F1', type: 'dashed' },
        itemStyle: { color: '#6366F1' },
        data: data.map((d) => d.gastosProyectados),
      }
    ],
  });

  return (
    <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-4 shadow-lg border border-white/10 h-full flex flex-col">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-white font-semibold text-sm">
          Flujo de Caja
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-0">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#94A3B8]" />
          </div>
        ) : !hayDatos ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
            Sin datos de flujo
          </div>
        ) : (
          <div className="absolute inset-0 mt-1">
            <ReactECharts option={getOptions()} style={{ height: '100%', width: '100%' }} lazyUpdate={true} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
