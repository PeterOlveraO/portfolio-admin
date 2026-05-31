# Implementación de Autenticación SvelteKit + Supabase Auth

## Arquitectura

```
hooks.server.ts          ← Intercept cada request; inyecta supabase + session en locals
app.d.ts                 ← Tipos App.Locals y App.PageData
lib/
  server/supabase.ts     ← createServerClient factory (SSR-aware, lee/escribe cookies)
  types/auth.ts          ← (existente, ampliar con LoginFormError)
routes/
  login/
    +page.server.ts      ← Form Actions: login, (guard si ya autenticado)
    +page.svelte         ← Consume ActionData para mostrar errores server-side
  dashboard/
    +layout.server.ts    ← Guard: locals.session → redirect si no hay sesión
    +layout.svelte       ← Muestra email + Form Action logout (sin JS obligatorio)
    logout/
      +server.ts         ← POST handler para logout
```

## Flujo de request

1. `hooks.server.ts` → crea `supabaseSSR` con cookies → llama `getSession()` → guarda en `locals`
2. Cualquier ruta bajo `/dashboard` → `+layout.server.ts` lee `locals.session` → redirect si null
3. Login → Form Action `login` → `signInWithPassword` → cookies se escriben automáticamente → redirect 303
4. Logout → Form Action `logout` en `/dashboard/logout` → `signOut` → cookies limpiadas → redirect 303
