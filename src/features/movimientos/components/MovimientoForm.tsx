'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';

import { useCrearMovimiento, useActualizarMovimiento } from '../hooks/useMovimientosQuery';
import { useCuentas } from '@/features/cuentas/hooks/useCuentasQuery';
import { useCategorias } from '@/features/categorias/hooks/useCategoriasQuery';
import { cn } from '@/lib/utils';
import type { TipoMovimiento, MetodoPago, Movimiento } from '../types';
import { addMonths } from 'date-fns';

const movimientoFormSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  tipo: z.enum(['ingreso', 'gasto', 'transferencia']),
  cuenta_id: z.string().min(1, 'Selecciona una cuenta de origen'),
  cuenta_destino_id: z.string().optional(),
  categoria_id: z.string().optional(),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tc', 'td', 'pse']).optional(),
  fecha: z.date(),
  nota: z.string().optional(),
  cuotas: z.number().min(1).max(72),
}).refine(data => {
  if (data.tipo === 'transferencia' && !data.cuenta_destino_id) {
    return false;
  }
  return true;
}, {
  message: 'Selecciona una cuenta de destino',
  path: ['cuenta_destino_id'],
}).refine(data => {
  if (data.tipo !== 'transferencia' && !data.categoria_id) {
    return false;
  }
  return true;
}, {
  message: 'Selecciona una categoría',
  path: ['categoria_id'],
});

type MovimientoFormValues = z.infer<typeof movimientoFormSchema>;

interface MovimientoFormProps {
  onSuccess?: () => void;
  initialData?: Movimiento;
}

