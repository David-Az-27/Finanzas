'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

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

import { useCrearCategoria, useActualizarCategoria } from '../hooks/useCategoriasQuery';
import type { Categoria } from '@/shared/types';

import { Switch } from '@/components/ui/switch';

const categoriaFormSchema = z.object({
  nombre: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  tipo: z.enum(['ingreso', 'gasto']),
  es_pago_fijo: z.boolean(),
  dia_pago: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 1 && num <= 31;
  }, { message: 'Debe ser un día entre 1 y 31' }),
});

type CategoriaFormValues = z.infer<typeof categoriaFormSchema>;

interface CategoriaFormProps {
  onSuccess?: () => void;
  categoria?: Categoria;
}

export function CategoriaForm({ onSuccess, categoria }: CategoriaFormProps) {
  const { mutateAsync: crearCategoria, isPending: isCreando } = useCrearCategoria();
  const { mutateAsync: actualizarCategoria, isPending: isActualizando } = useActualizarCategoria();
  
  const isPending = isCreando || isActualizando;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues: {
      nombre: categoria?.nombre || '',
      tipo: categoria?.tipo || 'gasto',
      es_pago_fijo: categoria?.es_pago_fijo || false,
      dia_pago: categoria?.dia_pago ? String(categoria.dia_pago) : '',
    },
  });

  const tipoValue = watch('tipo');
  const esPagoFijoValue = watch('es_pago_fijo');

  async function onSubmit(data: CategoriaFormValues) {
    try {
      const payload = {
        ...data,
        dia_pago: data.es_pago_fijo && data.dia_pago ? parseInt(data.dia_pago, 10) : null,
      };

      if (categoria) {
        await actualizarCategoria({ id: categoria.id, input: payload });
      } else {
        await crearCategoria(payload);
      }
      
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear categoría:', error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de la Categoría</Label>
        <Input id="nombre" placeholder="Ej: Comida, Sueldo" {...register('nombre')} />
        {errors.nombre && <p className="text-sm text-rose-500">{errors.nombre.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select value={tipoValue} onValueChange={(v: any) => {
          setValue('tipo', v);
          if (v === 'ingreso') {
            setValue('es_pago_fijo', false);
            setValue('dia_pago', '');
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ingreso">Ingreso</SelectItem>
            <SelectItem value="gasto">Gasto</SelectItem>
          </SelectContent>
        </Select>
        {errors.tipo && <p className="text-sm text-rose-500">{errors.tipo.message}</p>}
      </div>

      {tipoValue === 'gasto' && (
        <div className="flex flex-col gap-4 p-4 rounded-lg border border-white/10 bg-transparent">
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base text-white">Gasto Fijo Mensual</Label>
              <p className="text-xs text-zinc-400">
                ¿Es un gasto fijo mensual / Pago?
              </p>
            </div>
            <Switch
              checked={esPagoFijoValue}
              onCheckedChange={(checked) => setValue('es_pago_fijo', checked)}
            />
          </div>
          
          {esPagoFijoValue && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <Label htmlFor="dia_pago" className="text-white">Día de Pago (1 - 31)</Label>
              <Input 
                id="dia_pago" 
                type="number" 
                min={1} 
                max={31} 
                placeholder="Ej: 15" 
                {...register('dia_pago')} 
              />
              {errors.dia_pago && <p className="text-sm text-rose-500">{errors.dia_pago.message}</p>}
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} className="bg-[#62aeae] hover:bg-[#4d8f8f] text-white">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {categoria ? 'Guardar Cambios' : 'Guardar Categoría'}
        </Button>
      </div>
    </form>
  );
}
