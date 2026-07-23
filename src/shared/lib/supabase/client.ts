import { createBrowserClient } from '@supabase/ssr';

/**
 * Crea un cliente de Supabase para el navegador (Client Components).
 *
 * NOTA: Para obtener tipado completo, ejecuta:
 *   npx supabase gen types typescript --project-id <tu-project-id> > src/shared/types/database.ts
 * y luego agrega el genérico: createBrowserClient<Database>(...)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: 30 * 60, // 30 minutos de inactividad
      },
    }
  );
}
