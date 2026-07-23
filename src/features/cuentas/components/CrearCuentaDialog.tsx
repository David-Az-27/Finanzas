'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CuentaForm } from './CuentaForm';

export function CrearCuentaDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#62aeae] hover:bg-[#4a8a8a] text-white shadow-xl border border-white/10" />}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Cuenta
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-white">Crear Cuenta</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Añade una nueva cuenta bancaria, billetera o tarjeta para gestionar tus finanzas.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full">
          <CuentaForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
