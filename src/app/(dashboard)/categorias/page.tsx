import { CategoriasTable } from '@/features/categorias/components/CategoriasTable';
import { CrearCategoriaDialog } from '@/features/categorias/components/CrearCategoriaDialog';

export default function CategoriasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Categorías</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Organiza tus ingresos y gastos de forma estructurada.
          </p>
        </div>
        <CrearCategoriaDialog />
      </div>
      
      <CategoriasTable />
    </div>
  );
}
