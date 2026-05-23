# Base de Conocimiento — Glamours Tienda de Ropa

## Stack
- React + TypeScript + Vite
- Tailwind CSS v4
- Firebase (Auth, Firestore, Storage)
- Render (deploy automático desde GitHub main)
- react-router-dom v7

## Despliegue
- **URL**: https://glamours-lujan.onrender.com
- **GitHub**: https://github.com/webfireone/Tienda-de-Ropa
- Deploy automático al pushear a `main`
- Build: `npm run build` (tsc -b && vite build)
- Dev: `npm run dev` (vite)

## Rama de trabajo
- Trabajar siempre sobre `main`
- Para cambios visuales grandes, usar `test-*` branch primero y mergear tras aprobación

## Autenticación (Firebase Auth)
- **signIn** → `signInWithEmailAndPassword`
- **signUp** → `createUserWithEmailAndPassword`
- **signInWithGoogle** → `signInWithPopup` con `GoogleAuthProvider`
- **resetPassword** → `sendPasswordResetEmail`
- Contexto: `AuthContext.tsx` → `useAuth()` hook
- LoginModal (modal inline en producto/carrito) y LoginPage (`/login`)
- Todos los modos (login, registro, restablecer) están inline en ambos componentes
- `auth/email-already-in-use` SOLO lo tira `createUserWithEmailAndPassword` (signUp), nunca `signInWithEmailAndPassword`. Si el usuario lo ve al "loguearse" es porque está en el formulario de registro.

## Roles
- `viewer` (default) / `admin`
- Admin emails hardcodeados: `admin@tiendaropa.com`, `tiendaderopa@admin.com`
- Modo mock cuando no hay VITE_FIREBASE_API_KEY o es "demo-api-key"

## Música (MusicPage)
- Discos con reproductor inline, colores por estilo musical
- Colores de discos: inline `style={{ backgroundColor }}` (no Tailwind arbitrario, porque JIT no genera clases desde arrays)
- Variables CSS scoped con `.music-section` para evitar conflicto con Belleza/hamburguesa
- Disc rings con `box-shadow` + `margin-left: -2px` (no mask)
- Audio: carga on-demand con prefetch secuencial del próximo tema
- Cache de audio para reproducción instantánea en mobile

## Elementos UI fijos (tamaños reducidos)
- **WhatsApp flotante**: `w-11 h-11` (44px), icono `h-5 w-5`, abajo izquierda
- **Reproductor música**: `w-8 h-8` (32px) botón play, barra progreso `w-12 h-0.5`, abajo derecha
- **Nav móvil inferior**: texto `text-[9px]`, iconos `h-2 w-2`, padding reducido

## Errores conocidos y soluciones
1. **Discos sin color**: Tailwind JIT no genera `bg-[color]` desde arrays → usar `style={{ backgroundColor }}`
2. **Variables CSS pisadas**: usar selector `.music-section` para scoping
3. **Disc rings no visibles**: cambiar de mask a `box-shadow` + `margin`
4. **Audio no reproduce en mobile iOS/Safari**: `new Audio()` directo + prefetch secuencial con caché
5. **Botón login gris en product modal**: habilitar cuando el único blocker es auth (comparar arrays de razones)
6. **auth/email-already-in-use falsamente atribuido a login**: el error es de `createUser`, no de `signInWithEmailAndPassword`. Ocurre cuando el usuario está en el formulario de registro.
