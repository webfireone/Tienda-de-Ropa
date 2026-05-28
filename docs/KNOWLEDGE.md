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

## Mobile Audit — Issues encontrados

### CRÍTICOS (no funcional en mobile)
1. **CartPage**: botón Eliminar invisible (hover-only) → usuarios no pueden borrar items del carrito
2. **AdminMusicPanel**: botones Editar/Eliminar invisibles en mobile (hover-only)
3. **ProductCard**: CTA "Ver producto" invisible en mobile (hover-only)
4. **BackgroundMusic**: modal "Activá la música" no se puede cerrar (botón X no hace nada)

### HIGH (touch targets, legibilidad, scroll)
1. **Nav móvil**: botones ~18x14px (necesitan 44x44px mínimo), texto 9px ilegible
2. **Header**: ocupa ~120px vertical (18% del viewport en iPhone SE)
3. **CatalogPage**: filtros 27px de alto, buscador 32px, toggle vista 24x24px
4. **ProductDetailModal**: selector colores ~28px, talle ~30px, cantidad 36x36px
5. **CartPage**: +/- cantidad 32x32px, botón eliminar 26px
6. **MusicPlayer**: shuffle 32px, seek handle invisible (hover-only), corazón 28px
7. **BackgroundMusic**: mute 20px, play 32px, barra progreso 48x2px
8. **LoginModal/LoginPage**: botón ojo password con target ~16px, close modal 32px
9. **LoginModal/LoginPage**: sin `overflow-y-auto` → teclado oculta contenido
10. **BellezaPage**: botones heading weight se desbordan
11. **Sin bottom padding**: contenido del footer tapado por WSP + reproductor
12. **Sin safe-area-inset-bottom**: elementos fijos detrás del notch/home indicator

### MEDIUM (usabilidad)
1. Textos en 9px, 10px, 11px en toda la app (WCAG recomienda 12px mínimo)
2. Hover-only effects invisibles en mobile (admin badge, quick-view eye)
3. Lenis `touchMultiplier: 2` → scroll muy rápido en mobile
4. Belleza toast se superpone con WSP/reproductor (todos `bottom-6 z-50`)
5. CartPage: resumen no es sticky en mobile → hay que scrollear hasta el final
6. ConfigPage/OfertasPage/NuevaColeccion: touch targets pequeños en botones
7. Logo video sin poster fallback en mobile
8. Gránulo SVG (`body::before`) puede causar jank en gama baja
9. Catalog/ProductDetail: hover-only invisible en mobile
10. ProductDetail: sin galería de imágenes/swipe

### LOW (nice to have)
1. Letras decorativas en 9px (copyright, badges)
2. Hero `min-h-[400px]` ocupa full viewport en mobile chico
3. Inputs sin `loading="lazy"` en imágenes below-fold
4. Newsletter podría romperse en <320px
5. `prefers-reduced-motion` no respetado por inline styles de StaggerReveal
1. **Discos sin color**: Tailwind JIT no genera `bg-[color]` desde arrays → usar `style={{ backgroundColor }}`
2. **Variables CSS pisadas**: usar selector `.music-section` para scoping
3. **Disc rings no visibles**: cambiar de mask a `box-shadow` + `margin`
4. **Audio no reproduce en mobile iOS/Safari**: `new Audio()` directo + prefetch secuencial con caché
5. **Backfill por título falla si el título de Firestore tiene saltos de línea**: Cuando el usuario crea canciones en AdminMusicPanel, el textarea puede incluir `\n` al inicio/fin. El backfill compara `normalize(m.titulo) === normalize(song.titulo)` — si hay saltos de línea no matchea. **Solución manual**: editar en Firestore los campos `titulo` y eliminar `\n`. El normalize ahora recorta whitespace.
6. **Botón login gris en product modal**: habilitar cuando el único blocker es auth (comparar arrays de razones)
7. **auth/email-already-in-use falsamente atribuido a login**: el error es de `createUser`, no de `signInWithEmailAndPassword`. Ocurre cuando el usuario está en el formulario de registro.
