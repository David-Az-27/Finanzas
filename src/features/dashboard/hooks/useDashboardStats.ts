'use client';

import { useMemo } from 'react';
import { useMovimientos } from '@/features/movimientos/hooks/useMovimientosQuery';
import { useCuentas } from '@/features/cuentas/hooks/useCuentasQuery';
import { usePresupuestos, useTodosPresupuestos } from './usePresupuestosQuery';
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
  getDate,
  getDaysInMonth,
} from 'date-fns';
import { es } from 'date-fns/locale';

// ── Tipos de datos para cada sección del dashboard ──

export interface PresupuestoData {
  categoria: string;
  presupuesto: number;
  real: number;
}

export interface FlujoCajaData {
  dia: number;
  ingresos: number | null;
  gastos: number | null;
  ingresosProyectados: number | null;
  gastosProyectados: number | null;
}

export interface GastoTopItem {
  nombre: string;
  monto: number;
}

export interface PagosStats {
  pagados: number;
  pendientes: number;
}

export interface ProximoPagoItem {
  nombre: string;
  monto: number;
  dia_pago: number | null;
  estado: 'pagado' | 'pendiente' | 'vencido' | 'proximo';
}

export interface DistribucionGeneralItem {
  nombre: string;
  valor: number;
  porcentaje: number;
}

export interface ResumenFlujoItem {
  concepto: string;
  presupuesto: number;
  real: number;
}

export interface TendenciaGastoItem {
  categoria: string;
  datos: { dia: number; monto: number }[];
}

export interface DashboardStats {
  // ── KPI Cards (5) ──
  saldoActual: number;
  ingresosMes: number;
  gastosMes: number;
  ahorroEmergencia: number;
  totalPagos: number;

  // ── Presupuesto vs Real (card info) ──
  porcentajeAhorro: { presupuesto: number; real: number };
  pagosStats: PagosStats;
  gastosTop3: GastoTopItem[];

  // ── Gráficos ──
  distribucionGeneral: DistribucionGeneralItem[];
  resumenFlujo: ResumenFlujoItem[];
  resumenGastos: PresupuestoData[];
  resumenPagos: PresupuestoData[];
  resumenIngresos: PresupuestoData[];
  tendenciaGastos: TendenciaGastoItem[];
  flujoCaja: FlujoCajaData[];
  listaProximosPagos: ProximoPagoItem[];

  // ── Movimientos recientes ──
  ultimosMovimientos: any[];

  alertasPresupuesto: string[];

  // ── Cuentas y Tarjetas ──
  cuentas: any[];

  // ── Estado de carga ──
  isLoading: boolean;
  isError: boolean;
}

export type PeriodoDashboard = 'mensual' | 'q1' | 'q2';