export function MovimientoForm({ onSuccess, initialData }: MovimientoFormProps) {
  const { mutateAsync: crearMovimiento, isPending: isCreating } = useCrearMovimiento();
  const { mutateAsync: actualizarMovimiento, isPending: isUpdating } = useActualizarMovimiento();
  const isPending = isCreating || isUpdating;
  const { data: cuentas = [] } = useCuentas();
  const { data: categorias = [] } = useCategorias();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoFormSchema),
    defaultValues: {
      fecha: initialData ? new Date(initialData.fecha) : new Date(),
      tipo: initialData ? initialData.tipo : 'gasto',
      monto: initialData ? Number(initialData.monto) : undefined,
      cuenta_id: initialData ? initialData.cuenta_id : '',
      cuenta_destino_id: initialData?.cuenta_destino_id || '',
      categoria_id: initialData?.categoria_id || '',
      metodo_pago: initialData?.metodo_pago || 'efectivo',
      nota: initialData?.nota || '',
      cuotas: 1,
    },
  });

  const tipoValue = watch('tipo');
  const fecha = watch('fecha');
  const cuentaId = watch('cuenta_id');
  const selectedCuenta = cuentas.find(c => c.id === cuentaId);
  const isCreditCard = selectedCuenta?.tipo === 'tarjeta_credito';
  const cuentaDestinoId = watch('cuenta_destino_id');
  const categoriaId = watch('categoria_id');
  const metodoPago = watch('metodo_pago');

  const categoriasFiltradas = categorias.filter(c => c.tipo === tipoValue);

  const getNombreCuenta = (id: string) => cuentas.find(c => c.id === id)?.nombre;
  const getNombreCategoria = (id: string) => categorias.find(c => c.id === id)?.nombre;

  useEffect(() => {
    if (tipoValue !== 'transferencia') {
      setValue('cuenta_destino_id', '');
    }
    if (tipoValue !== 'transferencia') {
      const catValida = categoriasFiltradas.find(c => c.id === categoriaId);
      if (!catValida && categoriasFiltradas.length > 0) {
        setValue('categoria_id', '');
      }
    }
  }, [tipoValue, categoriasFiltradas, categoriaId, setValue]);

  async function onSubmit(data: MovimientoFormValues) {
    try {
      const payload: any = {
        monto: data.monto,
        tipo: data.tipo,
        cuenta_id: data.cuenta_id,
        fecha: data.fecha.toISOString(),
      };

      if (data.cuenta_destino_id && data.cuenta_destino_id.trim() !== '') {
        payload.cuenta_destino_id = data.cuenta_destino_id;
      }
      if (data.categoria_id && data.categoria_id.trim() !== '') {
        payload.categoria_id = data.categoria_id;
      }
      if (data.metodo_pago) {
        payload.metodo_pago = data.metodo_pago;
      }
      if (data.nota && data.nota.trim() !== '') {
        payload.nota = data.nota;
      }

      if (initialData) {
        await actualizarMovimiento({ id: initialData.id, input: payload });
      } else {
        payload.cuotas = data.cuotas || 1;
        await crearMovimiento(payload);
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error al guardar movimiento:', error);
    }
  }

  const labelClass = "text-zinc-300 font-semibold text-sm block mb-2";
  const inputClass = "bg-black/20 backdrop-blur-md shadow-inner border-white/10 focus:border-[#62aeae] focus:ring-[#62aeae] text-white";
  const wrapperClass = "flex flex-col gap-1 mb-4";
  const selectContentClass = "bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 text-white z-50 shadow-2xl";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {/* TIPO Y MONTO */}
      <div className="grid grid-cols-2 gap-4">
        <div className={wrapperClass}>
          <Label htmlFor="tipo" className={labelClass}>Tipo</Label>
          <Select value={tipoValue} onValueChange={(v) => v && setValue('tipo', v as TipoMovimiento)}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              <SelectItem value="ingreso">Ingreso</SelectItem>
              <SelectItem value="gasto">Gasto</SelectItem>
              <SelectItem value="transferencia">Transferencia</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo && <p className="text-sm text-rose-500">{errors.tipo.message}</p>}
        </div>

        <div className={wrapperClass}>
          <Label htmlFor="monto" className={labelClass}>Monto</Label>
          <Input 
            id="monto" 
            type="number" 
            inputMode="decimal"
            step="0.01" 
            placeholder="0.00" 
            className={inputClass}
            {...register('monto', { valueAsNumber: true })} 
          />
          {errors.monto && <p className="text-sm text-rose-500">{errors.monto.message}</p>}
        </div>
      </div>

      {/* CUENTA ORIGEN Y DESTINO */}
      <div className="grid grid-cols-2 gap-4">
        <div className={wrapperClass}>
          <Label htmlFor="cuenta_id" className={labelClass}>{tipoValue === 'transferencia' ? 'Origen' : 'Cuenta'}</Label>
          <Select value={cuentaId} onValueChange={(v) => v && setValue('cuenta_id', v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Selecciona">
                {cuentaId ? getNombreCuenta(cuentaId) : 'Selecciona'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              {cuentas.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.cuenta_id && <p className="text-sm text-rose-500">{errors.cuenta_id.message}</p>}
        </div>

        {tipoValue === 'transferencia' ? (
          <div className={wrapperClass}>
            <Label htmlFor="cuenta_destino_id" className={labelClass}>Destino</Label>
            <Select value={cuentaDestinoId} onValueChange={(v) => v && setValue('cuenta_destino_id', v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Selecciona">
                  {cuentaDestinoId ? getNombreCuenta(cuentaDestinoId) : 'Selecciona'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                {cuentas.map(c => (
                  <SelectItem key={c.id} value={c.id} disabled={c.id === cuentaId}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cuenta_destino_id && <p className="text-sm text-rose-500">{errors.cuenta_destino_id.message}</p>}
          </div>
        ) : (
          <div className={wrapperClass}>
            <Label htmlFor="categoria_id" className={labelClass}>Categoría</Label>
            <Select value={categoriaId} onValueChange={(v) => v && setValue('categoria_id', v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Selecciona">
                  {categoriaId ? getNombreCategoria(categoriaId) : 'Selecciona'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className={selectContentClass}>
                {categoriasFiltradas.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria_id && <p className="text-sm text-rose-500">{errors.categoria_id.message}</p>}
          </div>
        )}
      </div>

      {/* MÉTODO DE PAGO Y FECHA */}
      <div className="grid grid-cols-2 gap-4">
        <div className={wrapperClass}>
          <Label htmlFor="metodo_pago" className={labelClass}>Método de Pago (Opcional)</Label>
          <Select value={metodoPago} onValueChange={(v) => v && setValue('metodo_pago', v as MetodoPago)}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent className={selectContentClass}>
              <SelectItem value="efectivo">Efectivo</SelectItem>
              <SelectItem value="transferencia">Transferencia</SelectItem>
              <SelectItem value="td">T. Débito</SelectItem>
              <SelectItem value="tc">T. Crédito</SelectItem>
              <SelectItem value="pse">PSE</SelectItem>
            </SelectContent>
          </Select>
          {errors.metodo_pago && <p className="text-sm text-rose-500">{errors.metodo_pago.message}</p>}
        </div>

        <div className={wrapperClass}>
          <Label className={labelClass}>Fecha</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant={"outline"}
                  className={cn(
                    inputClass,
                    "w-full justify-start text-left font-normal",
                    !fecha && "text-muted-foreground"
                  )}
                />
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fecha ? format(fecha, 'PPP', { locale: es }) : <span>Selecciona fecha</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 shadow-2xl text-white">
              <Calendar
                mode="single"
                selected={fecha}
                onSelect={(d) => d && setValue('fecha', d)}
              />
            </PopoverContent>
          </Popover>
          {errors.fecha && <p className="text-sm text-rose-500">{errors.fecha.message}</p>}
        </div>
      </div>

      {isCreditCard && tipoValue === 'gasto' && !initialData && (
        <div className="flex flex-col gap-1 mb-4 border border-rose-500/20 bg-rose-500/10 p-4 rounded-xl mt-4 backdrop-blur-md">
          <Label htmlFor="cuotas" className="text-rose-400 font-semibold text-sm">Diferir a Cuotas (Meses)</Label>
          <Input 
            id="cuotas" 
            type="number" 
            min="1" max="72"
            className={inputClass}
            {...register('cuotas', { valueAsNumber: true })} 
          />
          <p className="text-xs text-rose-300/80 mt-1">
            Si ingresas más de 1 cuota, el monto total se dividirá y se proyectará automáticamente en tus próximos meses.
          </p>
        </div>
      )}

      {/* NOTA */}
      <div className={wrapperClass}>
        <Label htmlFor="nota" className={labelClass}>Nota (Opcional)</Label>
        <Textarea 
          id="nota" 
          placeholder="Agrega un detalle sobre este movimiento..." 
          {...register('nota')}
          className={cn(inputClass, "resize-none h-20")}
        />
        {errors.nota && <p className="text-sm text-rose-500">{errors.nota.message}</p>}
      </div>

      <Button 
        type="submit" 
        disabled={isPending} 
        className="w-full py-3 bg-[#62aeae] hover:bg-[#4a8a8a] text-white font-medium rounded-xl mt-6 shadow-xl border border-white/10"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Guardar Cambios' : 'Guardar Movimiento'}
      </Button>
    </form>
  );
}
