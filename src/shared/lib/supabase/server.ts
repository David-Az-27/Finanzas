import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Crea un cliente de Supabase para el servidor (Server Components, Server Actions).
 *
 * NOTA: Para obtener tipado completo, ejecuta:
 *   npx supabase gen types typescript --project-id <tu-project-id> > src/shared/types/database.ts
 * y luego agrega el genérico: createServerClient<Database>(...)
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll se llama desde un Server Component.
            // Se puede ignorar si tenemos middleware que refresca las cookies.
          }
        },
      },
      cookieOptions: {
        maxAge: 30 * 60, // 30 minutos de inactividad
      },
    }
  );
}
