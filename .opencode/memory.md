# Memory — GLAMOURS Tienda de Ropa

## 1. Identidad
- **Nombre**: GLAMOURS
- **Rubro**: Indumentaria unisex (hombre, mujer, niños, bebes, unisex)
- **Ubicación**: Italia 1037, Luján, Argentina
- **URLs**: https://glamours-lujan.onrender.com (Render - suspendido hasta 01/06), https://glamours-lujan.vercel.app (Vercel)
- **GitHub**: https://github.com/webfireone/Tienda-de-Ropa
- **Rama**: trabajar siempre sobre `main`; cambios visuales grandes en `test-*` branch primero

## 2. Stack
| Capa | Tecnología | Versión |
|---|---|---|
| UI | React + TypeScript | 19.2.5 / 6.0.2 |
| Build | Vite | 8.0.10 |
| Estilos | Tailwind CSS 4 + PostCSS + Autoprefixer | 4.3.0 |
| Ruteo | React Router DOM | 7.15.0 |
| Estado | Zustand + TanStack Query | 5.0.13 / 5.100.9 |
| BBDD | Firebase Firestore | 12.13.0 |
| Auth | Firebase Auth (email + Google) | 12.13.0 |
| Storage | Firebase Storage (caída a data URLs) | 12.13.0 |
| Backend | Express | 5.2.1 |
| Pagos | Mercado Pago SDK | 3.0.0 |
| Animaciones | Framer Motion + Lenis (smooth scroll) | 12.38.0 / 1.3.23 |
| Testing | Vitest + Testing Library | 4.1.6 |
| Linting | ESLint 10 + typescript-eslint | 10.2.1 |
| Deploy | Render (server+frontend) + Vercel (frontend + serverless) | — |

## 3. Estructura src/

```
src/
├── App.tsx                    # Router con 19 rutas lazy
├── main.tsx                   # Entry point + unregister SW
├── index.css                  # CSS variables del tema
├── context/
│   ├── AuthContext.tsx         # Firebase Auth (email/password, Google, reset)
│   ├── CartContext.tsx
│   └── ParamsContext.tsx
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # Outlet + Header + WhatsApp + BackgroundMusic + PlayRegistration + SmoothScroll
│   │   ├── Header.tsx          # Nav con dropdown admin
│   │   ├── Sidebar.tsx
│   │   ├── Logo.tsx
│   │   ├── SmoothScroll.tsx
│   │   └── ViewTransitionOutlet.tsx
│   ├── ui/                     # button, card, input, select, table, tabs, badge, switch, LoginModal, CursorGlow
│   ├── products/               # CRUD productos
│   ├── catalog/                # Catálogo y detalle de producto
│   ├── cart/                   # Carrito
│   ├── dashboard/              # Dashboard financiero (KPIs, Recharts, grid dinámico)
│   ├── alerts/                 # Alertas automáticas
│   ├── import-export/          # Import/Export CSV/Excel
│   ├── config/                 # Configuración global
│   ├── music/                  # Reproductor de música (discos, canciones, PlayRegistration)
│   ├── BackgroundMusic.tsx     # Música de fondo persistente
│   └── HeroParticles.tsx
├── hooks/
│   ├── useFirestore.ts         # CRUD genérico Firestore
│   ├── useProducts.ts, useOrders.ts, useAlerts.ts, usePromotions.ts, useMusic.ts
│   ├── useSiteTheme.ts         # Tema desde Firestore
│   ├── useScrollReveal.tsx, useMagneticHover.ts
│   └── useViewTransitionNavigate.ts
├── store/ (Zustand)
│   ├── bellezaStore.ts         # 1393 líneas — sistema de temas visuales (22 fondos, 22 colores CSS, fuentes, scrollbar, focus)
│   ├── cartStore.ts            # Carrito persistente (localStorage)
│   ├── musicStore.ts           # Estado del reproductor musical
│   ├── ordersStore.ts          # Órdenes
│   ├── paramsStore.ts          # Parámetros globales (sync Firestore)
│   └── themeStore.ts
├── lib/
│   ├── api.ts                  # apiUrl() helper — hostname detection para Render→Vercel
│   ├── firebase.ts             # Config Firebase + exports (db, auth, storage)
│   ├── imageStorage.ts         # Upload + resize (600px, JPEG 0.6) + fallback data URL
│   ├── audioStorage.ts         # Upload audio (IndexedDB)
│   ├── calculations.ts, projections.ts, constants.ts, utils.ts
│   ├── argentina-data.ts       # Provincias, ciudades
│   ├── mockStorage.ts          # Datos mock para dev sin Firebase
│   ├── migrateOrders.ts        # Migración de órdenes a Firestore
│   └── orderAlerts.ts          # Generación de alertas (stock, precio, margen)
├── types/
│   ├── index.ts                # Product, Order, Sale, Alert, Promotion, GlobalParams, etc.
│   └── music.ts                # Disco, Cancion
└── pages/ (19, lazy)
    ├── LandingPage, CatalogPage, ProductDetailPage, CartPage, LoginPage
    ├── DashboardPage, ProductsPage, OrdersPage
    ├── OfertasPage, NuevaColeccionPage, MarketingPage, AlertsPage, ImportExportPage, ConfigPage
    ├── BellezaPage (personalización visual), MusicPage, AdminMusicPage
    ├── AdminHomePage, NotFoundPage
```

