'use client';

import { useState } from 'react';
import { Loader2, ArrowDownCircle, ArrowUpCircle, Trash2, Tag } from 'lucide-react';
import { useCategorias, useEliminarCategoria } from '../hooks/useCategoriasQuery';
import { EditarCategoriaDialog } from './EditarCategoriaDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import type { Categoria } from '@/shared/types';

export function CategoriasTable() {
  const { data: categorias, isLoading, error } = useCategorias();
  const { mutate: eliminarCategoria, isPending: isEliminando } = useEliminarCategoria();
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-600">
        <p>Error al cargar las categorías.</p>
      </div>
    );
  }

  if (!categorias || categorias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-2xl text-slate-400">
          <Tag className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No hay categorías</h3>
        <p className="mt-1 text-sm text-slate-500">Comienza creando tu primera categoría.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-2xl shadow-xl rounded-2xl p-6 shadow-lg border border-white/10 overflow-hidden flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Categorías & Pagos Fijos</h2>
          <p className="text-sm text-zinc-400">Estructura de tus transacciones.</p>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-800/50 text-emerald-400/80">
          <Tag className="w-5 h-5" />
        </div>
      </div>
      <Table>
        <TableHeader className="bg-transparent">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="w-[120px] text-zinc-400 font-semibold text-xs uppercase tracking-wider">Tipo</TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider">Nombre</TableHead>
            <TableHead className="w-[80px] text-right text-zinc-400 font-semibold text-xs uppercase tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.map((categoria: Categoria) => (
            <TableRow key={categoria.id} className="group border-white/5 hover:bg-zinc-800/50 transition-colors">
              <TableCell>
                {categoria.tipo === 'ingreso' ? (
                  <div className="flex items-center gap-2 text-emerald-400/70">
                    <ArrowUpCircle className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Ingreso</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-400/70">
                    <ArrowDownCircle className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Gasto</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium text-zinc-200">
                {categoria.nombre}
              </TableCell>
              <TableCell className="text-right flex items-center justify-end gap-2">
                <EditarCategoriaDialog categoria={categoria} />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCategoriaAEliminar(categoria.id)}
                  className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!categoriaAEliminar} onOpenChange={(open) => !open && setCategoriaAEliminar(null)}>
        <AlertDialogContent className="border-white/10 bg-black/90 backdrop-blur-3xl text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta categoría?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer. Los registros asociados a esta categoría podrían quedar sin asignar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCategoriaAEliminar(null)}
              className="bg-transparent border-white/10 text-white hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (categoriaAEliminar) {
                  eliminarCategoria(categoriaAEliminar);
                  setCategoriaAEliminar(null);
                }
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
