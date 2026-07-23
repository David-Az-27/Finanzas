'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import type { Cuenta } from '@/shared/types';

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

import { useCrearCuenta, useActualizarCuenta } from '../hooks/useCuentasQuery';

const cuentaFormSchema = z.object({
  nombre: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  institucion: z.string().optional(),
  tipo: z.enum(['efectivo', 'ahorros', 'corriente', 'inversion', 'bolsillo', 'tarjeta_credito']),
  es_para_ahorro: z.boolean(),
  tasa_rendimiento: z.number().optional().or(z.nan().transform(() => undefined)),
  limite_credito: z.number().optional().or(z.nan().transform(() => undefined)),
  dia_corte: z.number().min(1).max(31).optional().or(z.nan().transform(() => undefined)),
  dia_pago: z.number().min(1).max(31).optional().or(z.nan().transform(() => undefined)),
});

type CuentaFormValues = z.infer<typeof cuentaFormSchema>;

interface CuentaFormProps {
  onSuccess?: () => void;
  initialData?: Cuenta;
}

export function CuentaForm({ onSuccess, initialData }: CuentaFormProps) {
  const { mutateAsync: crearCuenta, isPending: isCreating } = useCrearCuenta();
  const { mutateAsync: actualizarCuenta, isPending: isUpdating } = useActualizarCuenta();
  
  const isPending = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CuentaFormValues>({
    resolver: zodResolver(cuentaFormSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      institucion: initialData?.institucion || '',
      tipo: initialData?.tipo || 'ahorros',
      es_para_ahorro: initialData?.es_para_ahorro || false,
      tasa_rendimiento: initialData?.tasa_rendimiento || undefined,
      limite_credito: initialData?.limite_credito || undefined,
      dia_corte: initialData?.dia_corte || undefined,
      dia_pago: initialData?.dia_pago || undefined,
    },
  });

  const tipoValue = watch('tipo');

  async function onSubmit(data: CuentaFormValues) {
    try {
      if (initialData) {
        await actualizarCuenta({ id: initialData.id, input: data });
      } else {
        await crearCuenta(data);
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
    }
  }

  // Clases compartidas requeridas
  const labelClass = "text-zinc-300 font-semibold text-sm block mb-2";
  const inputClass = "bg-black/20 backdrop-blur-md shadow-inner border-white/10 focus:border-[#62aeae] focus:ring-[#62aeae] text-white";
  const wrapperClass = "flex flex-col gap-1 mb-4";
  const selectContentClass = "bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 text-white z-50 shadow-2xl";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className={wrapperClass}>
        <Label htmlFor="nombre" className={labelClass}>Nombre de la Cuenta</Label>
        <Input 
          id="nombre" 
          placeholder="Ej: Cuenta Nómina" 
          className={inputClass}
          {...register('nombre')} 
        />
        {errors.nombre && <p className="text-sm text-rose-500 mt-1">{errors.nombre.message}</p>}
      </div>

      <div className={wrapperClass}>
        <Label htmlFor="institucion" className={labelClass}>Institución (Opcional)</Label>
        <Input 
          id="institucion" 
          placeholder="Ej: Bancolombia, Nu" 
          className={inputClass}
          {...register('institucion')} 
        />
      </div>

      <div className={wrapperClass}>
        <Label htmlFor="tipo" className={labelClass}>Tipo de Cuenta</Label>
        <Select value={tipoValue} onValueChange={(v: any) => setValue('tipo', v)}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent className={selectContentClass}>
            <SelectItem value="efectivo">Efectivo</SelectItem>
            <SelectItem value="ahorros">Ahorros</SelectItem>
            <SelectItem value="corriente">Corriente</SelectItem>
            <SelectItem value="inversion">Inversión</SelectItem>
            <SelectItem value="bolsillo">Bolsillo</SelectItem>
            <SelectItem value="tarjeta_credito">Tarjeta de Crédito</SelectItem>
          </SelectContent>
        </Select>
        {errors.tipo && <p className="text-sm text-rose-500 mt-1">{errors.tipo.message}</p>}
      </div>

      {tipoValue === 'tarjeta_credito' ? (
        <div className="space-y-4 mb-4 border border-rose-500/20 bg-rose-500/10 p-4 rounded-xl backdrop-blur-md">
          <h4 className="font-semibold text-rose-400 text-sm">Detalles de Tarjeta de Crédito</h4>
          
          <div className="flex flex-col gap-1">
            <Label htmlFor="limite_credito" className={labelClass}>Límite Aprobado ($)</Label>
            <Input 
              id="limite_credito" 
              type="number" 
              placeholder="Ej: 5000" 
              className={inputClass}
              {...register('limite_credito', { valueAsNumber: true })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="dia_corte" className={labelClass}>Día de Corte</Label>
              <Input 
                id="dia_corte" 
                type="number" 
                min="1" max="31"
                placeholder="1-31" 
                className={inputClass}
                {...register('dia_corte', { valueAsNumber: true })} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="dia_pago" className={labelClass}>Día Límite de Pago</Label>
              <Input 
                id="dia_pago" 
                type="number"
                min="1" max="31" 
                placeholder="1-31" 
                className={inputClass}
                {...register('dia_pago', { valueAsNumber: true })} 
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/10 p-4 mb-4 bg-black/20 backdrop-blur-md shadow-inner">
            <Input 
              type="checkbox"
              id="es_para_ahorro"
              className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#62aeae] focus:ring-[#62aeae] mt-1"
              {...register('es_para_ahorro')}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="es_para_ahorro" className="font-semibold text-white text-sm">
                Cuenta de Ahorro Estricto
              </Label>
              <p className="text-xs text-zinc-400">
                Marca esto si el dinero de esta cuenta es intocable (Ahorros reales). No la marques si es tu cuenta de gastos diarios o nómina.
              </p>
            </div>
          </div>

          <div className={wrapperClass}>
            <Label htmlFor="tasa_rendimiento" className={labelClass}>Tasa de Rendimiento % (Opcional)</Label>
            <Input 
              id="tasa_rendimiento" 
              type="number" 
              step="0.01" 
              placeholder="Ej: 9.5" 
              className={inputClass}
              {...register('tasa_rendimiento', { valueAsNumber: true })} 
            />
            <p className="text-xs text-zinc-400 mt-1">Tasa Efectiva Anual de rendimiento, si aplica.</p>
          </div>
        </>
      )}

      <Button 
        type="submit" 
        disabled={isPending}
        className="w-full py-3 bg-[#62aeae] hover:bg-[#4a8a8a] text-white font-medium rounded-xl mt-6 shadow-xl border border-white/10"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? 'Guardar Cambios' : 'Guardar Cuenta'}
      </Button>
    </form>
  );
}
