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
import { CategoriaForm } from './CategoriaForm';

export function CrearCategoriaDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="bg-[#62aeae] hover:bg-[#4d8f8f] text-white shadow-lg shadow-[#62aeae]/20 border-none rounded-full px-4" />}
      >
        <Plus className="mr-2 h-4 w-4" />
        Nueva Categoría
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-gray-950 text-white">
        <DialogHeader>
          <DialogTitle>Crear Categoría</DialogTitle>
          <DialogDescription className="text-gray-400">
            Añade una nueva categoría para organizar tus finanzas.
          </DialogDescription>
        </DialogHeader>
        <CategoriaForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
