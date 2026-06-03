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

## 4. Backend
- **Express server.js** en Render: `POST /api/create-preference` (Mercado Pago), webhook, páginas de resultado pago
- **Vercel Serverless**: funciones `api/` replicadas para compatibilidad
- Sirve `dist/` como estático + catch-all SPA

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
| Plataforma | URL | Plan | Estado |
|---|---|---|---|
| Render | glamours-lujan.onrender.com | Free | **Suspendido hasta 01/06/2026** (cuota agotada) |
| Vercel | glamours-lujan.vercel.app | Hobby | Activo, auto-deploy desde main |
| Firebase | tienda-de-ropa-35bea | Spark | Activo |

### 01/06/2026 — Checklist reactivar Render
- [ ] Reactivar servicios en dashboard.render.com (2 web + 7 static)
- [ ] Manual Deploy → Deploy Latest Commit
- [ ] Replicar serverless functions (`api/`) y config Vercel en Render
- [ ] Configurar env vars: `MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_B64`, `GH_TOKEN`, `RENDER_API_KEY`, `VERCEL_API_TOKEN`
- [ ] Confirmar https://glamours-lujan.onrender.com + endpoints API

## 10. Últimos Commits (del más reciente)
| Hash | Descripción |
|---|---|
| b3fb5c3 | docs: update memory.md + Render 01/06 checklist |
| 11f9a0c | docs: changelog BellezaPage, StatusServicios, admin dropdown |
| 437c4e1 | refactor(BellezaPage): preview completa + bodyWeight; feat: StatusServiciosPage, admin dropdown, api status-servicios, instructivo carga PDF |
| dbf213a | docs: causa raíz saltos de línea en títulos que rompían backfill mobile |
| 7c44c9c | fix: normalize guiones y paréntesis en backfill; play() sincrónico iOS |
| 5096c31 | fix: audio no reproduce en mobile iOS Safari |
| 74d9bc8 | feat: add Vercel Serverless Functions + deployment config |
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
