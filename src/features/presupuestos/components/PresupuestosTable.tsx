'use client';

import { useState } from 'react';
import { useCategorias, useActualizarCategoria } from '@/features/categorias/hooks/useCategoriasQuery';
import { usePresupuestos, useUpsertPresupuesto } from '@/features/dashboard/hooks/usePresupuestosQuery';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useMonth } from '@/shared/context/MonthContext';
import { formatCurrency } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { Loader2, Check, Target, Pencil, Wallet, Receipt, Scale, AlertTriangle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AbonarGastoFijoDialog } from './AbonarGastoFijoDialog';

export function PresupuestosTable() {
  const { selectedMonth } = useMonth();
  const mesAnio = format(selectedMonth, 'yyyy-MM');
  const { data: categorias = [], isLoading: loadingCat } = useCategorias();
  const { data: presupuestos = [], isLoading: loadingPres } = usePresupuestos(mesAnio);
  const { mutateAsync: upsertPresupuesto } = useUpsertPresupuesto(mesAnio);
  const { mutateAsync: actualizarCategoria } = useActualizarCategoria();

  const stats = useDashboardStats('mensual', selectedMonth);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editDiaPago, setEditDiaPago] = useState<string>('');
  const [editModo, setEditModo] = useState<'consumo' | 'fijo'>('consumo');
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = loadingCat || loadingPres || stats.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const virtualTdcCats = stats.cuentas
    .filter(c => c.tipo === 'tarjeta_credito')
    .map(c => {
      const pagoStats = stats.resumenPagos.find(p => p.categoria === `Pago Tarjeta ${c.nombre}`);
      if (!pagoStats) return null;

      const pagosMes = pagoStats.real;
      const deudaInicial = pagoStats.presupuesto;

      return {
        id: `tdc-${c.id}`,
        nombre: `Pago Tarjeta ${c.nombre}`,
        icono: '💳',
        tipo: 'gasto',
        es_pago_fijo: true,
        dia_pago: c.dia_pago,
        isVirtualTdc: true,
        montoActual: deudaInicial,
        ejecutado: pagosMes
      };
    })
    .filter(vc => vc !== null && vc.montoActual > 0);

  const gastosFijos = [
    ...categorias.filter(c => c.tipo === 'gasto' && c.es_pago_fijo),
    ...virtualTdcCats
  ];
  
  const gastosVariables = categorias.filter(c => c.tipo === 'gasto' && !c.es_pago_fijo);
  const categoriasIngreso = categorias.filter(c => c.tipo === 'ingreso');

  const totalPresupuesto = stats.resumenGastos.reduce((a, b) => a + b.presupuesto, 0) + stats.resumenPagos.reduce((a, b) => a + b.presupuesto, 0);
  const totalEjecutado = stats.resumenGastos.reduce((a, b) => a + b.real, 0) + stats.resumenPagos.reduce((a, b) => a + b.real, 0);
  const totalDisponible = totalPresupuesto - totalEjecutado;

  const handleEditClick = (catId: string, currentAmount: number, currentDia: number | null, esPagoFijo: boolean) => {
    setEditingCatId(catId);
    setEditValue(currentAmount > 0 ? currentAmount.toString() : '');
    setEditDiaPago(currentDia ? currentDia.toString() : '');
    setEditModo(esPagoFijo ? 'fijo' : 'consumo');
  };

  const handleSave = async (cat: any) => {
    setIsSaving(true);
    try {
      const monto = Number(editValue) || 0;
      await upsertPresupuesto({
        categoria_id: cat.id,
        monto: monto,
        mes_anio: mesAnio,
      });
      
      const esFijo = editModo === 'fijo';
      const dia = esFijo ? (Number(editDiaPago) || null) : null;
      
      if (esFijo !== cat.es_pago_fijo || dia !== cat.dia_pago) {
        await actualizarCategoria({
          id: cat.id,
          input: { 
            es_pago_fijo: esFijo,
            dia_pago: dia 
          }
        });
      }
      
      setEditingCatId(null);
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTableSection = (cats: any[], titulo: string) => (
    <div className="mb-10 last:mb-0">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
        {titulo}
        <span className="text-xs font-medium text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">{cats.length}</span>
      </h3>
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-zinc-500 text-[10px] font-semibold uppercase tracking-[0.2em]">
                <th className="py-4 px-4">Categoría</th>
                <th className="py-4 px-4">Planificado</th>
                <th className="py-4 px-4">Ejecutado</th>
                <th className="py-4 px-4">Disponible</th>
                <th className="py-4 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {cats.map((cat) => {
                let montoActual = 0;
                let ejecutado = 0;

                if (cat.isVirtualTdc) {
                  montoActual = cat.montoActual;
                  ejecutado = cat.ejecutado;
                } else {
                  if (cat.tipo === 'gasto') {
                    if (cat.es_pago_fijo) {
                      const g = stats.resumenPagos.find(g => g.categoria === cat.nombre);
                      montoActual = g ? g.presupuesto : 0;
                      ejecutado = g ? g.real : 0;
                    } else {
                      const g = stats.resumenGastos.find(g => g.categoria === cat.nombre);
                      montoActual = g ? g.presupuesto : 0;
                      ejecutado = g ? g.real : 0;
                    }
                  } else {
                    const g = stats.resumenIngresos.find(g => g.categoria === cat.nombre);
                    montoActual = g ? g.presupuesto : 0;
                    ejecutado = g ? g.real : 0;
                  }
                }

                const disponible = montoActual - ejecutado;
                const isEditing = editingCatId === cat.id;

                const porcentaje = montoActual > 0 ? (ejecutado / montoActual) * 100 : 0;
                
                let progressColor = "bg-[#62aeae]"; // Color primario elegante
                let disponibleLabel = "Disponible";
                let disponibleValue = disponible;
                let disponibleColor = "text-zinc-300";
                let showWarning = false;

                if (cat.tipo === 'gasto') {
                  if (cat.es_pago_fijo) {
                    if (ejecutado === 0 && montoActual > 0) {
                      progressColor = "bg-white/10"; // Vacío
                      disponibleLabel = "Pendiente";
                      disponibleValue = montoActual;
                      disponibleColor = "text-zinc-400";
                    } else if (ejecutado < montoActual) {
                      progressColor = "bg-[#62aeae]/70"; // En proceso
                      disponibleLabel = "Restante";
                      disponibleValue = disponible;
                      disponibleColor = "text-zinc-300";
                    } else if (ejecutado === montoActual) {
                      progressColor = "bg-emerald-500/60"; // Pagado completo
                      disponibleLabel = "Pagado";
                      disponibleValue = 0;
                      disponibleColor = "text-emerald-400/80";
                    } else {
                      progressColor = "bg-emerald-400"; // Adelanto o abono extra
                      disponibleLabel = "Adelanto / Extra";
                      disponibleValue = Math.abs(disponible);
                      disponibleColor = "text-emerald-300 font-bold";
                    }
                    
                    // Lógica de MORA
                    if (cat.dia_pago && ejecutado < montoActual && montoActual > 0) {
                      const today = new Date();
                      // Only check mora if the selected month is current or past
                      const isCurrentOrPastMonth = today >= selectedMonth || (today.getMonth() === selectedMonth.getMonth() && today.getFullYear() === selectedMonth.getFullYear());
                      
                      if (isCurrentOrPastMonth) {
                        const isCurrentMonth = today.getMonth() === selectedMonth.getMonth() && today.getFullYear() === selectedMonth.getFullYear();
                        if (!isCurrentMonth || today.getDate() >= cat.dia_pago) {
                          progressColor = "bg-red-600/80";
                          disponibleLabel = "PAGO EN MORA";
                          disponibleColor = "text-red-400 font-bold animate-pulse";
                          showWarning = true;
                        }
                      }
                    }
                  } else {
                    if (disponible > 0) {
                      disponibleLabel = "Disponible";
                      disponibleValue = disponible;
                      disponibleColor = "text-zinc-300";
                      
                      if (porcentaje > 90) {
                        progressColor = "bg-rose-500/60";
                        disponibleColor = "text-rose-400/80";
                      } else if (porcentaje > 75) {
                        progressColor = "bg-amber-500/60";
                        disponibleColor = "text-amber-400/80";
                      } else {
                        progressColor = "bg-[#62aeae]";
                      }
                    } else if (disponible === 0) {
                      disponibleLabel = "Agotado";
                      disponibleValue = 0;
                      disponibleColor = "text-zinc-400";
                      progressColor = "bg-white/10";
                    } else {
                      disponibleLabel = "Excedido";
                      disponibleValue = Math.abs(disponible);
                      disponibleColor = "text-rose-400/90";
                      progressColor = "bg-rose-500/80";
                      showWarning = true;
                    }
                  }
                } else {
                  if (disponible > 0) {
                    disponibleLabel = "Restante meta";
                    disponibleValue = disponible;
                    disponibleColor = "text-zinc-400";
                  } else if (disponible === 0) {
                    disponibleLabel = "Meta alcanzada";
                    disponibleValue = 0;
                    disponibleColor = "text-emerald-400/80";
                  } else {
                    disponibleLabel = "Superávit";
                    disponibleValue = Math.abs(disponible);
                    disponibleColor = "text-emerald-400/80";
                  }
                }

                return (
                  <tr key={cat.id} className="group transition-all hover:bg-white/[0.02]">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 text-emerald-400/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                          {cat.icono && cat.icono !== '🏷️' ? (
                            <span className="text-lg">{cat.icono}</span>
                          ) : (
                            <Tag className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-semibold text-white capitalize">{cat.nombre}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">
                      {isEditing ? (
                        <div className="flex flex-col gap-3 p-3 bg-black/20 backdrop-blur-md shadow-inner/50 rounded-xl border border-white/10 max-w-lg">
                          <div className="flex flex-wrap items-end gap-3">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Monto</span>
                              <Input
                                type="number"
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-28 bg-black/20 backdrop-blur-md shadow-inner border-white/10 text-white focus:border-[#62aeae]"
                                placeholder="0"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSave(cat);
                                  if (e.key === 'Escape') setEditingCatId(null);
                                }}
                              />
                            </div>
                            
                            {cat.tipo === 'gasto' && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Tipo Control</span>
                                <div className="flex rounded-lg bg-black/20 backdrop-blur-md shadow-inner p-0.5 border border-white/10 h-[36px] items-center">
                                  <button
                                    type="button"
                                    onClick={() => setEditModo('consumo')}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors h-full ${
                                      editModo === 'consumo'
                                        ? 'bg-[#62aeae] text-white'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    Consumo (Sobra)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditModo('fijo')}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors h-full ${
                                      editModo === 'fijo'
                                        ? 'bg-[#62aeae] text-white'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                                  >
                                    Fijo (Falta)
                                  </button>
                                </div>
                              </div>
                            )}

                            {editModo === 'fijo' && cat.tipo === 'gasto' && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Día Pago</span>
                                <Input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={editDiaPago}
                                  onChange={(e) => setEditDiaPago(e.target.value)}
                                  className="w-16 bg-black/20 backdrop-blur-md shadow-inner border-white/10 text-white focus:border-[#62aeae]"
                                  placeholder="1-31"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave(cat);
                                    if (e.key === 'Escape') setEditingCatId(null);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div 
                            className={`flex items-center gap-2 w-fit ${cat.isVirtualTdc ? 'cursor-default' : 'cursor-pointer hover:text-white transition-colors group/edit'}`}
                            onClick={() => !cat.isVirtualTdc && handleEditClick(cat.id, montoActual, cat.dia_pago, cat.es_pago_fijo)}
                          >
                            {montoActual > 0 ? <span className="text-white font-medium">{formatCurrency(montoActual)}</span> : <span className="text-zinc-500 opacity-60 italic font-sans font-normal text-xs">Sin definir</span>}
                            {!cat.isVirtualTdc && (
                              <Pencil className="h-3 w-3 text-emerald-500/50 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                            )}
                          </div>
                          {cat.es_pago_fijo && cat.dia_pago && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] uppercase tracking-wider flex items-center gap-1 font-sans font-semibold ${showWarning ? 'text-red-400' : 'text-zinc-500'}`}>
                                {showWarning ? <AlertTriangle className="h-3 w-3" /> : <Target className="h-3 w-3 opacity-70" />} 
                                Día de pago: {cat.dia_pago}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-zinc-300">
                      {formatCurrency(ejecutado)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`font-mono font-medium ${disponibleColor}`}>
                            {disponibleValue === 0 && disponibleLabel === 'Pagado' ? 'Completado' : formatCurrency(disponibleValue)}
                          </span>
                          {disponibleValue > 0 && (
                            <span className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">
                              {disponibleLabel}
                            </span>
                          )}
                        </div>
                        {montoActual > 0 && cat.tipo === 'gasto' && (
                          <Progress 
                            value={Math.min(porcentaje, 100)} 
                            className="h-1.5 bg-black/40 shadow-inner overflow-hidden" 
                            indicatorClassName={progressColor} 
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {cat.isVirtualTdc ? (
                        <span className="text-xs font-semibold text-zinc-400 bg-black/20 backdrop-blur-md shadow-inner border border-white/10 px-2 py-1 rounded-md">Automático</span>
                      ) : isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingCatId(null)}
                            className="text-zinc-400 hover:text-white hover:bg-white/10"
                            disabled={isSaving}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(cat)}
                            disabled={isSaving}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end items-center gap-1">
                          {cat.es_pago_fijo && !cat.isVirtualTdc && (
                            <AbonarGastoFijoDialog 
                              categoriaId={cat.id} 
                              categoriaNombre={cat.nombre} 
                              montoRecomendado={Math.max(0, montoActual - ejecutado)}
                            />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(cat.id, montoActual, cat.dia_pago, cat.es_pago_fijo)}
                            className="h-8 w-8 p-0 text-zinc-400 hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Planificar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-6 shadow-lg border border-white/10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Planificación del Mes</h2>
            <p className="text-sm text-zinc-400">Define límites de gastos y metas de ingresos.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 backdrop-blur-md shadow-inner border border-white/10 text-emerald-400">
            <Target className="h-6 w-6" />
          </div>
        </div>

        {/* KPIs Grid Eliminado según feedback */}

        {renderTableSection(gastosFijos, 'Gastos Fijos')}
        {renderTableSection(gastosVariables, 'Gastos Variables (Consumo)')}
        {renderTableSection(categoriasIngreso, 'Ingresos Estimados')}
      </div>
    </div>
  );
}