## 4. API Layer
- **Vercel Serverless** (`api/*.js`): las APIs viven acá. `POST /api/create-preference` (MP), `GET /api/status-servicios`, pagos, etc.
- **Render** es Static Site → NO corre Express ni tiene backend. Sirve solo el SPA.
- **Comunicación Render→Vercel**: el SPA en Render detecta hostname y llama a Vercel vía `apiUrl()` helper.
- **server.js**: solo para dev local (`npm run dev:server`), no se deploya a ningún lado.
- **SPA routing**: Render Static Site sirve `index.html` para todas las rutas no encontradas (SPA fallback automático).

## 5. Firebase
- **Colecciones**: `products`, `orders`, `users`, `siteConfig/theme`, `promotions`, `subscribers`
- **Auth**: email/password + Google; roles admin/viewer; admins hardcodeados: `admin@tiendaropa.com`, `tiendaderopa@admin.com`
- **Storage**: NO habilitado → imágenes se guardan como data URLs comprimidas en Firestore (~50-150KB)
- **Modo mock**: si `VITE_FIREBASE_API_KEY` no existe o es "demo-api-key", opera sin Firebase

## 6. Sistema de Temas (bellezaStore.ts)
- 22 tipos de fondo (gradient-dark, gradient-mesh, sunset, ocean, forest, purple, rose, gold, sky, snow, peach, lavender, cream, particles, grid, stars, abstract, solid-dark, solid-card, solid-white-min, custom, etc.)
- Paleta de 22 colores CSS customizables
- Fuentes: Google Fonts precargadas (Inter, Playfair, Montserrat, Poppins, etc.)
- Scrollbar styles, focus styles, CursorGlow
- Persistencia: Firestore (`siteConfig/theme`) + localStorage fallback
- `bodyWeight` controla `--font-weight-body`

## 7. Funcionalidades Clave
1. **Catálogo** con filtros (género, categoría, marca, talle, color)
2. **Carrito persistente** (Zustand + localStorage)
3. **Checkout Mercado Pago** + métodos de pago configurables
4. **Dashboard financiero**: KPIs, proyecciones (3 escenarios), Recharts
5. **CRUD productos** + import/export masivo (CSV/Excel)
6. **Órdenes** con migración a Firestore
7. **Alertas automáticas** (stock bajo, variación precio, margen negativo)
8. **Marketing**: promociones con código + banners, newsletter
9. **Sección música**: discos, reproductor inline, cache IndexedDB, colores por estilo
10. **Personalización visual total** (BellezaPage)
11. **View Transitions API** para navegación nativa

## 8. Issues Conocidos (mobile audit)
### CRÍTICOS (no funcional en mobile)
- Carrito: botón Eliminar invisible (hover-only) → FIXED
- AdminMusicPanel: botones Editar/Eliminar invisibles → FIXED
- ProductCard: CTA "Ver producto" invisible → FIXED
- BackgroundMusic: modal no se podía cerrar → FIXED
### HIGH (touch targets)
- Nav móvil: botones <44px, texto 9px → FIXED
- Header ocupa ~120px
- Sin safe-area-inset-bottom → elementos fijos detrás del notch
- Sin bottom padding → contenido tapado por WSP + reproductor
### MEDIUM
- Textos en 9-11px (WCAG recomienda 12px)
- Lenis touchMultiplier: 2 → scroll rápido
- Belleza toast se superpone con WSP/reproductor
- Sin galería de imágenes/swipe en ProductDetail

