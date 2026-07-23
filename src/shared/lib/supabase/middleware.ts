import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      cookieOptions: {
        maxAge: 30 * 60, // 30 minutos de inactividad
      },
    }
  );

  // IMPORTANTE: No escribir lógica entre createServerClient y supabase.auth.getUser().
  // Un simple error puede causar que los usuarios sean deslogueados aleatoriamente.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas de autenticación (públicas para no logueados, bloqueadas para logueados)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/registro');

  if (!user && !isAuthRoute) {
    // Si no hay usuario y no está en una ruta de auth, redirigir al login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    // Si hay usuario y está en una ruta de auth, redirigir al dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
