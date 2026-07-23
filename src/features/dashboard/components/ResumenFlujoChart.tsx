'use client';

import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/shared/lib/utils';
import { motion } from 'framer-motion';
import type { ResumenFlujoItem } from '../hooks/useDashboardStats';

interface ResumenFlujoChartProps {
  data: ResumenFlujoItem[];
  isLoading: boolean;
}

export function ResumenFlujoChart({ data, isLoading }: ResumenFlujoChartProps) {
  const getOptions = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      textStyle: { color: '#ffffff' },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        let res = `<div style="font-weight: 600; margin-bottom: 4px;">${params[0].axisValue}</div>`;
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
      data: ['Presupuesto', 'Real'],
      textStyle: { color: '#94A3B8', fontSize: 10 },
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
      splitNumber: 4,
      axisLabel: {
        color: '#94A3B8',
        fontSize: 9,
        hideOverlap: true,
        formatter: (value: number) => {
          if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
          if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
          return `$${value}`;
        },
      },
    },
    yAxis: {
      type: 'category',
      data: data.map((d) => d.concepto),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94A3B8', fontSize: 10, fontWeight: 500 },
      inverse: true,
    },
    animation: true,
    animationEasing: 'elasticOut',
    animationDuration: 1000,
    series: [
      {
        name: 'Presupuesto',
        type: 'bar',
        data: data.map((d) => d.presupuesto),
        itemStyle: { color: '#334155', borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 20,
        barGap: '30%',
      },
      {
        name: 'Real',
        type: 'bar',
        data: data.map((d) => d.real),
        itemStyle: { color: '#62aeae', borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 20,
      },
    ],
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="h-full"
    >
      <Card className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-4 shadow-lg border border-white/10 h-full flex flex-col">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-white font-semibold text-sm">Resumen de Flujo</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 relative min-h-0">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#94A3B8]" />
            </div>
          ) : (
            <div className="absolute inset-0 mt-1">
              <ReactECharts option={getOptions()} style={{ height: '100%', width: '100%' }} lazyUpdate={true} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