## 9. Deploy
| Plataforma | URL | Plan | Tipo | Estado |
|---|---|---|---|---|---|
| Render | glamours-lujan.onrender.com | Free | Static Site | Activo (reactivado 03/06) |
| Vercel | glamours-lujan.vercel.app | Hobby | Frontend + Serverless | Activo, auto-deploy desde main |

### Arquitectura
```
Browser ──→ Render (static SPA) ──apiUrl()──→ Vercel (serverless /api/*)
                                                  │
                                                  └──→ Firebase, GitHub, MP APIs
```

### Build único, dos plataformas
- `vite.config.ts`: `outDir = process.env.RENDER ? "client" : "dist" `
- Vercel publica `dist/`, Render publica `client/`
- Ambos reciben el MISMO build (mismo código fuente, mismo bundle)
- Render dashboard: Publish Directory = `client` (cambiado manualmente)

### API calls desde el SPA
- `src/lib/api.ts`: helper `apiUrl(path)` que en Render (`*.onrender.com`) antepone `https://glamours-lujan.vercel.app`, en cualquier otro lado usa ruta relativa.
- Render NO tiene backend → las requests `/api/*` en Render van a Vercel (cross-origin).
- CORS habilitado en `api/status-servicios.js` con `Access-Control-Allow-Origin: *`.

### Env vars importantes (render.yaml)
- `VITE_API_BASE_URL` → definida en `render.yaml` pero la detección por hostname es la que realmente funciona.
- `RENDER` (automática de Render) → usada en `vite.config.ts` para `outDir` condicional.

### 03/06/2026 — Sesión Render (reactivación + fixes)
- [x] Render reactivado (estaba suspendido)
- [x] Descubrimiento: Render era Static Site, no Web Service → ajustada arquitectura
- [x] Cambiar `outDir:` de `dist` a `client/` para Render (condicional por `process.env.RENDER`)
- [x] Publish Directory en dashboard Render: cambiar de `dist` a `client`
- [x] `src/lib/api.ts` creado con detección por hostname para routing de APIs
- [x] CORS agregado a `api/status-servicios.js` para requests cross-origin desde Render
- [x] Ambos deploys sincronizados y verificados: mismo build, mismo JS, misma homepage

## 10. Últimos Commits (del más reciente)
| Hash | Descripción |
|---|---|
| 78599ce | fix: agregar CORS headers a status-servicios para Render |
| d132532 | fix: detectar Render por hostname en lugar de env var |
| 5fa5972 | fix: apiUrl helper con VITE_API_BASE_URL para Render + render.yaml static type |
| 84d5661 | fix: cambiar outDir de dist a client para evitar auto-static de Render |
| 1afdc2b | fix: server.js minimo sin dependencias externas para aislar problema |
| a1b5cac | fix: static import mercadopago sin top-level await, solo try/catch en configure |
| 7309933 | fix: eliminar mercadopago.configure() suelto que crasheaba el servidor |
| 0f5e864 | feat: preparar deploy a Render - healthz endpoint, postinstall, vite configs |
| d0c27b0 | fix(CartPage): stepper baja a fila separada en mobile |
| 256085c | feat(ProductDetailModal): lightbox al tap imagen |
| 0099250 | fix: audio reproduce en mobile + modal cerrable |
| b0bee79 | fix: boton eliminar carrito siempre visible en mobile |
| fcb4763 | docs: mobile audit completo |

## 11. Notas Técnicas Importantes
- **Firebase Storage no disponible** → imágenes como data URLs en Firestore
- **Tailwind JIT** no genera `bg-[color]` desde arrays dinámicos → usar `style={{ backgroundColor }}`
- **CSS variables** de música scoped con `.music-section` para evitar conflicto con Belleza
- **Disc rings** con `box-shadow` + `margin-left: -2px` (no mask)
- **Audio mobile**: `new Audio()` fuera del user gesture; prefetch secuencial; cache IndexedDB
- **auth/email-already-in-use**: SOLO lo tira `createUserWithEmailAndPassword` (registro), nunca login
- **Normalize en backfill**: recorta whitespace, tildes, guiones y paréntesis para matchear títulos
