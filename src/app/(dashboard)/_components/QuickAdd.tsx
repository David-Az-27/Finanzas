'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MovimientoForm } from '@/features/movimientos/components/MovimientoForm';
import { useQueryClient } from '@tanstack/react-query';

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    setOpen(false);
    queryClient.invalidateQueries(); 
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-transform hover:scale-105">
        <Plus className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0f172a]/95 backdrop-blur-2xl border-white/10 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Añadir Rápido</DialogTitle>
        </DialogHeader>
        <div className="mt-2 max-h-[70vh] overflow-y-auto px-1">
          <MovimientoForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
