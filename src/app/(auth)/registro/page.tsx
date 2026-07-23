import { RegistroForm } from '@/features/auth';
import Link from 'next/link';

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 shadow-sm">
            <span className="text-xl font-bold text-white">D</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Únete a DIMO y toma el control de tus finanzas.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-200">
          <RegistroForm />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
