import { CuentasGrid } from '@/features/cuentas/components/CuentasGrid';
import { CrearCuentaDialog } from '@/features/cuentas/components/CrearCuentaDialog';

export default function CuentasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Cuentas</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Administra tus cuentas bancarias, efectivo y otros productos.
          </p>
        </div>
        <div>
          <CrearCuentaDialog />
        </div>
      </div>
      
      <CuentasGrid />
    </div>
  );
}
