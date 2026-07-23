'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCrearMovimiento } from '@/features/movimientos/hooks/useMovimientosQuery';
import { useCuentas } from '@/features/cuentas/hooks/useCuentasQuery';

const abonoSchema = z.object({
  monto: z.number().min(1, 'El monto debe ser mayor a 0'),
  cuenta_id: z.string().min(1, 'Selecciona una cuenta de origen'),
});

type AbonoFormValues = z.infer<typeof abonoSchema>;

interface AbonarGastoFijoDialogProps {
  categoriaId: string;
  categoriaNombre: string;
  montoRecomendado: number;
}

export function AbonarGastoFijoDialog({ categoriaId, categoriaNombre, montoRecomendado }: AbonarGastoFijoDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: cuentas = [], isLoading: isLoadingCuentas } = useCuentas();
  const { mutateAsync: crearMovimiento, isPending } = useCrearMovimiento();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AbonoFormValues>({
    resolver: zodResolver(abonoSchema),
    defaultValues: {
      monto: montoRecomendado > 0 ? montoRecomendado : undefined,
      cuenta_id: '',
    },
  });

  const cuentaValue = watch('cuenta_id');

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      reset({
        monto: montoRecomendado > 0 ? montoRecomendado : undefined,
        cuenta_id: cuentaValue || '',
      });
    }
  };

  async function onSubmit(data: AbonoFormValues) {
    try {
      await crearMovimiento({
        tipo: 'gasto',
        monto: data.monto,
        fecha: new Date().toISOString(),
        nota: `Abono a ${categoriaNombre}`,
        categoria_id: categoriaId,
        cuenta_id: data.cuenta_id,
      });
      setOpen(false);
      reset();
    } catch (error) {
      console.error('Error al registrar abono:', error);
    }
  }

  const inputClass = "bg-black/20 backdrop-blur-md shadow-inner border-white/10 focus:border-[#62aeae] focus:ring-[#62aeae] text-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Abonar a Gasto Fijo" />}>
        <Plus className="h-5 w-5" />
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[400px] bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            Abonar a {categoriaNombre}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Registra un pago o abono rápido para este gasto fijo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="monto" className="text-zinc-300 font-semibold text-sm">Monto a abonar ($)</Label>
            <Input 
              id="monto" 
              type="number"
              step="0.01"
              className={inputClass}
              {...register('monto', { valueAsNumber: true })} 
            />
            {errors.monto && <p className="text-sm text-rose-500 mt-1">{errors.monto.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="cuenta_id" className="text-zinc-300 font-semibold text-sm">Cuenta Origen</Label>
            <Select value={cuentaValue} onValueChange={(v: any) => v && setValue('cuenta_id', v)}>
              <SelectTrigger className={inputClass} disabled={isLoadingCuentas}>
                <SelectValue placeholder="Selecciona de dónde sale el dinero">
                  {cuentaValue ? cuentas.find((c: any) => c.id === cuentaValue)?.nombre : 'Selecciona de dónde sale el dinero'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 text-white z-[100] shadow-2xl">
                {cuentas.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cuenta_id && <p className="text-sm text-rose-500 mt-1">{errors.cuenta_id.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full py-3 bg-[#62aeae] hover:bg-[#4a8a8a] text-white font-medium rounded-xl mt-4 shadow-xl border border-white/10"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Abono
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