export function useDashboardStats(periodo: PeriodoDashboard = 'mensual', selectedMonth: Date = new Date()): DashboardStats {
  const mesAnio = format(selectedMonth, 'yyyy-MM');

  const { data: movimientos = [], isLoading: loadingMov, isError: errorMov } = useMovimientos();
  const { data: cuentas = [], isLoading: loadingCuentas, isError: errorCuentas } = useCuentas();
  const { data: presupuestos = [], isLoading: loadingPres, isError: errorPres } = usePresupuestos(mesAnio);
  const { data: todosPresupuestos = [], isLoading: loadingTodos, isError: errorTodos } = useTodosPresupuestos();

  const isLoading = loadingMov || loadingCuentas || loadingPres || loadingTodos;
  const isError = errorMov || errorCuentas || errorPres || errorTodos;

  const stats = useMemo(() => {
    let inicioPeriodo = startOfMonth(selectedMonth);
    let finPeriodo = endOfMonth(selectedMonth);

    if (periodo === 'q1') {
      finPeriodo = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 15, 23, 59, 59, 999);
    } else if (periodo === 'q2') {
      inicioPeriodo = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 16, 0, 0, 0, 0);
    }

    const diasEnPeriodo = getDaysInMonth(selectedMonth); // Keep total days for charts that need full month scale, or adapt? Let's keep total days for now to avoid breaking axes.

    // ── Acumuladores del mes ──
    let ingresosMes = 0;
    let gastosMes = 0;
    let totalPagos = 0;
    let ahorrosMes = 0;

    // ── Presupuestos Trascendidos ──
    const presupuestosActivos = [...presupuestos];

    // Ordenar todos los presupuestos cronológicamente
    const todosOrdenados = [...todosPresupuestos].sort((a, b) => a.mes_anio.localeCompare(b.mes_anio));
    const ultimasMetasFijas = new Map<string, any>();
    todosOrdenados.forEach(p => {
      if (p.categorias?.es_pago_fijo === true) {
        const fechaPresupuesto = new Date(p.mes_anio + '-01T00:00:00');
        if (fechaPresupuesto <= inicioPeriodo) {
          ultimasMetasFijas.set(p.categoria_id, p);
        }
      }
    });

    // Añadir metas históricas trascendidas si no existen en el mes actual
    ultimasMetasFijas.forEach((p, catId) => {
      if (!presupuestosActivos.find(pa => pa.categoria_id === catId && pa.categorias?.es_pago_fijo)) {
        presupuestosActivos.push({
          ...p,
          mes_anio: mesAnio // Trascendido al mes actual
        });
      }
    });

    // Mapas para clasificar
    const gastosVariablesMap = new Map<string, number>();
    const pagosFijosMap = new Map<string, number>();
    const ingresosRealesMap = new Map<string, number>();

    // Para tendencia de gastos por día
    const tendenciaMap = new Map<string, Map<number, number>>();

    // ── Calcular Adelantos Históricos de Gastos Fijos ──
    const adelantosFijos = new Map<string, number>();
    const metasPrevias = new Map<string, number>();
    const pagosPrevios = new Map<string, number>();

    todosPresupuestos.forEach(p => {
      if (p.categorias?.es_pago_fijo === true) {
        // Asumiendo mes_anio = "YYYY-MM", agregamos un día para que sea válido y lo comparamos
        const fechaPresupuesto = new Date(p.mes_anio + '-01T00:00:00');
        if (fechaPresupuesto < inicioPeriodo) {
          const nombreCat = p.categorias?.nombre || 'Desconocida';
          metasPrevias.set(nombreCat, (metasPrevias.get(nombreCat) || 0) + Number(p.monto));
        }
      }
    });

    movimientos.forEach(m => {
      const fechaMov = new Date(m.fecha);
      if (fechaMov < inicioPeriodo && m.tipo === 'gasto' && m.categorias?.es_pago_fijo) {
        const nombreCat = m.categorias.nombre;
        pagosPrevios.set(nombreCat, (pagosPrevios.get(nombreCat) || 0) + Number(m.monto));
      }
    });

    metasPrevias.forEach((meta, cat) => {
      const pagado = pagosPrevios.get(cat) || 0;
      if (pagado > meta) {
        adelantosFijos.set(cat, pagado - meta);
      }
    });
    // Si hubo pagos previos pero no habia presupuesto asignado, todo el pago es un adelanto
    pagosPrevios.forEach((pagado, cat) => {
      if (!metasPrevias.has(cat) && pagado > 0) {
        adelantosFijos.set(cat, pagado);
      }
    });

    // ── Procesar todos los movimientos del periodo ──
    movimientos.forEach((m) => {
      const fecha = new Date(m.fecha);
      const enMesActual = isWithinInterval(fecha, { start: inicioPeriodo, end: finPeriodo });

      const montoOriginal = Number(m.monto);
      const cuotas = m.cuotas || 1;
      const nombreCat = m.categorias?.nombre || 'Sin categoría';
      const esPagoFijo = m.categorias?.es_pago_fijo ?? false;
      const dia = getDate(fecha);

      const cuentaOrigen = cuentas.find(c => c.id === m.cuenta_id);
      const isCreditCard = cuentaOrigen?.tipo === 'tarjeta_credito';
      const effectiveCuotas = isCreditCard ? cuotas : 1;

      let montoMes = 0;
      let aplicaMes = false;

      if (m.tipo === 'gasto' && effectiveCuotas > 1) {
        const mesesTranscurridos = (selectedMonth.getFullYear() - fecha.getFullYear()) * 12 + (selectedMonth.getMonth() - fecha.getMonth());
        if (mesesTranscurridos >= 0 && mesesTranscurridos < effectiveCuotas) {
          montoMes = montoOriginal / effectiveCuotas;
          aplicaMes = true;
        }
      } else if (enMesActual) {
        montoMes = montoOriginal;
        aplicaMes = true;
      }

      if (aplicaMes) {
        if (m.tipo === 'ingreso') {
          ingresosMes += montoMes;
          ingresosRealesMap.set(nombreCat, (ingresosRealesMap.get(nombreCat) || 0) + montoMes);
        }

        if (m.tipo === 'gasto') {
          gastosMes += montoMes;

          if (esPagoFijo) {
            totalPagos += montoMes;
            pagosFijosMap.set(nombreCat, (pagosFijosMap.get(nombreCat) || 0) + montoMes);
          } else {
            gastosVariablesMap.set(nombreCat, (gastosVariablesMap.get(nombreCat) || 0) + montoMes);
          }

          if (!tendenciaMap.has(nombreCat)) {
            tendenciaMap.set(nombreCat, new Map<number, number>());
          }
          const catDias = tendenciaMap.get(nombreCat)!;
          catDias.set(dia, (catDias.get(dia) || 0) + montoMes);
        }
      }

      if (m.tipo === 'transferencia' && enMesActual) {
        const destino = cuentas.find(c => c.id === m.cuenta_destino_id);
        if (destino && destino.es_para_ahorro === true) {
          ahorrosMes += montoOriginal;
        }
      }
    });

    // ── Calcular Flujo de Caja por Día ──
    const flujoCaja: FlujoCajaData[] = [];
    let acumIngresos = 0;
    let acumGastos = 0;

    // Create maps for fast lookup
    const ingresosDiaMap = new Map<number, number>();
    const gastosDiaMap = new Map<number, number>();

    movimientos.forEach(m => {
      const fecha = new Date(m.fecha);
      const enMesActual = isWithinInterval(fecha, { start: inicioPeriodo, end: finPeriodo });
      const cuotas = m.cuotas || 1;
      const montoOriginal = Number(m.monto);
      const dia = getDate(fecha);

      let montoMes = 0;
      let aplicaMes = false;

      if (m.tipo === 'gasto' && cuotas > 1) {
        const mesesTranscurridos = (selectedMonth.getFullYear() - fecha.getFullYear()) * 12 + (selectedMonth.getMonth() - fecha.getMonth());
        if (mesesTranscurridos >= 0 && mesesTranscurridos < cuotas) {
          montoMes = montoOriginal / cuotas;
          aplicaMes = true;
        }
      } else if (enMesActual) {
        montoMes = montoOriginal;
        aplicaMes = true;
      }

      if (aplicaMes) {
        if (m.tipo === 'ingreso') {
          ingresosDiaMap.set(dia, (ingresosDiaMap.get(dia) || 0) + montoMes);
        } else if (m.tipo === 'gasto') {
          gastosDiaMap.set(dia, (gastosDiaMap.get(dia) || 0) + montoMes);
        }
      }
    });

    const totalPresIngresos = presupuestosActivos
      .filter(p => p.categorias?.tipo === 'ingreso')
      .reduce((acc, p) => acc + Number(p.monto), 0);
    const totalPresGastos = presupuestosActivos
      .filter(p => p.categorias?.tipo === 'gasto' && !p.categorias?.es_pago_fijo)
      .reduce((acc, p) => acc + Number(p.monto), 0);
    const totalPresPagos = presupuestosActivos
      .filter(p => p.categorias?.es_pago_fijo === true)
      .reduce((acc, p) => acc + Number(p.monto), 0);

    let diaActualProyeccion = diasEnPeriodo;
    const today = new Date();
    if (selectedMonth.getFullYear() === today.getFullYear() && selectedMonth.getMonth() === today.getMonth()) {
      diaActualProyeccion = getDate(today);
    }

    // Calcular acumulado real hasta hoy
    let totalIngresosHastaHoy = 0;
    let totalGastosHastaHoy = 0;
    for (let d = 1; d <= diaActualProyeccion; d++) {
      totalIngresosHastaHoy += ingresosDiaMap.get(d) || 0;
      totalGastosHastaHoy += gastosDiaMap.get(d) || 0;
    }

    const presIngresosRestante = Math.max(0, totalPresIngresos - totalIngresosHastaHoy);
    const presGastosRestante = Math.max(0, (totalPresGastos + totalPresPagos) - totalGastosHastaHoy);
    const diasRestantes = diasEnPeriodo - diaActualProyeccion;
    const ingresoDiarioProyectado = diasRestantes > 0 ? presIngresosRestante / diasRestantes : 0;
    const gastoDiarioProyectado = diasRestantes > 0 ? presGastosRestante / diasRestantes : 0;

    let proyIngresosAcum = totalIngresosHastaHoy;
    let proyGastosAcum = totalGastosHastaHoy;

    for (let d = 1; d <= diasEnPeriodo; d++) {
      if (d <= diaActualProyeccion) {
        acumIngresos += ingresosDiaMap.get(d) || 0;
        acumGastos += gastosDiaMap.get(d) || 0;
        flujoCaja.push({
          dia: d,
          ingresos: acumIngresos,
          gastos: acumGastos,
          ingresosProyectados: d === diaActualProyeccion ? acumIngresos : null,
          gastosProyectados: d === diaActualProyeccion ? acumGastos : null
        });
      } else {
        proyIngresosAcum += ingresoDiarioProyectado;
        proyGastosAcum += gastoDiarioProyectado;
        flujoCaja.push({
          dia: d,
          ingresos: null,
          gastos: null,
          ingresosProyectados: proyIngresosAcum,
          gastosProyectados: proyGastosAcum
        });
      }
    }

    // ── Saldos por cuenta ──
    const saldosMap = new Map<string, number>();
    cuentas.forEach((c) => saldosMap.set(c.id, 0));

    movimientos.forEach((m) => {
      const fechaMov = new Date(m.fecha);
      const enMesActual = isWithinInterval(fechaMov, { start: inicioPeriodo, end: finPeriodo });
      const monto = Number(m.monto);

      const aplicarMovimiento = (cuenta_id: string, operacion: 'suma' | 'resta') => {
        const cuenta = cuentas.find(c => c.id === cuenta_id);
        if (!cuenta) return;

        // Todas las cuentas deben preservar su saldo histórico, igual que en CuentasGrid
        const current = saldosMap.get(cuenta_id) || 0;
        saldosMap.set(cuenta_id, operacion === 'suma' ? current + monto : current - monto);
      };

      if (m.tipo === 'ingreso') {
        aplicarMovimiento(m.cuenta_id, 'suma');
      } else if (m.tipo === 'gasto') {
        aplicarMovimiento(m.cuenta_id, 'resta');
      } else if (m.tipo === 'transferencia') {
        aplicarMovimiento(m.cuenta_id, 'resta');
        if (m.cuenta_destino_id) {
          aplicarMovimiento(m.cuenta_destino_id, 'suma');
        }
      }
    });

    // Saldo Disponible = suma de cuentas donde es_para_ahorro es false y no son tarjetas de credito
    const saldoActual = cuentas
      .filter(c => c.es_para_ahorro === false && c.tipo !== 'tarjeta_credito')
      .reduce((acc, c) => acc + (saldosMap.get(c.id) || 0), 0);

    // Imprimir los tokens (IDs) en la consola del navegador por si se necesitan después
    console.log('--- TOKENS DE TUS CUENTAS ---');
    cuentas.forEach(c => console.log(`Nombre: ${c.nombre} | Token (ID): ${c.id} | Saldo: ${saldosMap.get(c.id)}`));
    console.log('-----------------------------');

    // Ahorro Emergencia: buscar específicamente la cuenta de emergencia por su token histórico o por nombre
    const tokenEmergencia = 'f4d08716-9d2d-4106-9cd2-1c8608a4';
    const cuentaEmergencia = cuentas.find(c => 
      c.id.startsWith(tokenEmergencia) || 
      c.nombre.toLowerCase().includes('emergencia')
    );

    const ahorroEmergencia = cuentaEmergencia
      ? (saldosMap.get(cuentaEmergencia.id) || 0)
      : 0;

    // ── % de Ahorro (Presupuesto vs Real) ──
    // Presupuesto de ahorro = % del total de presupuesto de ingresos destinado a ahorro
    // Simplificado: porcentaje = ahorrosMes / ingresosMes
    const presupuestoAhorroTotal = presupuestosActivos
      .filter(p => p.categorias?.tipo === 'ingreso')
      .reduce((acc, p) => acc + Number(p.monto), 0);
    const porcentajeAhorroPres = presupuestoAhorroTotal > 0
      ? Math.round((ahorrosMes / presupuestoAhorroTotal) * 100)
      : 0;
    const porcentajeAhorroReal = ingresosMes > 0
      ? Math.round((ahorrosMes / ingresosMes) * 100)
      : 0;

    // ── Pagos: pagados vs pendientes ──
    const presupuestosPagoFijo = presupuestosActivos.filter(p => p.categorias?.es_pago_fijo === true);

    const listaProximosPagos: ProximoPagoItem[] = [];
    const hoyDia = getDate(selectedMonth);

    presupuestosPagoFijo.forEach(p => {
      const nombreCat = p.categorias?.nombre || '';
      const montoOriginal = Number(p.monto);
      const diaPago = (p.categorias as any)?.dia_pago || null;

      const gastoMesReal = pagosFijosMap.get(nombreCat) || 0;
      const adelanto = adelantosFijos.get(nombreCat) || 0;
      const totalAbonado = gastoMesReal + adelanto;

      const montoFaltanteAjustado = Math.max(0, montoOriginal - adelanto);
      const pagoRealizado = totalAbonado >= montoOriginal && montoOriginal > 0;

      let estado: 'pagado' | 'pendiente' | 'vencido' | 'proximo' = 'pendiente';
      if (pagoRealizado) {
        estado = 'pagado';
      } else if (diaPago) {
        if (hoyDia > diaPago) estado = 'vencido';
        else if (diaPago - hoyDia <= 3) estado = 'proximo';
      }

      listaProximosPagos.push({
        nombre: nombreCat,
        monto: montoFaltanteAjustado, // Mostrar lo que realmente falta por pagar
        dia_pago: diaPago,
        estado
      });
    });

    // Add virtual credit card payments to listaProximosPagos and save them for resumenPagos
    const virtualCreditCardPayments: PresupuestoData[] = [];

    cuentas
      .filter(c => c.tipo === 'tarjeta_credito')
      .forEach(c => {
        let pagosMesCard = 0;
        let cuotasMesCard = 0;
        
        movimientos.forEach((m) => {
          const fecha = new Date(m.fecha);
          const enMesActual = isWithinInterval(fecha, { start: inicioPeriodo, end: finPeriodo });
          
          if (m.tipo === 'transferencia' && m.cuenta_destino_id === c.id && enMesActual) {
            pagosMesCard += Number(m.monto);
          }

          if (m.tipo === 'gasto' && m.cuenta_id === c.id) {
            const montoOriginal = Number(m.monto);
            const cuotas = m.cuotas || 1;
            
            if (cuotas > 1) {
              const mesesTranscurridos = (selectedMonth.getFullYear() - fecha.getFullYear()) * 12 + (selectedMonth.getMonth() - fecha.getMonth());
              if (mesesTranscurridos >= 0 && mesesTranscurridos < cuotas) {
                cuotasMesCard += montoOriginal / cuotas;
              }
            } else if (enMesActual) {
              cuotasMesCard += montoOriginal;
            }
          }
        });

        const deudaInicial = cuotasMesCard;

        if (deudaInicial > 0) {
          const pagoRealizado = pagosMesCard >= deudaInicial;
          let estado: 'pagado' | 'pendiente' | 'vencido' | 'proximo' = 'pendiente';
          if (pagoRealizado) {
            estado = 'pagado';
          } else if (c.dia_pago) {
            if (hoyDia > c.dia_pago) estado = 'vencido';
            else if (c.dia_pago - hoyDia <= 3) estado = 'proximo';
          }

          listaProximosPagos.push({
            nombre: `Pago Tarjeta ${c.nombre}`,
            monto: Math.max(0, deudaInicial - pagosMesCard),
            dia_pago: c.dia_pago,
            estado
          });

          virtualCreditCardPayments.push({
            categoria: `Pago Tarjeta ${c.nombre}`,
            presupuesto: deudaInicial,
            real: pagosMesCard
          });
          totalPagos += pagosMesCard;
        }
      });

    const pagados = listaProximosPagos.filter(p => p.estado === 'pagado').length;
    const pendientes = listaProximosPagos.length - pagados;

    // ── Top 3 Gastos (Solo Consumo / Variables) ──
    const todosGastos = new Map<string, number>();
    gastosVariablesMap.forEach((v, k) => todosGastos.set(k, (todosGastos.get(k) || 0) + v));

    const gastosTop3: GastoTopItem[] = Array.from(todosGastos.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nombre, monto]) => ({ nombre, monto }));

    // ── Distribución General (Dona) ──
    let gastosVariados = 0;
    gastosVariablesMap.forEach(v => gastosVariados += v);

    const sumaSalidas = gastosVariados + totalPagos + ahorrosMes;
    const disponibleMes = Math.max(0, ingresosMes - sumaSalidas);

    // El total de la dona es la suma de salidas o el ingreso total, lo que sea mayor
    const totalDistribucion = Math.max(ingresosMes, sumaSalidas);

    const distribucionGeneral: DistribucionGeneralItem[] = [
      { nombre: 'Libre (Mes)', valor: disponibleMes, porcentaje: totalDistribucion > 0 ? Math.round((disponibleMes / totalDistribucion) * 100) : 0 },
      { nombre: 'Gastos', valor: gastosVariados, porcentaje: totalDistribucion > 0 ? Math.round((gastosVariados / totalDistribucion) * 100) : 0 },
      { nombre: 'Pagos', valor: totalPagos, porcentaje: totalDistribucion > 0 ? Math.round((totalPagos / totalDistribucion) * 100) : 0 },
      { nombre: 'Ahorros', valor: ahorrosMes, porcentaje: totalDistribucion > 0 ? Math.round((ahorrosMes / totalDistribucion) * 100) : 0 },
    ].filter(d => d.valor > 0);

    // Totales de presupuesto ya se calcularon arriba para la proyección.

    const resumenFlujo: ResumenFlujoItem[] = [
      { concepto: 'Ingresos', presupuesto: totalPresIngresos, real: ingresosMes },
      { concepto: 'Gastos', presupuesto: totalPresGastos, real: gastosVariados },
      { concepto: 'Ahorros', presupuesto: 0, real: ahorrosMes },
      { concepto: 'Pagos', presupuesto: totalPresPagos, real: totalPagos },
    ];

    // ── Resumen de Gastos Variables (Presupuesto vs Real) ──
    const resumenGastosMap = new Map<string, PresupuestoData>();
    presupuestosActivos
      .filter(p => p.categorias?.tipo === 'gasto' && !p.categorias?.es_pago_fijo)
      .forEach(p => {
        const nombre = p.categorias?.nombre || 'Desconocida';
        resumenGastosMap.set(nombre, {
          categoria: nombre,
          presupuesto: Number(p.monto),
          real: 0,
        });
      });
    gastosVariablesMap.forEach((gastoReal, nombre) => {
      if (resumenGastosMap.has(nombre)) {
        resumenGastosMap.get(nombre)!.real = gastoReal;
      } else {
        resumenGastosMap.set(nombre, { categoria: nombre, presupuesto: 0, real: gastoReal });
      }
    });
    const resumenGastos = Array.from(resumenGastosMap.values()).sort((a, b) => b.real - a.real);

    // ── Resumen de Pagos Fijos (Presupuesto vs Real) ──
    const resumenPagosMap = new Map<string, PresupuestoData>();
    presupuestosActivos
      .filter(p => p.categorias?.es_pago_fijo === true)
      .forEach(p => {
        const nombre = p.categorias?.nombre || 'Desconocida';
        const adelanto = adelantosFijos.get(nombre) || 0;
        const metaOriginal = Number(p.monto);
        const metaAjustada = Math.max(0, metaOriginal - adelanto); // Restamos el adelanto a la meta para que se vea claro lo que falta

        resumenPagosMap.set(nombre, {
          categoria: nombre,
          presupuesto: metaAjustada,
          real: 0,
        });
      });

    pagosFijosMap.forEach((gastoReal, nombre) => {
      if (resumenPagosMap.has(nombre)) {
        resumenPagosMap.get(nombre)!.real = gastoReal;
      } else {
        resumenPagosMap.set(nombre, { categoria: nombre, presupuesto: 0, real: gastoReal });
      }
    });

    const resumenPagos = Array.from(resumenPagosMap.values());
    resumenPagos.push(...virtualCreditCardPayments);
    resumenPagos.sort((a, b) => b.real - a.real);

    // ── Resumen de Ingresos (Presupuesto vs Real) ──
    const resumenIngresosMap = new Map<string, PresupuestoData>();
    presupuestosActivos
      .filter(p => p.categorias?.tipo === 'ingreso')
      .forEach(p => {
        const nombre = p.categorias?.nombre || 'Desconocida';
        resumenIngresosMap.set(nombre, {
          categoria: nombre,
          presupuesto: Number(p.monto),
          real: 0,
        });
      });
    ingresosRealesMap.forEach((ingresoReal, nombre) => {
      if (resumenIngresosMap.has(nombre)) {
        resumenIngresosMap.get(nombre)!.real = ingresoReal;
      } else {
        resumenIngresosMap.set(nombre, { categoria: nombre, presupuesto: 0, real: ingresoReal });
      }
    });
    const resumenIngresos = Array.from(resumenIngresosMap.values()).sort((a, b) => b.real - a.real);

    // ── Tendencia de Gastos (línea por categoría, top 5) ──
    const topCategorias = Array.from(todosGastos.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre]) => nombre);

    const tendenciaGastos: TendenciaGastoItem[] = topCategorias.map(cat => {
      const catDias = tendenciaMap.get(cat) || new Map<number, number>();
      const datos: { dia: number; monto: number }[] = [];
      let acumulado = 0;
      for (let d = 1; d <= diasEnPeriodo; d++) {
        acumulado += catDias.get(d) || 0;
        datos.push({ dia: d, monto: acumulado });
      }
      return { categoria: cat, datos };
    });

    const ultimosMovimientos = [...movimientos]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);

    const alertasPresupuesto: string[] = [];
    // Alertas de peligro para gastos variables (consumo)
    resumenGastos.forEach(g => {
      if (g.presupuesto > 0 && (g.real / g.presupuesto) >= 0.85 && (g.real / g.presupuesto) < 1) {
        alertasPresupuesto.push(`⚠️ Atención: Estás a punto de exceder tu presupuesto en ${g.categoria}`);
      } else if (g.presupuesto > 0 && g.real >= g.presupuesto) {
        alertasPresupuesto.push(`❌ Límite excedido: Has superado tu presupuesto en ${g.categoria}`);
      }
    });
    // Alertas de felicitación para pagos fijos
    resumenPagos.forEach(g => {
      if (g.presupuesto > 0 && g.real >= g.presupuesto) {
        alertasPresupuesto.push(`✅ ¡Felicidades! Liberaste el pago de ${g.categoria}`);
      }
    });

    const cuentasConSaldo = cuentas.map(c => ({
      ...c,
      saldo: saldosMap.get(c.id) || 0
    }));

    return {
      saldoActual,
      ingresosMes,
      gastosMes: gastosVariados, // Mostrar solo gastos de consumo (variables) en el KPI
      ahorroEmergencia,
      totalPagos,
      porcentajeAhorro: { presupuesto: porcentajeAhorroPres, real: porcentajeAhorroReal },
      pagosStats: { pagados, pendientes },
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
      cuentas: cuentasConSaldo,
    };
  }, [movimientos, cuentas, presupuestos, todosPresupuestos, periodo, selectedMonth]);

  return {
    ...stats,
    isLoading,
    isError,
  };
}
