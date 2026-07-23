'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
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
import type { Categoria } from '@/shared/types';

interface EditarCategoriaDialogProps {
  categoria: Categoria;
}

export function EditarCategoriaDialog({ categoria }: EditarCategoriaDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-white transition-all" />
        }
      >
        <Pencil className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-transparent text-white">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Modifica los detalles de esta categoría.
          </DialogDescription>
        </DialogHeader>
        <CategoriaForm onSuccess={() => setOpen(false)} categoria={categoria} />
      </DialogContent>
    </Dialog>
  );
}
