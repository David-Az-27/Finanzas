'use client';

import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table';
import { format, isWithinInterval, startOfMonth, endOfMonth, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Trash2, MoreHorizontal, Pencil, Receipt, Search } from 'lucide-react';
import { useMonth } from '@/shared/context/MonthContext';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

import { useMovimientos, useEliminarMovimiento } from '../hooks/useMovimientosQuery';
import { MovimientoForm } from './MovimientoForm';
import { formatCurrency } from '@/shared/lib/utils';
import type { Movimiento } from '../types';

import { toast } from 'sonner';

export function MovimientosTable() {
  const { data: todosMovimientos, isLoading, error } = useMovimientos();
  const { mutate: eliminarMovimiento } = useEliminarMovimiento();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [movimientoToDelete, setMovimientoToDelete] = useState<string | null>(null);
  const [movimientoToEdit, setMovimientoToEdit] = useState<Movimiento | null>(null);
  const { selectedMonth } = useMonth();

  const movimientos = useMemo(() => {
    if (!todosMovimientos) return [];
    const inicio = startOfMonth(selectedMonth);
    const fin = endOfMonth(selectedMonth);
    return todosMovimientos.filter((m) => {
      const fecha = new Date(m.fecha);
      const enPeriodo = isWithinInterval(fecha, { start: inicio, end: fin });
      if (!enPeriodo) return false;
      
      const coincideTipo = typeFilter === 'todos' || m.tipo === typeFilter;
      const concepto = m.nota || m.categorias?.nombre || 'Sin concepto';
      const coincideBusqueda = concepto.toLowerCase().includes(searchTerm.toLowerCase());
      
      return coincideTipo && coincideBusqueda;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [todosMovimientos, selectedMonth, searchTerm, typeFilter]);

  const columns = useMemo(() => [
    {
      id: 'concepto',
      header: 'Concepto y Categoría',
      cell: ({ row }: any) => {
        const tipo = row.getValue('tipo');
        
        let cat = row.original.categorias?.nombre || 'Sin categoría';
        let concepto = row.original.nota || cat;

        if (tipo === 'transferencia') {
          cat = 'Transferencia';
          concepto = row.original.nota || 'Traspaso entre cuentas';
        }
        return (
          <div className="flex flex-col justify-center gap-1">
            <span className="font-semibold text-white tracking-tight leading-none">{concepto}</span>
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
              {cat}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }: any) => {
        const fecha = new Date(row.getValue('fecha'));
        let dateString = '';
        if (isToday(fecha)) dateString = 'Hoy';
        else if (isYesterday(fecha)) dateString = 'Ayer';
        else dateString = format(fecha, 'dd MMM', { locale: es });
        return <span className="text-zinc-400 font-medium">{dateString}</span>;
      },
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }: any) => {
        const tipo = row.getValue('tipo');
        if (tipo === 'ingreso') {
          return (
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-400 border border-emerald-500/20">
              <ArrowUpCircle className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Ingreso</span>
            </div>
          );
        }
        if (tipo === 'gasto') {
          return (
            <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2 py-1 text-rose-400 border border-rose-500/20">
              <ArrowDownCircle className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Gasto</span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-1 text-indigo-400 border border-indigo-500/20">
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Transferencia</span>
          </div>
        );
      },
    },
    {
      id: 'cuenta',
      header: 'Cuenta',
      cell: ({ row }: any) => {
        const tipo = row.getValue('tipo');
        const cuenta = row.original.cuentas?.nombre;
        const destino = row.original.cuenta_destino?.nombre;
        if (tipo === 'transferencia') {
          return <span className="text-zinc-400 font-medium">{cuenta} → {destino}</span>;
        }
        return <span className="text-zinc-400 font-medium">{cuenta}</span>;
      },
    },
    {
      accessorKey: 'monto',
      header: () => <div className="text-right">Monto</div>,
      cell: ({ row }: any) => {
        const monto = parseFloat(row.getValue('monto'));
        const tipo = row.getValue('tipo');
        const textColor = tipo === 'ingreso' ? 'text-emerald-400' : 'text-zinc-200';
        const sign = tipo === 'gasto' ? '-' : tipo === 'ingreso' ? '+' : '';
        return (
          <div className={`text-right font-bold tracking-tight ${textColor}`}>
            {sign}{formatCurrency(monto)}
          </div>
        );
      },
    },
    {
      id: 'acciones',
      cell: ({ row }: any) => {
        const id = row.original.id;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/5 backdrop-blur-2xl shadow-xl border-slate-700 text-zinc-200">
                <DropdownMenuItem 
                  onClick={() => setMovimientoToEdit(row.original)}
                  className="focus:bg-zinc-800 focus:text-white cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  onClick={() => setMovimientoToDelete(id)} 
                  className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [eliminarMovimiento]);

  const table = useReactTable({
    data: movimientos || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

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
        <p>Error al cargar los movimientos.</p>
      </div>
    );
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl/50 py-16 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black/20 backdrop-blur-md shadow-inner border border-white/10 shadow-inner">
          <Receipt className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-lg font-medium text-white">No hay movimientos en este periodo</h3>
        <p className="mt-1 text-sm text-zinc-400">Ajusta tus filtros o registra un nuevo movimiento.</p>
        <Button variant="default" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => document.getElementById('base-ui-_R_1ktd5rlb_')?.click() /* Fallback trigger si lo hay, pero se prefiere usar QuickAdd desde navigation */}>
          Agregar Movimiento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar transacción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/5 backdrop-blur-2xl shadow-xl border-slate-700 text-white focus-visible:ring-emerald-500"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={typeFilter} onValueChange={(v: any) => v && setTypeFilter(v)}>
            <SelectTrigger className="bg-white/5 backdrop-blur-2xl shadow-xl border-slate-700 text-white">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent className="bg-white/5 backdrop-blur-2xl shadow-xl border-slate-700 text-white">
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="ingreso">Ingresos</SelectItem>
              <SelectItem value="gasto">Gastos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#121827]/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-transparent border-b border-white/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-default"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl text-white hover:bg-zinc-800"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl text-white hover:bg-zinc-800"
        >
          Siguiente
        </Button>
      </div>

      {/* Modal global de eliminación aislado del Dropdown */}
      <AlertDialog open={!!movimientoToDelete} onOpenChange={(open) => !open && setMovimientoToDelete(null)}>
        <AlertDialogContent className="bg-white/5 backdrop-blur-2xl shadow-xl border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer. Se recalcularán tus balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-600 hover:bg-zinc-800 text-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (movimientoToDelete) {
                  eliminarMovimiento(movimientoToDelete);
                }
                setMovimientoToDelete(null);
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sheet global de edición aislado del Dropdown */}
      <Sheet open={!!movimientoToEdit} onOpenChange={(open) => !open && setMovimientoToEdit(null)}>
        <SheetContent side="left" className="p-0 border-r border-white/10 shadow-2xl w-full sm:max-w-md bg-[#0f172a]/95 backdrop-blur-2xl text-white overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {/* Header del Sheet */}
            <div className="relative border-b border-white/5 bg-gradient-to-br from-[#62aeae]/10 to-transparent p-8 pb-6">
              <SheetHeader className="relative z-10 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#62aeae] text-white shadow-lg shadow-[#62aeae]/20">
                    <span className="text-lg font-bold">D</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white">DIMO</span>
                </div>
                <SheetTitle className="text-2xl font-bold text-white tracking-tight">
                  Editar Movimiento
                </SheetTitle>
                <SheetDescription className="text-zinc-400 mt-1">
                  Actualiza los detalles de este registro financiero.
                </SheetDescription>
              </SheetHeader>
            </div>
            
            {/* Contenido / Formulario */}
            {movimientoToEdit && (
              <div className="p-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MovimientoForm 
                  initialData={movimientoToEdit} 
                  onSuccess={() => setMovimientoToEdit(null)} 
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
