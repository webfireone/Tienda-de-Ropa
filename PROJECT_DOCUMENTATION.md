# Documentación del Proyecto - Tienda de Ropa GLAMOURS

> **IMPORTANTE**: Este documento es una herramienta de referencia para que cualquier AI pueda comprender el proyecto al 100% y continuar con cualquier desarrollo o modificación. Mantener actualizado después de cada cambio significativo.

---

## 1. Información General del Proyecto

### Descripción
Tienda de ropa online/moda unisex con panel de administración completo. Proyecto desarrollado con React, TypeScript, Vite y Firebase. La tienda incluye catálogo de productos, carrito de compras, gestión de pedidos, dashboard analítico y marketing.

### Nombre del Proyecto
- **Nombre**: GLAMOURS - Tienda de Ropa
- **Versión**: 0.0.0
- **Tipo**: E-commerce + Admin Panel

### Características Principales
- Catálogo de productos con filtros por marca
- Carrito de compras persistente (localStorage)
- Checkout con múltiples métodos de pago
- Panel de administración con dashboard
- Gestión de productos (CRUD)
- Gestión de pedidos
- Alertas automáticas de stock
- Import/Export de productos (CSV/Excel)
- Marketing (promociones, suscriptores)
- Configuración global de parámetros
- Temas visuales configurables
- Modo mock para desarrollo sin Firebase

### Ubicación Física
```
C:\AI\Antigravity\Tienda de Ropa
```

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2.5 | Framework UI |
| React Router DOM | 7.15.0 | Enrutamiento |
| TypeScript | ~6.0.2 | Tipado estático |
| Vite | 8.0.10 | Build tool |
| Tailwind CSS | 4.3.0 | Estilos |
| Zustand | 5.0.13 | Estado global |
| TanStack Query | 5.100.9 | Data fetching |
| Framer Motion | 12.38.0 | Animaciones |
| Lucide React | 1.14.0 | Iconos |
| Lenis | 1.3.23 | Smooth scroll |
| Recharts | 3.8.1 | Gráficos |
| React Grid Layout | 2.2.3 | Layouts dinámicos |

### Firebase (Backend as a Service)
| Servicio | Uso |
|----------|-----|
| Firebase Auth | Autenticación (email/password, Google) |
| Firestore | Base de datos NoSQL |
| Firebase Analytics | Analytics |

### Utilidades
| Paquete | Propósito |
|---------|-----------|
| PapaParse | Parsing CSV |
| XLSX | Lectura/escritura Excel |
| jsPDF + jspdf-autotable | Generación PDFs |
| Sharp | Procesamiento de imágenes |
| Puppeteer | Scraping web |
| class-variance-authority | Variantes de componentes |
| tailwind-merge | Merging de clases |
| clsx | Conditional classes |

### Dev Dependencies
| Paquete | Propósito |
|---------|-----------|
| ESLint | Linting |
| PostCSS | Procesamiento CSS |
| Autoprefixer | Prefijos CSS |
| Vitest | Test runner |
| @testing-library/react | Renderizado de componentes en tests |
| @testing-library/jest-dom | Matchers DOM (toBeInTheDocument, etc.) |
| @testing-library/user-event | Simulación de eventos de usuario |
| jsdom | Entorno DOM para tests |

---

## 3. Configuración de Firebase

### Archivo de Configuración
`src/lib/firebase.ts`

```typescript
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tienda-ropa-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null
```

### Exports del Módulo
- `db`: Instancia de Firestore
- `auth`: Instancia de Firebase Auth
- `analytics`: Instancia de Analytics (solo en navegador)
- `app`: App de Firebase (default export)

### Colecciones de Firestore

| Colección | Propósito | Estructura |
|-----------|-----------|------------|
| `products` | Catálogo de productos | Product[] |
| `orders` | Pedidos | Order[] |
| `users` | Usuarios y roles | User[] |
| `siteConfig/theme` | Tema global del sitio | `{ config: FullThemeConfig, updatedAt, updatedBy }` |
| `promotions` | Promociones activas | Promotion[] |
| `subscribers` | Suscriptores newsletter | Subscriber[] |

---

### 3.1. Almacenamiento de Imágenes — `src/lib/imageStorage.ts`

**Propósito**: Gestionar la subida, redimensionamiento y almacenamiento de imágenes de productos.

**Funciones exportadas**:

| Función | Parámetros | Retorno | Propósito |
|---------|-----------|---------|-----------|
| `uploadProductImage(productId, file)` | `productId: string`, `file: File` | `Promise<string>` | Redimensiona y almacena imagen de producto |
| `uploadImageFile(imageId, file)` | `imageId: string`, `file: File` | `Promise<string>` | Similar a uploadProductImage, usada en importación masiva |
| `uploadDataUrlImage(imageId, dataUrl)` | `imageId: string`, `dataUrl: string` | `Promise<string>` | Convierte data URL a File, la redimensiona y la almacena |

**Flujo interno (`tryUploadOrDataUrl`)**:
1. `resizeImage(file, 600, 600, 0.6)` — redimensiona a máximo 600×600px, JPEG calidad 0.6
2. `blobToDataUrl(blob)` — convierte el blob redimensionado a data URL (fallback listo)
3. **Intenta Firebase Storage** con timeout de 15s: `uploadBytes(storageRef, blob)` → `getDownloadURL()`
4. Si Firebase Storage **falla** (timeout, bucket no disponible, error de red): retorna la **data URL comprimida** del paso 2

**Nota importante**: Firebase Storage no está habilitado en el proyecto `tienda-de-ropa-35bea` (el bucket GCS no existe). Todas las imágenes se almacenan como data URLs comprimidas en Firestore. El tamaño típico es ~50-150KB en base64, muy por debajo del límite de 1MB por documento de Firestore.

**Constantes de compresión**:
- `MAX_WIDTH` = 600, `MAX_HEIGHT` = 600
- `QUALITY` = 0.6 (JPEG)
- `STORAGE_TIMEOUT` = 15000ms

**Archivos relacionados**: `src/lib/firebase.ts`, `src/components/products/ProductForm.tsx`, `src/components/import-export/ImportDialog.tsx`

---

## 4. Variables de Entorno

### Archivo: `.env`

```env
VITE_FIREBASE_API_KEY=AIzaSyDpaNWYpfAI45bMQKoOHzIGKWvESKVIx50
VITE_FIREBASE_AUTH_DOMAIN=tienda-de-ropa-35bea.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tienda-de-ropa-35bea
VITE_FIREBASE_STORAGE_BUCKET=tienda-de-ropa-35bea.firebasestorage.app
VITE_FIREBASE_SENDER_ID=961273079910
VITE_FIREBASE_APP_ID=1:961273079910:web:0c82c93ab5895b8ad725a7
VITE_FIREBASE_MEASUREMENT_ID=G-7KMX0D6WVW
```

### Notas Importantes
- Si `VITE_FIREBASE_API_KEY` está vacía o es "demo-api-key", el sistema entra en **modo mock**
- En modo mock: no se conecta a Firebase, usa datos locales simulados
- El modo mock es útil para desarrollo sin configuración Firebase

---

## 5. Modelos de Datos (Types)

### Archivo: `src/types/index.ts`

#### User (Usuario)
```typescript
interface User {
  uid: string
  email: string
  role: Role
}

type Role = "admin" | "viewer"
```

#### Product (Producto)
```typescript
interface Product {
  id: string
  name: string
  brand: string
  category: string
  price: number
  cost: number
  description: string
  imageUrl: string
  colors: ProductColor[]
  material: string
  tags: string[]
  seccion: "general" | "outlet" | "nueva-coleccion"
  status: "active" | "draft" | "archived"
  createdAt: string
  updatedAt: string
}

interface ProductColor {
  name: string
  sizes: Record<string, number>  // { "S": 10, "M": 20, ... }
}
```

#### Order (Pedido)
```typescript
interface OrderItem {
  productId: string
  productName: string
  brand: string
  color: string
  size: string
  quantity: number
  unitPrice: number
  imageUrl: string
}

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryMethod: "shipping" | "pickup"
  deliveryAddress?: string
  deliveryCity?: string
  deliveryPostalCode?: string
  paymentMethod: string
  paymentRate: number
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  createdAt: string
}
```

#### GlobalParams (Parámetros Globales)
```typescript
interface PaymentMethod {
  name: string
  rate: number  // Porcentaje de recargo (ej: 0.03 = 3%)
}

interface GlobalParams {
  cart: {
    baseCharge: number  // Cargo base (ej: 0.15 = 15%)
    paymentMethods: PaymentMethod[]
    bulkDiscounts: { minQty: number; discount: number }[]
  }
  shipping: {
    fixedCost: number
    freeShippingThreshold: number
    freeShippingEnabled: boolean
  }
  financial: {
    monthlyInflation: number
    generalTax: number
    usdExchangeRate: number
  }
}
```

#### Promotion (Promoción)
```typescript
interface Promotion {
  id: string
  title: string
  description: string
  discountPercent: number
  promoCode: string
  startDate: string
  endDate: string
  bannerImage: string
  active: boolean
  createdAt: string
}
```

#### Alert (Alerta)
```typescript
interface Alert {
  id: string
  type: "low_stock" | "price_variation" | "negative_margin" | "event"
  severity: "low" | "medium" | "high"
  message: string
  date: string
  productId?: string
  read: boolean
}
```

#### Constantes Exportadas
```typescript
export const CATEGORIES = [
  "Pantalones", "Remeras", "Sweaters", "Abrigos", "Camperas",
  "Camisas", "Blusas", "Jeans", "Shorts", "Faldas", "Vestidos", "Accesorios"
] as const

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const

export const PRODUCT_STATUS = ["active", "draft", "archived"] as const

export const SECCIONES = ["general", "outlet", "nueva-coleccion"] as const
```

---

## 6. Estructura del Proyecto

```
Tienda de Ropa/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Layout principal (Header + Outlet + WhatsApp)
│   │   │   ├── Header.tsx        # Navegación header
│   │   │   ├── Sidebar.tsx       # Sidebar (no usado actualmente)
│   │   │   ├── Logo.tsx          # Logo de la tienda
│   │   │   └── SmoothScroll.tsx  # Componente de scroll suave (Lenis)
│   │   ├── products/
│   │   │   ├── ProductCard.tsx    # Tarjeta de producto
│   │   │   ├── ProductCardSkeleton.tsx
│   │   │   ├── ProductForm.tsx   # Formulario CRUD productos
│   │   │   └── ProductManager.tsx
│   │   ├── catalog/
│   │   │   ├── ProductDetailModal.tsx  # Modal detalle producto
│   │   │   ├── InventoryTable.tsx      # Tabla inventario
│   │   │   └── BrandCard.tsx
│   │   ├── cart/
│   │   │   └── CheckoutModal.tsx  # Modal checkout
│   │   ├── dashboard/
│   │   │   ├── Decorative3D.tsx   # Hero 3D decorativo
│   │   │   ├── DashboardGrid.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── ChartPanel.tsx
│   │   │   └── ScenarioSelector.tsx
│   │   ├── config/
│   │   │   └── GlobalParamsForm.tsx
│   │   ├── music/
│   │   │   ├── MusicPlayer.tsx       # Reproductor con vinilo animado + controles shuffle/next/prev
│   │   │   ├── MusicSection.tsx      # Sección completa de música (player + lista + ranking)
│   │   │   ├── SongCard.tsx          # Tarjeta de canción con stats y like
│   │   │   ├── MonthlyRanking.tsx    # Top 5 del mes con reproducciones diarias
│   │   │   ├── Equalizer.tsx         # Barras animadas de equalizador
│   │   │   └── AdminMusicPanel.tsx   # Panel admin para gestión de canciones
│   │   ├── alerts/
│   │   │   └── AlertsPanel.tsx
│   │   ├── import-export/
│   │   │   ├── ImportDialog.tsx
│   │   │   ├── ExportDialog.tsx
│   │   │   └── WebImportDialog.tsx
│   │   └── ui/                     # Componentes shadcn/ui
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── select.tsx
│   │       ├── switch.tsx
│   │       ├── tabs.tsx
│   │       └── table.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx        # Homepage pública
│   │   ├── CatalogPage.tsx        # Catálogo productos
│   │   ├── ProductDetailPage.tsx  # Detalle producto
│   │   ├── CartPage.tsx           # Carrito de compras
│   │   ├── LoginPage.tsx          # Login
│   │   ├── AdminHomePage.tsx      # Home admin
│   │   ├── DashboardPage.tsx     # Dashboard analítico
│   │   ├── ProductsPage.tsx      # Gestión productos
│   │   ├── OrdersPage.tsx        # Gestión pedidos
│   │   ├── AlertsPage.tsx         # Alertas
│   │   ├── ImportExportPage.tsx   # Import/Export
│   │   ├── ConfigPage.tsx        # Configuración global
│   │   ├── MarketingPage.tsx     # Marketing (promos)
│   │   ├── OutletPage.tsx        # Sección outlet
│   │   ├── NuevaColeccionPage.tsx # Nueva colección
│   │   └── NotFoundPage.tsx       # 404
│   ├── hooks/
│   │   ├── useFirestore.ts        # Re-export useProducts
│   │   ├── useProducts.ts        # CRUD productos, sales, orders
│   │   ├── useOrders.ts          # Pedidos
│   │   ├── useAlerts.ts          # Alertas automáticas
│   │   ├── usePromotions.ts      # Promociones y suscriptores
│   │   ├── useSiteTheme.ts       # Tema global realtime (Firestore)
│   │   ├── useScrollReveal.tsx   # Animaciones scroll reveal
│   │   ├── useMagneticHover.ts   # Efecto magnético hover
│   │   └── useViewTransitionNavigate.ts  # View Transitions API
│   ├── context/
│   │   ├── AuthContext.tsx        # Autenticación
│   │   ├── CartContext.tsx       # Carrito (NO USADO - ver store)
│   │   └── ParamsContext.tsx     # Parámetros globales (NO USADO - ver store)
│   ├── store/                     # Zustand stores
│   │   ├── cartStore.ts          # Carrito persistente
│   │   ├── ordersStore.ts        # Pedidos (localStorage)
│   │   ├── paramsStore.ts        # Parámetros globales
│   │   └── themeStore.ts         # Configuración de tema
│   ├── lib/
│   │   ├── firebase.ts           # Config Firebase
│   │   ├── constants.ts          # Constantes y datos mock
│   │   ├── utils.ts              # Utilidades
│   │   ├── calculations.ts       # Cálculos financieros
│   │   ├── projections.ts       # Proyecciones
│   │   ├── orderAlerts.ts        # Alertas de pedidos
│   │   └── migrateOrders.ts      # Migración pedidos a Firestore
│   ├── test/                      # Tests (Vitest)
│   │   ├── setup.ts              # Config global tests
│   │   ├── utils.test.ts         # Tests de utilidades
│   │   ├── calculations.test.ts  # Tests financieros
│   │   ├── cartStore.test.ts     # Tests del carrito
│   │   ├── projections.test.ts   # Tests de proyecciones
│   │   └── orderAlerts.test.ts   # Tests de alertas
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── index.css                 # Tailwind + custom styles
│   ├── main.tsx                  # Entry point
│   └── App.tsx                   # Router + providers
├── public/
│   ├── manual-usuario.pdf
│   └── logos/
├── firestore.rules                # Reglas de seguridad Firestore
├── dist/                         # Build output
├── api/                          # Vercel Serverless Functions
│   ├── create-preference.js      # POST /api/create-preference (Mercado Pago)
│   ├── mercadopago-webhook.js    # POST /api/mercadopago-webhook
│   ├── pago-exitoso.js           # GET /api/pago-exitoso
│   ├── pago-fallido.js           # GET /api/pago-fallido
│   └── pago-pendiente.js         # GET /api/pago-pendiente
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json                   # Config Vercel (SPA rewrites + CSP)
├── render.yaml                   # Config Render (Express + MP)
├── server.js                     # Express server (Render)
├── .env
└── README.md
```

---

## 7. Rutas de la Aplicación

### Archivo: `src/App.tsx`

| Ruta | Página | Descripción | Requiere Auth |
|------|--------|-------------|---------------|
| `/` | LandingPage | Homepage | No |
| `/catalog` | CatalogPage | Catálogo general | No |
| `/catalog/:id` | ProductDetailPage | Detalle producto | No |
| `/cart` | CartPage | Carrito | No |
| `/login` | LoginPage | Login | No |
| `/outlet` | OutletPage | Sección Outlet | No |
| `/nueva-coleccion` | NuevaColeccionPage | Nueva colección | No |
| `/admin` | AdminHomePage | Home admin | Sí (admin) |
| `/dashboard` | DashboardPage | Dashboard | Sí (admin) |
| `/products` | ProductsPage | Gestión productos | Sí (admin) |
| `/orders` | OrdersPage | Gestión pedidos | Sí (admin) |
| `/alerts` | AlertsPage | Alertas | Sí (admin) |
| `/import-export` | ImportExportPage | Import/Export | Sí (admin) |
| `/config` | ConfigPage | Configuración | Sí (admin) |
| `/marketing` | MarketingPage | Marketing | Sí (admin) |
| `/belleza` | BellezaPage | Personalización visual (temas) | Sí (admin) |
| `*` | NotFoundPage | 404 | No |

### Routing
- Usa React Router DOM v7
- BrowserRouter envolviendo toda la app
- QueryClientProvider para TanStack Query
- AuthProvider envolviendo BrowserRouter

---

## 8. Stores de Estado (Zustand)

### Cart Store (`src/store/cartStore.ts`)
**Propósito**: Carrito de compras persistente en localStorage

```typescript
interface CartItem {
  productId: string
  productName: string
  brand: string
  color: string
  size: string
  quantity: number
  price: number
  imageUrl: string
}

interface CartStore {
  items: CartItem[]
  addItem: (product, color, size, quantity) => void
  removeItem: (productId, color, size) => void
  updateQuantity: (productId, color, size, delta) => void
  clearCart: () => void
  totalItems: number
}
```

**Persistencia**: `persist` middleware de Zustand con key `tienda-cart`

---

### Orders Store (`src/store/ordersStore.ts`)
**Propósito**: Pedidos en localStorage con patrón pub/sub

```typescript
// Funciones exportadas
getOrders(): Order[]
addOrder(order: Order): void
subscribe(fn: () => void): () => void
```

**Persistencia**: localStorage con key `tienda-orders`

---

### Params Store (`src/store/paramsStore.ts`)
**Propósito**: Parámetros globales y escenarios

```typescript
interface ParamsStore {
  params: GlobalParams
  updateParams: (params: GlobalParams) => void
  scenario: Scenario  // "base" | "optimistic" | "pessimistic"
  setScenario: (s: Scenario) => void
  scenarioConfig: ScenarioConfig
}
```

**Scenarios**:
- `base`: inflationMultiplier: 1, salesMultiplier: 1
- `optimistic`: inflationMultiplier: 0.7, salesMultiplier: 1.2
- `pessimistic`: inflationMultiplier: 1.5, salesMultiplier: 0.85

---

### Theme Store (`src/store/themeStore.ts`)
**Propósito**: Sistema completo de personalización visual de la app.

**Store Belleza** (`src/store/bellezaStore.ts`):

```typescript
interface FullThemeConfig {
  colors: ColorPalette           // 19 colores (primary, secondary, accent, etc.)
  background: BackgroundType      // ID del fondo seleccionado
  backgroundGradient: string     // CSS gradient o color del fondo
  effects: EffectsConfig          // partículas, orbs, grid, glass, grain
  typography: TypographyConfig    // fuentes, peso, tamaño, line-height
  layout: LayoutConfig          // border-radius, spacing, shadow, blur
  hover: HoverConfig            // lift, glow, transición
  mode: "dark" | "light" | "auto"
}
```

**CURATED_LOOKS** — 50 looks curados organizados en 7 categorías:

| Categoría | Cant. | Descripción |
|-----------|-------|-------------|
| minimalista | 6 | Blanco, negro, gris. Lo esencial. |
| pastel | 8 | Colores suaves y delicados. |
| moderno | 8 | Bold, vibrante, neón. |
| ejecutivo | 8 | Profesional, corporativo, elegante. |
| nocturno | 6 | Oscuro, misterioso, dramático. |
| bohémio | 6 | Tierra, natural, artesanal. |
| glamour | 8 | El estilo de la marca. |

**CURATED_CATEGORIES** — Categorías disponibles para navegar.

**applyThemeConfig(config)** — Aplica el tema al `:root` del documento:
- Setea todas las CSS variables de colores (`--color-primary`, `--color-background`, etc.)
- Aplica el `backgroundGradient` al body
- Genera estilos dinámicos (hover-glow, hover-lift, glass-card)
- **Persistencia**: `belleza-active-config` en localStorage

**Persistencia**:
- Al cambiar tema → `applyFullConfig` + `applyThemeConfig` + `localStorage` + **Firestore** (`siteConfig/theme`)
- Al iniciar app (`App.tsx`) → suscribe a Firestore, si existe tema lo aplica, si no usa `localStorage`

### Hook `useSiteTheme` (`src/hooks/useSiteTheme.ts`)
```typescript
useSiteTheme() -> {
  themeFromFirestore: FullThemeConfig | null,
  loading: boolean,
  saveSiteTheme: (config: FullThemeConfig, userEmail?: string) => Promise<boolean>,
  isFirestoreAvailable: boolean
}
```
- Suscribe un `onSnapshot` al documento `siteConfig/theme` en Firestore
- Cuando Firestore tiene un tema, lo guarda en `localStorage` y lo aplica
- Si Firestore no está disponible (modo mock), usa `localStorage` como fallback
- `saveSiteTheme` solo debe llamarse si `isAdmin === true`

### Sincronización realtime del tema:
- **Todos los usuarios** suscriben `onSnapshot` a `siteConfig/theme` → ven cambios instantáneos
- **Solo admins** pueden escribir en Firestore (ver reglas en `firestore.rules`)
- Cada vez que un admin aplica un tema en Belleza, se guarda en Firestore
- Firestore notifica a todos los clientes suscritos → actualización instantánea
- **Costo en free tier**: 1 read por usuario conectado + 1 write por cambio del admin. Con 100 usuarios simultáneos y 10 cambios de tema/día: ~1.1K reads/día (2% del límite de 50K)

### Colecciones de Firestore:

| Colección | Propósito | Estructura |
|-----------|-----------|------------|
| `siteConfig/theme` | Tema global del sitio | `{ config: FullThemeConfig, updatedAt, updatedBy }` |
| `products` | Catálogo de productos | Product[] |

---

## 9. Contextos de React

### AuthContext (`src/context/AuthContext.tsx`)
**Proveedor**: AuthProvider

```typescript
interface AuthContextType {
  user: User | null
  role: Role
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  setMockRole: (role: Role) => void
}
```

**Características**:
- Modo mock automático si no hay Firebase configurado
- Roles: `admin` | `viewer`
- Emails administradores: `admin@tiendaropa.com`, `tiendaderopa@admin.com`
- Hook: `useAuth()`

---

### CartContext (`src/context/CartContext.tsx`)
**Estado**: NO USADO - ver cartStore de Zustand
**Existe por compatibilidad pero el store de Zustand es el usado**

---

### ParamsContext (`src/context/ParamsContext.tsx`)
**Estado**: NO USADO - ver paramsStore de Zustand
**Existe por compatibilidad pero el store de Zustand es el usado**

---

## 10. Hooks Personalizados

### useProducts (`src/hooks/useProducts.ts`)
```typescript
// Queries
useProducts() -> Product[]        // Todos los productos
useProduct(id) -> Product | undefined  // Producto específico

// Mutations
useSaveProduct()  // Guardar/actualizar producto
useDeleteProduct() // Eliminar producto
```

**Migración automática**: Detecta formato antiguo de productos y migra al nuevo formato con colors/sizes.

---

### useOrders (`src/hooks/useOrders.ts`)
```typescript
useOrders() -> Order[]
addOrder(order) // Función para agregar pedido
```

**Características**:
- En modo mock: usa ordersStore con suscripción en tiempo real
- En modo Firebase: consulta Firestore, fallback a localStorage

---

### useAlerts (`src/hooks/useAlerts.ts`)
```typescript
useAlerts(products) -> { alerts, rules, setRules }
```

**Reglas de alertas**:
- Stock bajo (threshold configurable, default 5)
- Variación de precios
- Margen negativo
- Feriados próximos
- Nuevos pedidos

---

### usePromotions (`src/hooks/usePromotions.ts`)
```typescript
usePromotions() -> Promotion[]
useSubscribers() -> Subscriber[]
useSavePromotion()
useDeletePromotion()
```

---

### useFirestore (`src/hooks/useFirestore.ts`)
Re-export de useProducts para mantener compatibilidad.

---

## 11. Componentes Principales

### Layout Components
| Componente | Descripción |
|-------------|-------------|
| AppLayout | Layout base con Header, Outlet, botón WhatsApp flotante |
| Header | Navegación responsive (cliente vs admin) |
| Sidebar | Sidebar legacy (no usado actualmente) |
| Logo | Logo GLAMOURS |
| SmoothScroll | Wrapper con Lenis para scroll suave |

### Product Components
| Componente | Descripción |
|-------------|-------------|
| ProductCard | Tarjeta producto (grid/list view) |
| ProductCardSkeleton | Loading skeleton |
| ProductForm | Formulario CRUD |
| ProductManager | Gestión completa productos |

### Catalog Components
| Componente | Descripción |
|-------------|-------------|
| ProductDetailModal | Modal detalle producto con selección color/talle |
| InventoryTable | Tabla inventario |
| BrandCard | Tarjeta marca |

### Dashboard Components
| Componente | Descripción |
|-------------|-------------|
| Decorative3D | Hero section 3D decorativa |
| DashboardGrid | Grid de widgets |
| KpiCard | Tarjeta KPI |
| ChartPanel | Panel de gráficos |
| ScenarioSelector | Selector de escenario |

### Cart Components
| Componente | Descripción |
|-------------|-------------|
| CheckoutModal | Modal checkout con forma de pedido |

### UI Components (shadcn/ui)
button, input, card, badge, select, switch, tabs, table, CursorGlow

### Music Components
| Componente | Descripción |
|-------------|-------------|
| MusicPlayer | Reproductor principal con disco de vinilo animado, glow ambiental, barra de progreso, controles play/pause/next/prev/shuffle, volumen |
| MusicSection | Layout de la sección música: columna izquierda con MusicPlayer + MonthlyRanking, columna derecha con lista SongCard |
| SongCard | Tarjeta de canción con track number, portada, título/artista, contador de plays, botón de like. Muestra Equalizer animado si es la canción actual |
| MonthlyRanking | Top 5 del mes calculado con likes + reproducciones ponderadas. Muestra contador de reproducciones del día |
| Equalizer | Barras animadas de equalizador que se activan cuando la canción está sonando |
| AdminMusicPanel | Panel en admin para gestionar canciones: subir, editar, eliminar, importación masiva desde carpeta |

### Other Components
| Componente | Descripción |
|-------------|-------------|
| HeroParticles | Partículas animadas decorativas |

---

## 12. Configuración de Estilos

### Tailwind CSS v4
**Archivo**: `src/index.css`

**Colores del tema** (CSS variables):
```css
--color-background: #0d0d1a
--color-foreground: #e8e8f0
--color-card: #161627
--color-primary: #7c5cfc
--color-secondary: #1f1f3a
--color-muted: #1a1a30
--color-border: #1e1e3a
--color-success: #10b981
--color-warning: #f59e0b
--color-destructive: #ef4444
--color-highlight: #ec4899
```

**Gradientes personalizados**:
```css
.gradient-primary     /* Violeta */
.gradient-accent      /* Rosa-Naranja */
.gradient-warm        /* Amarillo-Rojo */
.gradient-cool       /* Violeta-Verde */
.gradient-brand       /* Violeta-Rosa (brand) */
```

**Animaciones CSS**:
- gradient-text-animated
- gradient-text-shimmer
- gradient-text-rainbow
- gradient-text-luxury
- gradient-text-glow

**Fuentes**:
- Display: Playfair Display
- Body: Inter

---

## 13. Autenticación

### Firebase Auth
- Email/Password: signInWithEmailAndPassword
- Google: signInWithPopup + GoogleAuthProvider

### Modo Mock
Si no hay Firebase configurado:
- Usuario mock: `{ uid: "admin-001", email: "admin@tiendaropa.com", role: "admin" }
- Toggle role en UI: `setMockRole(role)`
- Persistencia: memoria

### Roles
- `admin`: Acceso completo a dashboard, productos, pedidos, configuración
- `viewer`: Solo navegación pública (catálogo, carrito, checkout)

---

## 14. Deployment

### Build
```bash
npm run build
# Ejecuta: tsc -b && vite build
# Output: dist/
```

### Servir producción
```bash
npm run preview
# Servir dist/ en localhost
```

### Plataformas de Deploy

El proyecto está configurado para desplegarse en dos plataformas simultáneamente:

| Plataforma | URL | Estado | Propósito |
|------------|-----|--------|-----------|
| Render | https://glamours-lujan.onrender.com | Principal (suspendido hasta 01/06) | Express + APIs MP |
| Vercel | https://glamours-lujan.vercel.app | Backup (pendiente conectar) | SPA + Serverless Functions |

### Render
1. Crear cuenta en render.com
2. Conectar repositorio Git
3. Configurar (ver render.yaml):
   - Build Command: `npm run build`
   - Start Command: `node server.js`
   - Publish Directory: `dist`
   - Node Version: 20.x
   - Health Check Path: `/api/pago-exitoso`
   - Auto Deploy: true

**Server**: Express (server.js) que sirve dist/ + endpoints de Mercado Pago.
**Estado actual**: Workspace suspendido por cuota mensual. Reactivación automática el 01/06/2026.

### Vercel
1. Crear cuenta en vercel.com
2. Importar repositorio GitHub `webfireone/Tienda-de-Ropa`
3. Configurar:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Auto Deploy: true
4. Agregar mismas env vars que en Render (Firebase + MP_ACCESS_TOKEN)
5. Verificar que las Serverless Functions en `api/` se desplieguen correctamente

**Serverless Functions** (reemplazan a server.js en Vercel):
| Archivo | Ruta | Método |
|---------|------|--------|
| `api/create-preference.js` | `/api/create-preference` | POST |
| `api/mercadopago-webhook.js` | `/api/mercadopago-webhook` | POST |
| `api/pago-exitoso.js` | `/api/pago-exitoso` | GET |
| `api/pago-fallido.js` | `/api/pago-fallido` | GET |
| `api/pago-pendiente.js` | `/api/pago-pendiente` | GET |

**Nota**: Las rutas `/api/*` están excluidas del rewrite SPA en vercel.json para que las funciones serverless funcionen correctamente.

---

## 15. Comandos npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar dev server (Vite HMR) |
| `npm run build` | Build producción |
| `npm run preview` | Servir build local |
| `npm run lint` | ESLint |
| `npm run test` | Ejecutar tests (Vitest run) |
| `npm run test:watch` | Tests en modo watch |

---

## 16. Troubleshooting Comunes

### Error: "Firebase not initialized"
- Verificar que `.env` tiene las variables correctas
- Verificar que VITE_FIREBASE_API_KEY no esté vacía

### Error: "useQuery staleTime must be positive"
- Valor por defecto en App.tsx: 10 * 60 * 1000

### Error: "Module not found"
- Ejecutar `npm install`

### Error: "TypeScript error"
- Ejecutar `npm run build` para ver errores de compilación

### Problemas con Zustand persist
- El middleware `persist` requiere que todos los tipos sean serializables
- No usar classes ni funciones en el estado

### Productos no aparecen
- Verificar que hay productos en Firestore (colección `products`)
- En modo mock: verificar que MOCK_PRODUCTS está definido

### Font personalizada (ej. Armata) no se aplica en el menú
- Síntoma: la fuente del menú muestra Inter u otra fuente, no Armata
- Causa: `src/store/bellezaStore.ts` inyecta un `<style>` global con `* * *, *::before, *::after { font-family: inherit !important; }` y ejecuta `forceFontUpdate()` que pone inline `style="font-family: inherit !important"` en cada elemento del DOM. Ambas cosas tienen `!important` y vencen a la clase `.font-menu` generada por Tailwind.
- Solución:
  1. En `src/index.css` agregar `.font-menu { font-family: var(--font-menu) !important; }` (stylesheet con `!important` + clase vence a `* * *` con `!important` porque tiene mayor especificidad)
  2. En `src/store/bellezaStore.ts`, en `forceFontUpdate()`, agregar un `if` que saltee elementos con clase `font-menu` para que no les meta inline `style="font-family: inherit !important"` (inline `!important` vence a cualquier stylesheet)
- Verificar que el `.woff2` aparece en la pestaña Network del DevTools

---

## 17. Constantes y Datos Mock

### Archivo: `src/lib/constants.ts`

- **DEFAULT_PARAMS**: Parámetros globales por defecto
- **SCENARIOS**: Configuraciones de escenarios (base, optimistic, pessimistic)
- **MOCK_PRODUCTS**: 8 productos de ejemplo
- **MOCK_SALES**: 12 ventas de ejemplo
- **HOLIDAYS**: Feriados 2026

---

## 18. Utilidades

### cn() - `src/lib/utils.ts`
```typescript
cn(...inputs: ClassValue[]): string
// Merges classes de tailwind
```

### getTotalStock(product)
Suma total de stock de todas las tallas/colores

### getStockForSize(product, size)
Stock para una talla específica

---

## 19. Integraciones Externas

### WhatsApp
- Link: `https://wa.me/5491122618116`
- Botón flotante en AppLayout

### Google Maps
- Embed en LandingPage
- Dirección: Italia 1037, Luján, Buenos Aires 6700

### Instagram
- Perfil: @glamoursok

---

# Registro de Cambios (Changelog)

> **SECCIÓN IMPORTANTE**: Registrar cada cambio realizado en el proyecto con fecha, descripción, errores y soluciones.

---

## Cambios Realizados

*(Esta sección se actualiza después de cada modificación)*

### Fecha: 12/05/2026
- **Cambio**: Sistema de sincronización realtime del tema global via Firestore
  - Nuevo hook `useSiteTheme` suscribe a `siteConfig/theme` con `onSnapshot`
  - Admin que cambia tema en Belleza → se guarda en Firestore → todos los usuarios ven el cambio instantáneamente
  - Solo admins pueden escribir el tema (ver `firestore.rules`)
  - Fallback a localStorage si Firestore no disponible (modo mock)
  - Build 0 errores

### Fecha: 12/05/2026
- **Cambio**: Producto detalle modal mejoras
  - Imagen usa `object-cover` para cubrir todo el panel
  - Modal usa `createPortal` para evitar conflictos de z-index
  - Scroll interno del modal con prevención de scroll propagation
  - Modal reducido (max-w-3xl en vez de max-w-5xl)
  - Botón X movido dentro del modal con backdrop semi-transparente
  - Badge OUTLET/NUEVO removido de la imagen del modal
  - Z-index elevado (z-[99999]) para estar siempre por encima del header
  - Build 0 errores

### Fecha: 13/05/2026
- **Cambio**: Fix imágenes cortadas en catálogo mobile
  - Grid del catálogo: `max-sm:auto-rows-auto` para que las filas se adapten al contenido en mobile
  - Cards con row-span-2 ahora son `max-sm:row-span-1` para evitar solapamiento
  - ProductCard: `max-sm:h-auto` para que el alto lo determine el aspect ratio natural
  - Hero cards en mobile: `max-sm:aspect-[2/3]` (menos vertical que aspect-[3/5])
  - Desktop sin cambios: `auto-rows-[280px]`, `h-full`, `aspect-[3/5]` se mantienen
  - Build 0 errores, commit `b516c79`

- **Cambio**: Fix responsive adicionales varios componentes
  - ProductForm: grid de 4 columnas → `grid-cols-2 sm:grid-cols-4` para mobile
  - ProductDetailModal: `flex-row` → `flex-col` en mobile, imagen con `max-sm:max-h-64`
  - AppLayout WhatsApp: label visible siempre en mobile (`max-sm:w-auto max-sm:opacity-100`)
  - Decorative3D: `min-h-[600px]` → `min-h-[400px] sm:min-h-[600px]` para mobile
  - ChartPanel tabla: `overflow-hidden` → `overflow-x-auto` para scroll horizontal

- **Cambio**: Setup completo de tests (Vitest + RTL)
  - Nuevas dependencias: vitest ^4.1.6, @testing-library/react ^16.3.2, @testing-library/jest-dom ^6.9.1, @testing-library/user-event ^14.6.1, jsdom ^29.1.1
  - Config en vite.config.ts: globals: true, environment: jsdom, setupFiles
  - Scripts npm: `npm run test` (vitest run), `npm run test:watch` (vitest)
  - Archivo setup: `src/test/setup.ts` - importa jest-dom matchers + mockea Firebase
  - 5 test files, 30 tests:
    - `src/test/utils.test.ts` (7 tests): cn(), getTotalStock, getStockForSize, getAllSizes
    - `src/test/calculations.test.ts` (5 tests): calculateFinalPrice, gross/net margin, KPIs
    - `src/test/cartStore.test.ts` (6 tests): addItem, removeItem, clearCart, stock validation
    - `src/test/projections.test.ts` (4 tests): proyecciones monthly/quarterly/annual
    - `src/test/orderAlerts.test.ts` (6 tests): add, read, mark, limit 50 alerts
  - TypeScript: `vitest/globals` agregado a types en tsconfig.app.json
  - Build 0 errores, push a GitHub + deploy automático a Render

### Fecha: 15/05/2026
- **Cambio**: Font Armata en menú de navegación (local, sin Google Fonts CDN)
  - Descargados `.woff2` de Armata (latin + latin-ext) desde Google Fonts
  - Fonts ubicadas en `public/fonts/armata/` (servidas por Vite) y `fuentes/armata/` (copia compartida)
  - `@font-face` con URLs locales en `src/index.css` (reemplaza Google CDN)
  - `--font-menu: 'Armata', sans-serif` agregado en `@theme` de `src/index.css`
  - `font-medium` → `font-menu` en `Header.tsx` (desktop + mobile)
  - **Problema**: La fuente no se aplicaba porque `bellezaStore.ts` inyecta un `<style>` global con `* * *, *::before, *::after { font-family: inherit !important; }` que pisaba cualquier `font-family` en stylesheet
  - **Solución 1**: En `src/index.css`, agregar `.font-menu { font-family: var(--font-menu) !important; }` (defiende contra el `<style>` inyectado)
  - **Solución 2**: En `src/store/bellezaStore.ts`, modificar `forceFontUpdate()` para que saltee elementos con clase `font-menu` (evita inline `style="font-family: inherit !important"`)
  - Build 0 errores

### Fecha: 15/05/2026
- **Cambio**: Renombrar sección "Outlet" → "Ofertas" en toda la app
  - Ruta: `/outlet` → `/ofertas`
  - Display labels: "Outlet" → "Ofertas" en Header, Sidebar, LandingPage, ProductForm, BellezaPage, ProductCard badge ("OUTLET" → "OFERTA")
  - Valor de BD: `seccion: "outlet"` → `"ofertas"` en types, mock data, filtros
  - Archivo: `OutletPage.tsx` → `OfertasPage.tsx` (contenido actualizado)
  - Script de migración: `scripts/migrate-ofertas.ts` — actualiza productos existentes en Firestore de `"outlet"` a `"ofertas"`
  - Uso: `npm run migrate:ofertas`
  - Migrados 9 productos en Firestore
  - Build 0 errores

### Fecha: 15/05/2026
- **Cambio**: fontMenu en admin Belleza editor + corregidos todos los CURATED_LOOKS
  - Agregado `fontMenu` a `FullThemeConfig.typography` en `bellezaStore.ts` (tipo, default `"Armata"`)
  - `applyThemeConfig` ahora setea `--font-menu` e inyecta `.font-menu.font-menu.font-menu` rule
  - `AVAILABLE_MENU_FONTS` (17 fuentes) + sección "Fuente de Menú" en `BellezaPage.tsx`
  - Agregado `fontMenu: "Armata"` a los 45 typography objects en `CURATED_LOOKS` y al generador `generateRandomSafeConfig`
  - Build 0 errores

### Fecha: 15/05/2026
- **Fix**: fontDisplay, headingWeight, textShadow y otros cambios no se aplicaban al seleccionarlos en Belleza
  - **Causa raíz**: `forceFontUpdate()` en `bellezaStore.ts` setea `font-family: inherit !important` inline en CADA elemento del DOM. Al tener `!important`, el inline vence a las reglas del `<style>` inyectado (`.font-display.font-display.font-display { … !important }`) porque inline `!important` siempre tiene más prioridad que stylesheet `!important`, sin importar especificidad.
  - **Fix**: Se eliminó el loop de `forceFontUpdate()` que ponía inline `font-family: inherit !important`. El `<style>` inyectado con selectores de triple-clase ya maneja correctamente la cascada de fuentes. `forceFontUpdate()` ahora solo actualiza las variables CSS en `:root`.
  - Build 0 errores

### Fecha: 15/05/2026
- **Fix**: Editar y eliminar canciones no funcionaban en modo mock
  - **Causa raíz**: `MOCK_SONGS` era un array constante. `useSaveCancion()` y `useDeleteCancion()` en modo mock no mutaban ningún estado, solo devolvían el dato. Al invalidar la query se volvía a leer la constante original.
  - **Fix**: Se creó `mockCanciones` (array mutable a nivel de módulo en `useMusic.ts`) que inicia como copia de `MOCK_SONGS`. `fetchMusicCollection` retorna `mockCanciones` en mock. `useSaveCancion` muta el array (edita si existe, agrega si no). `useDeleteCancion` filtra el array.
  - Build 0 errores, tests 28 pass

- **Feature**: Importación masiva de canciones desde carpeta local
  - Nuevo botón "Importar Múltiples" en `AdminMusicPanel.tsx` que abre un selector de carpeta (`webkitdirectory`)
  - Filtra archivos MP3, extrae título del nombre del archivo (sin extensión)
  - Diálogo de preview con campos editables (título, artista) antes de importar
  - Importación secuencial con loader, muestra cantidad de canciones importadas
  - Build 0 errores

### Fecha: 16/05/2026
- **Feature**: Reproductor musical completo con disco de vinilo animado, shuffle y auto-next
  - `musicStore.ts` — Refactor completo: agregados `playlist`, `shuffle`, `playNext()`, `playPrevious()`, auto-advance al terminar canción vía `onEnded`. Refactorizada lógica en `playNewSong()`. Eliminados `console.log` excesivos.
  - `MusicPlayer.tsx` — Rediseño completo: disco de vinilo animado con CSS (`vinyl-spin`), glow ambiental, tonearm indicator, barra de progreso con knob, controles shuffle/next/prev, tracking acumulativo de reproducciones (pasa de timeout 10s a setInterval con contador de segundos acumulados). Vocals "Glamour's MUSIC" cuando no hay canción seleccionada.
  - `MusicSection.tsx` — Sincroniza `setPlaylist()` con las canciones activas via `useEffect`. Grid de SongCards cambiado a `md:grid-cols-2`. `MonthlyRanking` movido a columna lateral.
  - `SongCard.tsx` — Rediseño: track number con padding 2 dígitos, Equalizer animado para la canción actual, hover reveal del botón Play, stats simplificadas (solo plays + like), eliminado el disco 3D giratorio.
  - `MonthlyRanking.tsx` — Agregado contador de reproducciones del día usando `useReproducciones` y filtrando por fecha actual.
  - `index.css` — Nuevos estilos: `.music-player-wrapper`, `.music-player-card` (glass con backdrop-blur), animaciones `vinyl-spin` y `pulse-ring`. Gradientes lineales para barra de progreso y glow.
  - Build 0 errores, commit `9b2c091`, push a GitHub + deploy automático a Render

---

### Fecha: 21/05/2026
- **Fix**: Scroll con ruedita del mouse en modal "Finalizar pedido"
  - Causa raíz: Lenis interceptaba los wheel events incluso después de `stop()`, evitando el scroll nativo del contenido del modal
  - Solución: Agregado `data-lenis-prevent` al contenedor scrollable (Lenis ignora wheel events allí), `tabIndex={0}` con auto-focus via ref, y `overscroll-behavior: contain`
  - Eliminado el `lenis.stop/start` del useEffect (innecesario con data-lenis-prevent)
  - Build 0 errores, tests 28 pass

- **Feature**: Cálculo automático de envío según provincia
  - Nueva constante `PROVINCE_SHIPPING_RATES` en `constants.ts` con tabla de 24 provincias (costos desde Luján, BA de referencia Andreani/OCA/Correo Argentino)
  - Nuevo campo `provinceRates: Record<string, number>` en `GlobalParams.shipping`
  - `DEFAULT_PARAMS` actualizado con las tarifas por provincia
  - `CheckoutModal` ahora calcula el envío automáticamente al seleccionar provincia (fallback a `fixedCost` si no hay tarifa específica)
  - Build 0 errores, tests 28 pass

---

### Fecha: 27/05/2026
- **Cambio**: Preparación de Vercel como plataforma de backup para Render
  - Render suspendido por cuota mensual (se reactiva 01/06/2026)
  - Creados 5 archivos Serverless Functions en `api/` para Vercel:
    - `api/create-preference.js` — POST /api/create-preference (Mercado Pago)
    - `api/mercadopago-webhook.js` — POST /api/mercadopago-webhook
    - `api/pago-exitoso.js` — GET /api/pago-exitoso (HTML éxito)
    - `api/pago-fallido.js` — GET /api/pago-fallido (HTML fallo)
    - `api/pago-pendiente.js` — GET /api/pago-pendiente (HTML pendiente)
  - `vercel.json` actualizado: rewrite excluye `/api/*` para que las Serverless Functions funcionen
  - Creado `Hostings.txt` con info de configuración de ambas plataformas
  - `PROJECT_DOCUMENTATION.md` actualizado (esta entrada + sección 14 Deployment)
  - Código fuente (`src/`) sin modificar — 0 cambios
  - `server.js` y `render.yaml` sin modificar — pendiente para 01/06/2026
  - Build 0 errores, tests pasan
- **Post-deploy**: Vercel conectado exitosamente a GitHub con auto-deploy
  - Env vars de Firebase configuradas en Vercel Dashboard
  - Dominio `glamours-lujan.vercel.app` agregado a Authorized Domains en Firebase Auth
  - Login con Google funcionando correctamente
  - Vercel 100% operativo como plataforma backup

### Fecha: 27/05/2026
- **Fix**: Reproductor musical no reproducía temas en Vercel (final)
  - **Causa raíz múltiple**:
    1. `playNewSong()` solo buscaba el audio en IndexedDB (`loadAudioDataUrl`), ignorando `song.archivoUrl`
    2. Las canciones subidas por AdminMusicPanel.tsx guardan `archivoUrl: ""` (líneas 99, 176) — el audio se almacena en IndexedDB local, no en una URL estática
    3. Las canciones subidas en Render tenían IDs aleatorios (ej: `Date.now()-random`) que NO coinciden con los IDs de `MOCK_SONGS` (ej: `song-1`), por lo que el backfill por id no las encuentra
    4. Chrome devuelve `net::ERR_CACHE_OPERATION_NOT_SUPPORTED` al cargar MP3 desde Vercel porque Vercel sirve `Cache-Control: max-age=0, must-revalidate` y el disco cache del browser falla al revalidar
  - **Solución aplicada (código)**:
    1. `useCanciones()` backfillea `archivoUrl` desde `MOCK_SONGS` cuando está vacío (búsqueda por id)
    2. `playNewSong()` precarga el MP3 con `fetch({ cache: "no-store" })` y crea un blob URL, evitando el disk cache
    3. `vercel.json` agrega `Cache-Control: public, max-age=31536000, immutable` para `/music/*` y `/bg-music*`
    4. Las blob URLs se revocan al cambiar de canción para evitar memory leaks
  - **Solución manual necesaria para canciones subidas por admin**:
    - Las canciones subidas por admin no tienen `archivoUrl` y sus IDs no matchean `MOCK_SONGS`
    - El audio se almacena en IndexedDB del dominio donde se subió
    - Al migrar de dominio (Render → Vercel), IndexedDB está vacío en el nuevo dominio
    - **Solución**: Eliminar todas las canciones y volver a subirlas desde el AdminMusicPanel en el nuevo dominio. Esto las guarda en IndexedDB del nuevo dominio y funcionan.
  - Build 0 errores, tests pasan

### Fecha: 28/05/2026
- **Fix**: Audio no reproduce en mobile iOS/Safari
  - **Causa raíz 1**: `playNewSong()` llamaba a `createNewAudio()` (que ejecuta `new Audio()`) **después** de `await` (IndexedDB, fetch), quedando fuera del contexto de user gesture. Safari bloquea `el.play()` cuando el elemento Audio se crea fuera de un evento táctil/de clic.
  - **Fix 1**: Eliminado `createNewAudio()`. `playNewSong()` ahora reusa el `audioEl` existente — creado sincrónicamente en `playSong()` vía `initAudio()`, que está dentro del user gesture del clic en SongCard.
  - **Causa raíz 2**: Los títulos de las canciones en Firestore contenían saltos de línea (`\n`) al inicio/final. El backfill por título (que compara `normalize(m.titulo) === normalize(song.titulo)`) fallaba porque `"sigue asi\n" !== "sigue asi"`.
  - **Fix 2 (manual en Firestore)**: Editar cada título de canción en Firestore Database → colección `canciones` → campo `titulo`, y eliminar los saltos de línea al inicio/final. Alternativamente, el normalize ahora también recorta whitespace y reemplaza `\n`/`\r` por espacios.
  - El elemento Audio se crea una sola vez (en el primer clic) y se reusa para todas las canciones, manteniendo la compatibilidad con iOS Safari.
  - Build 0 errores, tests pasan

---

**AGENDA — Pendiente para 01/06/2026**:
- **Render se reactiva automáticamente** (nuevo mes, cuota renovada)
- **Paso 1**: Ir a https://dashboard.render.com e iniciar sesión → reactivar servicios (2 web + 7 static)
- **Paso 2**: Verificar que Render haga auto-deploy del último commit en `main`. Si no: Manual Deploy → Deploy Latest Commit
- **Paso 3**: Replicar los cambios que están en Vercel (serverless functions en `api/`, vercel.json, etc.) — Render usa `server.js` + `render.yaml`. Asegurarse de que `main` tenga todo.
- **Paso 4**: Configurar env vars en Render Dashboard si faltan: `MP_ACCESS_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_B64`, `GH_TOKEN`, `RENDER_API_KEY`, `VERCEL_API_TOKEN`
- **Paso 5**: Confirmar sitio funcionando en https://glamours-lujan.onrender.com
- **Paso 6**: Verificar endpoints API (`/api/pago-exitoso`, etc.)
- **Paso 7**: Testear `/api/status-servicios` → Render debe mostrar datos sin suspensión
- **Paso 8**: Verificar webhooks y auto-deploy desde GitHub main en ambas plataformas

### Fecha: 22/05/2026
- **Fix**: Error "imageUrl longer than 1048487 bytes" al importar productos con imágenes
  - **Causa raíz**: El XLSX contenía imágenes como data URLs base64 en la columna "Imagen URL", superando el límite de 1MB de Firestore por documento
  - **Fix 1**: Nueva función `uploadDataUrlImage()` en `imageStorage.ts` que convierte data URLs a File, las redimensiona y las sube a Firebase Storage (o las devuelve como data URL comprimida como fallback)
  - **Fix 2**: Durante la importación, si `imageUrl` empieza con `data:`, se sube automáticamente a Firebase Storage antes de guardar el producto
  - Build 0 errores, commit `4ceb309`

- **Fix**: Imágenes colgadas en "Comprimiendo y subiendo imágenes..." sin progreso ni errores
  - **Causa raíz**: `handleImageFiles()` usaba `Promise.all` que se colgaba si Firebase Storage no respondía, sin feedback al usuario
  - **Fix 1**: Procesamiento secuencial de imágenes con progreso visible (`uploadProgress.current/uploadProgress.total`)
  - **Fix 2**: Captura de errores individuales por imagen sin cancelar las demás
  - **Fix 3**: Timeout de 15s en Firebase Storage con fallback a data URL comprimida
  - Build 0 errores, commit `534d184`

- **Fix**: Firebase Storage no disponible (bucket no configurado en el proyecto)
  - **Causa raíz**: El proyecto `tienda-de-ropa-35bea` nunca habilitó Firebase Storage. El dominio `firebasestorage.app` no resuelve DNS y el bucket GCS no existe
  - **Fix**: Refactor completo de `imageStorage.ts`:
    - Reducción de tamaño máximo de imagen a **600x600** con calidad **JPEG 0.6** (~50-150KB en base64)
    - Nueva función `tryUploadOrDataUrl()`: intenta Firebase Storage con timeout de 15s, si falla retorna la data URL comprimida
    - `resizeImage()` acepta parámetros opcionales para reutilización
    - Eliminada función `uploadBlob()` (reemplazada por lógica inline en `tryUploadOrDataUrl`)
    - Flujo: `File → resizeImage → blobToDataUrl (fallback listo) → try Firebase Storage → si falla → retorna data URL`
  - La data URL comprimida (600x600, JPEG 0.6) está muy por debajo del límite de 1MB de Firestore
  - Aplica a: importación CSV/XLSX, formulario de producto (`ProductForm.tsx`), y cualquier otro lugar que use `uploadProductImage` o `uploadImageFile`
  - Build 0 errores, commit `1ac614e`, push a GitHub + deploy automático a Render

---

# Notas para Futuras AI

1. **Modo Development**: El proyecto funciona en modo mock si no hay Firebase configurado. Para desarrollo completo, configurar Firebase en `.env`.

2. **Estructura de componentes**: Los componentes están modularizados por funcionalidad. Los componentes UI base están en `src/components/ui/`.

3. **Estado**: Usar stores de Zustand para estado global. Los contextos legacy (CartContext, ParamsContext) no están en uso.

4. **Data fetching**: TanStack Query maneja cache y fetching. Los hooks de Firestore incluyen fallback a datos mock.

5. **Estilos**: Tailwind CSS v4 con variables CSS. Los gradientes y animaciones están en `index.css`.

6. **Rutas**: El router está en `App.tsx`. Las rutas de admin requieren `isAdmin = true`.

7. **Build**: Siempre ejecutar `npm run build` antes de deploy. Output en `dist/`.

8. **Tests**: Usar `npm run test` para ejecutar tests (Vitest). Los tests están en `src/test/`. El setup mockea Firebase automáticamente. Siempre ejecutar tests después de cambios en lógica de negocio (utils, cálculos, stores).

9. **Responsive**: Todos los cambios visuales mobile deben usar prefijos `max-sm:` para no afectar desktop. El grid del catálogo usa `auto-rows-[280px]` en desktop y `auto-rows-auto` en mobile.

10. **Font-family override de bellezaStore**: `src/store/bellezaStore.ts` inyecta un `<style>` global y ejecuta `forceFontUpdate()` que fuerza `font-family: inherit !important` en TODOS los elementos. Si agregás una fuente personalizada via `font-menu` o similar, necesitás:
     - Agregar una regla CSS con `!important` en `src/index.css` para esa clase
     - Modificar `forceFontUpdate()` para que saltee los elementos con esa clase (usando `.classList.contains()` y `.closest()`)
     - Ver en DevTools que no haya inline `style="font-family: inherit !important"` en los elementos objetivo

11. **Mock mutable en hooks**: Los hooks de datos que usan arrays mock (ej. `useMusic.ts`) deben usar un array mutable a nivel de módulo (`let mockCanciones = [...MOCK_SONGS]`) para que las mutaciones (CRUD) funcionen en modo mock. Las funciones de mutación deben modificar este array y luego invalidar queries.

12. **musicStore (Zustand sin persist)**: `src/store/musicStore.ts` usa un `Audio` element a nivel de módulo (`audioEl`) que se comparte entre toda la app. El store maneja:
     - `playlist`: sincronizada desde `MusicSection` via `useEffect` cada vez que cambia `activeSongs.length`
     - `shuffle`: toggle aleatorio para `playNext()` y auto-advance en `onEnded`
     - `playPrevious()`: si `progress > 3s` reinicia la canción, si no va a la anterior
     - `onEnded()`: auto-advance a siguiente canción en la playlist (aleatorio si shuffle activo)
     - Registro de reproducción: `MusicPlayer` usa `setInterval` de 1s acumulando segundos; al llegar a 10s dispara `useRegistrarReproduccion.mutate()` y limpia el interval. Se resetea al cambiar de canción.
     - NO usa middleware `persist` (todo el estado es volátil).
     - El ranking mensual se calcula en `useMonthlyRanking()` ponderando likes (peso 3) + reproducciones (peso 1) del mes actual.

13. **Scroll en modales con Lenis**: Para que el scroll de la ruedita del mouse funcione dentro de un modal mientras Lenis está activo:
     - Agregar `data-lenis-prevent` al contenedor scrollable (Lenis ignora wheel events allí)
     - Agregar `tabIndex={0}` y un `ref` con `focus()` al abrir el modal
     - Agregar `overscroll-behavior: contain` para evitar scroll chaining
     - NO usar `lenis.stop()` + `lenis.start()` porque Lenis igual captura el evento; `data-lenis-prevent` es la solución correcta
     - Ejemplo: `CheckoutModal.tsx` línea 245

14. **Envío por provincia**: El cálculo de envío usa `params.shipping.provinceRates` que es un `Record<string, number>` (provincia → costo). Si la provincia no está en la tabla, fallback a `fixedCost`. Los precios están basados en costos de Andreani/OCA/Correo Argentino desde Luján, BA. Se pueden editar desde el panel de Configuración (provinceRates en GlobalParams).

15. **Colecciones Firestore para música**: Existen 4 colecciones en Firestore relacionadas:
     - `canciones`: documentos `Cancion` con `archivoUrl` (Storage URL), `portadaUrl`, `activo`, `deleted` (soft-delete)
     - `reproducciones`: documentos `Reproduccion` con `cancionId`, `usuarioId`, `fechaReproduccion`
     - `likes`: documentos `LikeCancion` con `cancionId`, `usuarioId`, `fechaLike` (unique constraint por canción+usuario)
      - En modo mock, los datos se almacenan en arrays mutables a nivel de módulo en `useMusic.ts`

16. **Panel Status-Servicios** (`/admin/status`): Endpoint `/api/status-servicios.js` consulta GitHub billing, Vercel usage, Render services y Firebase Firestore metrics vía GCP Monitoring API. Cada servicio tiene su token como env var en Vercel: `GH_TOKEN`, `VERCEL_API_TOKEN`, `RENDER_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_B64`. Firebase Spark no expone métricas sin plan Blaze. GitHub billing necesita PAT con scope `user`. Vercel Hobby no expone usage vía API. Render expone servicios pero no horas de instancia.

17. **Render suspendido hasta 01/06/2026**: Por cuota mensual. Ese día reactivar (ver sección AGENDA en Changelog arriba).

# GUÍA DETALLADA DE FUNCIONAMIENTO

> Esta sección explica en detalle cómo funcionan los diferentes aspectos del proyecto para que cualquier AI pueda comprender y trabajar con él.

---

## 20. Flujos de Datos del Sistema

### 20.1. Flujo de Productos (CRUD)

```
[Firestore/Modo Mock] 
        ↓
  useProducts() (TanStack Query)
        ↓
  Cache en memoria
        ↓
  Componentes (CatalogPage, ProductCard, etc.)
        ↓
  Mutations (useSaveProduct, useDeleteProduct)
        ↓
  [Firestore/Modo Mock]
```

**Descripción del flujo**:

1. **Lectura**: `useProducts()` consulta Firestore. Si está en modo mock, retorna `MOCK_PRODUCTS` de `constants.ts`.

2. **Migración automática**: El hook detecta si el producto tiene formato antiguo (propiedades `sizes` y `colors` como strings) y lo migra al nuevo formato.

3. **Escritura**: `useSaveProduct()` usa `setDoc()` de Firestore. Si hay error, silenciosamente no hace nada (en modo mock).

4. **Invalidación**: Después de escribir, se invalida la query para refrescar datos.

### 20.2. Flujo del Carrito

```
[Usuario selecciona producto]
        ↓
  ProductDetailModal (selecciona color/talle)
        ↓
  useCartStore.addItem(product, color, size, quantity)
        ↓
  Validación de stock disponible
        ↓
  Persistencia en localStorage (Zustand persist)
        ↓
  UI actualiza (totalItems en Header)
        ↓
  Checkout (CheckoutModal)
        ↓
  useCreateOrder() → Order
        ↓
  ordersStore.addOrder() + Firestore
```

**Descripción del flujo**:

1. **Agregar al carrito**: El usuario selecciona color y talla en `ProductDetailModal`. Se valida que haya stock disponible.

2. **Persistencia**: Zustand con middleware `persist` guarda en `localStorage` con key `tienda-cart`.

3. **Sincronización**: El Header muestra el `totalItems` reactivamente.

4. **Checkout**: Al confirmar, se crea un objeto `Order` que se guarda tanto en `ordersStore` como en Firestore.

### 20.3. Flujo de Autenticación

```
[Usuario inicia app]
        ↓
  AuthProvider se monta
        ↓
  ¿USE_MOCK = true?
        ├─→ SÍ: Usar MOCK_USER, setMockRole disponible
        │
        └─→ NO: onAuthStateChanged (Firebase)
                    ↓
              getUserRole(uid, email)
                    ↓
              Firestore: users/{uid}
                    ↓
              Si no existe: crear con rol "viewer"
                    ↓
              Admin emails hardcodeados → rol "admin"
```

**Descripción del flujo**:

1. **Detección de modo**: Si `VITE_FIREBASE_API_KEY` está vacía o es "demo-api-key", se activa el modo mock.

2. **Modo mock**: Usuario predefinido con toggle de rol en UI.

3. **Modo real**: Escucha cambios de auth con `onAuthStateChanged`.

4. **Roles**: Consulta Firestore para obtener rol. Si el email está en `ADMIN_EMAILS`, retorna "admin".

### 20.4. Flujo de Alertas

```
[App se monta]
        ↓
  useAlerts(products) se ejecuta
        ↓
  Para cada producto:
    ├─→ Verificar stock por color/talla vs threshold
    ├─→ Verificar margen (price - cost) vs 0
    └─→ Verificar variación de precio (histórico)
        ↓
  Verificar próximos feriados (HOLIDAYS)
        ↓
  getOrderAlerts() (pedidos recientes)
        ↓
  Unir todas las alertas
        ↓
  Mostrar en AlertsPage
```

**Descripción del flujo**:

1. **Alertas automáticas**: Se generan en tiempo real basándose en el catálogo de productos.

2. **Reglas configurables**: `rules` en `useAlerts` permite habilitar/deshabilitar tipos de alerta.

3. **Pedidos**: Las alertas de nuevos pedidos se generan cuando se crea un pedido (en `orderAlerts.ts`).

---

## 21. Dependencias entre Componentes

### 21.1. Árbol de Dependencias

```
App.tsx (Root)
├── QueryClientProvider (TanStack Query)
│   └── useQuery/useMutation disponible globalmente
│
├── AuthProvider
│   └── AuthContext
│       ├── useAuth() → user, role, isAdmin
│       └── Navigation (cambia según rol)
│
├── BrowserRouter
│   └── Routes
│       ├── AppLayout
│       │   ├── Header
│       │   │   ├── useAuth() → isAdmin, user
│       │   │   ├── useCartStore → totalItems
│       │   │   └── navigate()
│       │   │
│       │   ├── WhatsAppButton (flotante)
│       │   │
│       │   └── Outlet
│       │       ├── LandingPage
│       │       │   ├── useProducts()
│       │       │   ├── usePromotions()
│       │       │   ├── Firebase (suscriptores)
│       │       │   └── MusicSection
│       │       │       ├── useMusicStore (playlist)
│       │       │       ├── useCanciones()
│       │       │       ├── MusicPlayer
│       │       │       │   ├── useMusicStore
│       │       │       │   └── useRegistrarReproduccion()
│       │       │       ├── SongCard[]
│       │       │       │   ├── useMusicStore
│       │       │       │   ├── useAuth()
│       │       │       │   └── useToggleLike() / useUserLikedSongs() / useSongStats()
│       │       │       └── MonthlyRanking
│       │       │           ├── useMusicStore
│       │       │           ├── useMonthlyRanking()
│       │       │           └── useReproducciones()
│       │       │
│       │       ├── CatalogPage
│       │       │   ├── useProducts()
│       │       │   ├── ProductCard
│       │       │   │   └── ProductDetailModal
│       │       │   │       └── useCartStore.addItem()
│       │       │   │
│       │       │   └── BrandCard
│       │       │
│       │       ├── CartPage
│       │       │   ├── useCartStore
│       │       │   ├── CheckoutModal
│       │       │   │   ├── useCreateOrder()
│       │       │   │   └── useParamsStore (precios)
│       │       │   │
│       │       │   └── calculations.ts
│       │       │
│       │       └── [Admin Routes]
│       │           ├── DashboardPage
│       │           │   ├── useSales()
│       │           │   ├── useOrders()
│       │           │   ├── useProducts()
│       │           │   ├── paramsStore (escenarios)
│       │           │   └── Recharts
│       │           │
│       │           ├── ProductsPage
│       │           │   ├── useProducts()
│       │           │   ├── ProductManager
│       │           │   │   ├── ProductForm
│       │           │   │   └── ProductCard (edición)
│       │           │   └── useSaveProduct()
│       │           │   └── useDeleteProduct()
│       │           │
│       │           ├── OrdersPage
│       │           │   └── useOrders()
│       │           │
│       │           ├── AlertsPage
│       │           │   └── useAlerts(products)
│       │           │
│       │           ├── ImportExportPage
│       │           │   ├── PapaParse (CSV)
│       │           │   ├── XLSX (Excel)
│       │           │   └── useSaveProduct()
│       │           │
│       │           ├── ConfigPage
│       │           │   ├── paramsStore
│       │           │   └── GlobalParamsForm
│       │           │
│       │           └── MarketingPage
│       │               ├── usePromotions()
│       │               └── useSubscribers()
```

### 21.2. Imports más comunes

| Desde | Importar |
|-------|----------|
| Cualquier componente | `import { useAuth } from "@/context/AuthContext"` |
| Cualquier componente | `import { useCartStore } from "@/store/cartStore"` |
| Páginas de datos | `import { useProducts, useSaveProduct } from "@/hooks/useFirestore"` |
| Páginas de datos | `import { useOrders, addOrder } from "@/hooks/useOrders"` |
| Estilos/strings | `import { cn } from "@/lib/utils"` |
| Tipos | `import type { Product, Order } from "@/types"` |
| Componentes UI | `import { Button } from "@/components/ui/button"` |
| Componentes música | `import { useMusicStore } from "@/store/musicStore"` |
| Componentes música | `import { useCanciones, useMonthlyRanking } from "@/hooks/useMusic"` |
| Tipos música | `import type { Cancion, Reproduccion } from "@/types/music"` |

---

## 22. Cómo Realizar Tareas Comunes

### 22.1. Agregar una nueva ruta

1. **Crear la página**: Crear archivo en `src/pages/NuevaPagina.tsx`

2. **Importar en App.tsx**:
```typescript
import { NuevaPagina } from "@/pages/NuevaPagina"
```

3. **Agregar la ruta**:
```typescript
<Route path="/nueva-ruta" element={<NuevaPagina />} />
```

4. **Agregar navegación** (si es admin): En `Header.tsx`, agregar a `adminLinks`:
```typescript
{ to: "/nueva-ruta", label: "Nueva Ruta", icon: Icono }
```

### 22.2. Agregar un nuevo producto

Usar el hook `useSaveProduct`:

```typescript
import { useSaveProduct } from "@/hooks/useFirestore"

function MiComponente() {
  const saveProduct = useSaveProduct()
  
  const handleSave = () => {
    const nuevoProducto: Product = {
      id: crypto.randomUUID(),
      name: "Mi Producto",
      brand: "Mi Marca",
      category: "Remeras",
      price: 25000,
      cost: 12000,
      description: "Descripción",
      imageUrl: "https://...",
      colors: [{ name: "Negro", sizes: { S: 10, M: 20, L: 15 }}],
      material: "Algodón",
      tags: ["nuevo"],
      seccion: "general",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveProduct.mutate(nuevoProducto)
  }
}
```

### 22.3. Crear un nuevo componente UI

1. **Ubicación**: `src/components/ui/NombreComponente.tsx`

2. **Estructura básica con cva**:
```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

### 22.4. Usar el store de Zustand

```typescript
import { create } from "zustand"

// Definir interfaz
interface MiStore {
  datos: string[]
  agregar: (item: string) => void
}

// Crear store
export const useMiStore = create<MiStore>((set) => ({
  datos: [],
  agregar: (item) => set((state) => ({ 
    datos: [...state.datos, item] 
  })),
}))

// Usar en componente
function MiComponente() {
  const { datos, agregar } = useMiStore()
  return <button onClick={() => agregar("nuevo")}>Agregar</button>
}
```

### 22.5. Hacer una consulta a Firestore

```typescript
import { useQuery } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

function useMisDatos() {
  return useQuery({
    queryKey: ["mis-datos"],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "mi-coleccion"))
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    },
  })
}
```

### 22.6. Calcular precios con parámetros globales

```typescript
import { useParamsStore } from "@/store/paramsStore"

function Checkout() {
  const { params } = useParamsStore()
  const paymentMethod = params.cart.paymentMethods[0] // ej: "Efectivo"
  const recargo = paymentMethod.rate // 0.03 = 3%
  
  const subtotal = 25000
  const conRecargo = subtotal * (1 + recargo)
  
  // Envío gratis si supera threshold
  const shipping = subtotal > params.shipping.freeShippingThreshold 
    ? 0 
    : params.shipping.fixedCost
}
```

---

## 23. Convenciones del Proyecto

### 23.1. Nomenclatura de Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase con prefijo "use" | `useProducts.ts` |
| Stores | camelCase con sufijo "Store" | `cartStore.ts` |
| Utilidades | camelCase | `utils.ts`, `calculations.ts` |
| Tipos | PascalCase en `index.ts` | `types/index.ts` |
| Páginas | PascalCase con sufijo "Page" | `CatalogPage.tsx` |

### 23.2. Imports

- **Usar alias `@/`**: `import { useAuth } from "@/context/AuthContext"`
- **Orden recomendado**:
  1. Librerías externas (react, firebase, etc.)
  2. Alias @/ (propios)
  3. relative paths (./, ../)
- **Agrupar con líneas en blanco entre grupos**

```typescript
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { doc, setDoc } from "firebase/firestore"

import { useAuth } from "@/context/AuthContext"
import { useCartStore } from "@/store/cartStore"
import type { Product } from "@/types"

import { ProductCard } from "./ProductCard"
import { MyButton } from "./MyButton"
```

### 23.3. Componentes

- **Funcionales**: Usar arrow functions o function declarations
- **Props**: Tipar con TypeScript interfaces
- **Defaults**: Destructuración con valores por defecto
- **Nombre de archivo**: Igual al nombre del componente exportado

```typescript
// src/components/products/ProductCard.tsx
interface ProductCardProps {
  product: Product
  onSelect?: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return <div onClick={() => onSelect?.(product)}>...</div>
}
```

### 23.4. Estados y Mutaciones

- **useState**: Para estado local de componente
- **useQuery**: Para datos del servidor (TanStack Query)
- **useMutation**: Para modificaciones al servidor
- **Zustand**: Para estado global compartido

```typescript
// Correcto: datos del servidor
const { data, isLoading } = useProducts()

// Correcto: mutación al servidor
const saveMutation = useSaveProduct()
saveMutation.mutate(product)

// Incorrecto: no usar useState para datos del servidor
const [products, setProducts] = useState<Product[]>([])
```

### 23.5. Estilos CSS

- **Tailwind**: Clases utilitarias directas
- **Variables CSS**: Para temas configurables
- **cn()**: Para merging de clases condicionales
- **Evitar**: Estilos inline excepto para valores dinámicos

```typescript
// Correcto
<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary text-white",
  className
)} />

// Evitar
<div style={{ backgroundColor: isActive ? 'var(--color-primary)' : 'transparent' }} />
```

### 23.6. TypeScript

- **Tipos**: Usar `type` para alias simples, `interface` para objetos complejos
- **Exports**: Tipos en `types/index.ts`
- **Nullable**: Usar `?` en lugar de `| null` cuando sea claro
- **any**: EVITAR - tipar correctamente

```typescript
// Bien
interface OrderItem {
  productId: string
  quantity: number
}

// Bien para tipos simples
type Role = "admin" | "viewer"

// Evitar
const item: any = ...
```

---

## 24. Patterns y Antipatterns

### 24.1. Patterns Recomendados

**Pattern: Componente con Query**
```typescript
export function MiPagina() {
  const { data, isLoading, error } = useMiQuery()
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  if (!data) return <EmptyState />
  
  return <List items={data} />
}
```

**Pattern: Formulario con Mutation**
```typescript
export function MiFormulario() {
  const mutation = useMiMutation()
  
  const handleSubmit = (data) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast("Guardado!")
        navigate("/otra-pagina")
      }
    })
  }
  
  return <Form onSubmit={handleSubmit} />
}
```

**Pattern: Store con Persistencia**
```typescript
export const useMiStore = create<MiStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set(state => ({ 
        items: [...state.items, item] 
      })),
    }),
    { name: "mi-storage-key" }
  )
)
```

**Pattern: Modo Fallback (Mock)**
```typescript
const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY 

function miFuncion() {
  if (USE_MOCK) return datosLocales
  return fetchFromFirestore()
}
```

### 24.2. Antipatterns a Evitar

| Antipattern | Problema | Solución |
|-------------|----------|----------|
| `useEffect` para fetch de datos | Puede causar race conditions | Usar useQuery |
| Estado duplicado en local y global | Desincronización | Usar solo stores |
| Componentes muy grandes | Dificultad de mantenimiento | Separar en subcomponentes |
| Props drilling profundo | Código repetitivo | Usar Context o stores |
| `any` en TypeScript | Sin seguridad de tipos | Tipar correctamente |
| Fetch dentro de render | Performance | Usar useEffect con dependencias correctas o useQuery |

---

## 25. Configuración de Archivos

### 25.1. vite.config.ts

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 300,
    rolldownOptions: {
      output: {
        codeSplitting: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

**Propósito**: Configura el path alias `@/` que mapea a `src/`. Esto permite imports más limpios. También incluye configuración de Vitest para tests.

### 25.2. tsconfig.json (references)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**Propósito**: Divide la configuración TypeScript en dos partes:
- `tsconfig.app.json`: Para código fuente (src/)
- `tsconfig.node.json`: Para configuración (vite.config.ts, etc.)

### 25.3. tsconfig.app.json

Configura las opciones de TypeScript para la aplicación:
- `jsx: "react-jsx"`
- `moduleResolution: "bundler"`
- `allowImportingTsExtensions: true`
- `noEmit: true`

---

## 26. Detalles de Configuración de Firebase

### 26.1. Modo Mock vs Firebase Real

El sistema detecta automáticamente qué modo usar:

```typescript
const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY 
  || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"
```

**Si USE_MOCK = true**:
- No intenta conectar a Firestore
- Retorna datos de `MOCK_PRODUCTS`, `MOCK_SALES`
- Pedidos se guardan solo en localStorage
- Autenticación usa usuario hardcoded

**Si USE_MOCK = false**:
- Conecta a Firebase con configuración del .env
- Lee/escribe en Firestore real
- Autenticación con Firebase Auth

### 26.2. Seguridad de Firestore

**Reglas de ejemplo para producción**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Productos: anyone read, only admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    
    // Pedidos: solo el usuario que creó puede leer
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Usuarios: solo el propio usuario puede leer/escribir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 26.3. Índices Recomendados

Crear índices en Firestore Console para queries complejas:
- `promotions`: orderBy("createdAt", "desc")
- `orders`: orderBy("createdAt", "desc")

---

## 27. Detalles de Estilos y Tema

### 27.1. Sistema de Colores

El tema usa CSS variables de Tailwind v4. Los colores se definen en `src/index.css`:

```css
@theme {
  --color-primary: #7c5cfc;
  --color-primary-foreground: #ffffff;
  --color-background: #0d0d1a;
  /* ... más colores */
}
```

**Acceso en código**:
```typescript
// En CSS: bg-primary, text-primary, etc.
// En código: los colores no están expuestos como constantes JS
```

### 27.2. Gradientes Disponibles

| Clase | Colores |
|-------|---------|
| `gradient-primary` | #7c5cfc → #a78bfa |
| `gradient-accent` | #ec4899 → #f97316 |
| `gradient-brand` | #7c5cfc → #ec4899 |
| `gradient-cool` | #7c5cfc → #10b981 |
| `gradient-warm` | #f59e0b → #ef4444 |

### 27.3. Animaciones Personalizadas

```css
/* En index.css */
@keyframe shimmer { ... }
@keyframe gradientTextFlow { ... }
@keyframe gradientTextShimmer { ... }
```

**Clases de texto con gradiente**:
- `gradient-text`: Texto con gradiente estático
- `gradient-text-animated`: Gradiente que fluye
- `gradient-text-shimmer`: Brillo que pasa
- `gradient-text-rainbow`: Arcoíris suave
- `gradient-text-luxury`: Dorado/violeta elegante

---

## 28. Funcionalidades del Dashboard

### 28.1. KPIs del Dashboard

El dashboard muestra:
- **Ventas mensuales**: Del mes actual
- **Ventas anuales**: Del año actual
- **Margen bruto**: (ingresos - costos) / ingresos
- **Margen neto**: Después de impuestos/gastos
- **Productos top**: Por margen
- **Rotación de inventario**: Velocidad de venta

### 28.2. Escenarios

Los escenarios permiten proyectar cómo variaría el negocio:

| Escenario | Inflación | Ventas |
|-----------|-----------|--------|
| Base | 100% | 100% |
| Optimista | 70% | 120% |
| Pesimista | 150% | 85% |

Se usa `paramsStore.scenario` para controlar qué escenario está activo.

### 28.3. Gráficos con Recharts

El dashboard usa Recharts para visualizaciones:
- Gráfico de ventas mensual (AreaChart)
- Productos más vendidos (BarChart)
- Distribución por categoría (PieChart)

---

## 29. Import/Export de Productos

### 29.1. Import desde CSV

```typescript
import Papa from "papaparse"

// CSV esperado:
/*
name,brand,category,price,cost,description,material,tags,colors,sizes
"Remera Basic","Marca","Remeras",25000,12000,"Remera básica","Algodón","básico","Negro,Blanco","S:10,M:20,L:15"
*/
```

Procesamiento:
1. Parsear CSV con PapaParse
2. Convertir strings a tipos correctos
3. Validar campos requeridos
4. Crear objetos Product
5. Guardar con useSaveProduct()

### 29.2. Import desde Excel

```typescript
import * as XLSX from "xlsx"

const workbook = XLSX.read(data, { type: 'array' })
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet)
```

### 29.3. Export

Exportar a CSV o Excel con los datos actuales del catálogo.

---

## 30. Marketing y Promociones

### 30.1. Sistema de Promociones

Las promociones tienen:
- Título y descripción
- Porcentaje de descuento
- Código promocional (opcional)
- Fechas de vigencia
- Banner imagen
- Estado (active/inactive)

### 30.2. LandingPage muestra promos activas

```typescript
const activePromos = promotions.filter(
  p => p.active && 
  new Date(p.startDate) <= new Date() && 
  new Date(p.endDate) >= new Date()
)
```

### 30.3. Suscriptores

Los usuarios que se suscriben en el newsletter se guardan en Firestore (colección `subscribers`).

---

## 31. Sistema de Descuentos (previousPrice)

### 31.1. Concepto

El campo `previousPrice` (anteriormente `cost`) representa el **precio anterior** del producto. Cuando `previousPrice > price`, el producto está en oferta y se muestra:

- **Precio tachado** (el anterior)
- **Porcentaje de descuento en rojo** (`-X%`)

### 31.2. Migración desde `cost`

- `Product.cost` → `Product.previousPrice` (renombrado)
- `Sale.cost` eliminado (ya no se usa para cálculos de margen)
- `calculations.ts` simplificado: eliminados `calculateGrossMargin` y `calculateNetMargin`
- `KpiData.grossMargin` y `KpiData.netMargin` devuelven siempre 0
- `Projection.grossMargin` y `Projection.netMargin` eliminados

### 31.3. Migración automática desde Firebase

En `useProducts.ts`, la función `migrateProduct` convierte automáticamente productos viejos que tengan `cost` al nuevo campo `previousPrice`:

```typescript
if ("cost" in migrated && !("previousPrice" in migrated)) {
  migrated.previousPrice = migrated.cost
  delete migrated.cost
}
```

### 31.4. Visualización en UI

| Componente | Display |
|------------|---------|
| `ProductForm` | Label "Costo" → "Precio anterior". Se muestra tachado en resumen |
| `ProductCard` (grid) | `previousPrice > price` → muestra `-X%` en rojo debajo del precio |
| `ProductCard` (list) | Mismo badge rojo `-X%` |
| `ProductDetailModal` | Precio tachado + badge rojo `-X%` |

### 31.5. Regla de visualización

El descuento SE muestra solo cuando `previousPrice > price`. Si `previousPrice` está vacío o es menor que `price`, no se muestra nada (no hay oferta).

---

## 32. Responsive Mobile - Fixes

### 32.1. GLAMOURS Hero cortado

**Problema**: El texto "GLAMOURS" en `text-6xl` desbordaba el contenedor con `overflow-hidden` en mobile, cortando el texto.

**Solución**: Cambiado `text-6xl md:text-8xl` → `text-5xl sm:text-6xl md:text-8xl` en `Decorative3D.tsx`.

### 32.2. ProductDetailModal imagen cortada en mobile

**Problemas y soluciones** (en orden):

1. **Aspect ratio horizontal**: `aspect-[4/3]` (paisaje) cortaba la imagen vertical. Cambiado a `aspect-[3/4]` (retrato).

2. **Max-height fijo**: `max-sm:max-h-64` (256px) era muy bajo y no permitía que el aspect ratio se cumpliera. Cambiado a `max-sm:max-h-[55vh]` → luego eliminado completamente.

3. **Modal anclado al fondo**: `max-sm:items-end` causaba que el contenido se saliera por arriba del viewport. Cambiado a `max-sm:items-start`.

4. **Flex shrink**: El contenedor de la imagen se encogía en el flex layout. Agregado `max-sm:flex-shrink-0`.

5. **Object-position**: `object-cover` centraba la imagen por defecto, cortando arriba y abajo. Cambiado a `object-cover object-top` para anclar al borde superior.

**Clases finales del contenedor de imagen en mobile**:
```tsx
<div className="sm:col-span-2 relative bg-muted rounded-t-2xl 
  sm:rounded-tr-none sm:rounded-l-2xl overflow-hidden 
  max-sm:aspect-[3/4] max-sm:flex-shrink-0 sm:aspect-auto sm:min-h-[420px]">
  <img className="w-full h-full object-cover object-top" />
</div>
```

**Clases finales del modal en mobile**:
```tsx
<div className="absolute max-sm:inset-0 sm:inset-2 flex 
  max-sm:items-start sm:items-center justify-center pointer-events-none">
  <div className="relative w-full max-w-3xl max-sm:max-h-full 
    max-sm:min-h-full sm:rounded-2xl glass-deep border border-border 
    shadow-2xl animate-fade-up pointer-events-auto 
    max-sm:flex max-sm:flex-col max-sm:overflow-hidden">
```

---

## 33. Tests Actualizados

### 33.1. Cambios por eliminación de `cost`

| Archivo | Cambio |
|---------|--------|
| `src/test/calculations.test.ts` | Eliminados imports de `calculateGrossMargin` y `calculateNetMargin`. Eliminados tests de margen. `mockSale.cost` eliminado |
| `src/test/cartStore.test.ts` | `mockProduct.cost` → `previousPrice` |
| `src/test/projections.test.ts` | `mockSales.cost` eliminado. Test de `grossMargin`/`netMargin` actualizado |
| `src/test/utils.test.ts` | `mockProduct.cost` → `previousPrice` |

---

## 34. Alertas Eliminadas

- Eliminada la regla `negative_margin` del hook `useAlerts` (ya no hay cálculo de margen)
- El tipo `Alert.type` aún conserva `"negative_margin"` en la unión de tipos por compatibilidad, pero nunca se genera

---

## 35. Sistema de Música (Reproductor y Ranking)

### 35.1. Arquitectura General

El sistema de música se compone de 3 capas:

```
Firestore (canciones, reproducciones, likes)
    ↓
TanStack Query (useCanciones, useReproducciones, etc.)
    ↓
useMusicStore (Zustand) — estado del reproductor (canción actual, playlist, shuffle, volumen)
    ↓
Componentes UI (MusicSection, MusicPlayer, SongCard, MonthlyRanking)
```

### 35.2. Store: `src/store/musicStore.ts`

**Propósito**: Estado global del reproductor de música.

**Audio element singleton**: `audioEl` es una variable a nivel de módulo (no React state). Un solo `<Audio>` element creado por `new Audio()` se reusa para todas las canciones. Los eventos se conectan a través de `setupAudioEvents()`.

```typescript
interface MusicStore {
  // Estado
  currentSong: Cancion | null   // Canción actual
  playlist: Cancion[]            // Lista de reproducción activa
  isPlaying: boolean
  progress: number               // Segundos reproducidos
  duration: number               // Duración total
  volume: number                 // 0.0 - 1.0 (default 0.7)
  isLiked: boolean               // Like de la canción actual (para el usuario)
  audioError: string | null      // Error de audio
  hasJustChanged: boolean        // Flag para animaciones de transición
  shuffle: boolean               // Modo aleatorio activo

  // Acciones
  setCurrentSong(song)
  setPlaylist(songs)             // Sincronizada desde MusicSection
  setIsPlaying(playing)
  setProgress(progress)
  setDuration(duration)
  setVolume(volume)              // También aplica a audioEl.volume
  setIsLiked(liked)
  setAudioError(error)
  togglePlay()                   // Pausa/reanuda
  toggleShuffle()                // Activa/desactiva aleatorio
  seek(value)                    // Buscar en la canción
  playSong(song)                 // Reproducir canción (toggle si es la misma)
  playNext()                     // Siguiente en playlist
  playPrevious()                 // Anterior (o reinicio si >3s)
}
```

**Eventos internos del Audio element**:
- `timeupdate` → `setProgress(audioEl.currentTime)`
- `loadedmetadata` → `setDuration(audioEl.duration)`
- `ended` → `store.onEnded()` (auto-advance)
- `error` → `setAudioError(msg)` + pausa
- `canplay` → limpia `audioError`

**Auto-advance (`onEnded`)**:
1. Busca índice de `currentSong` en `playlist`
2. Si `shuffle=true`: elige aleatorio hasta que sea diferente
3. Si `shuffle=false`: `(idx + 1) % playlist.length`
4. Ejecuta `playNewSong()` y sale (no toca `isPlaying`)
5. Si playlist vacía o sin URL: `set({ isPlaying: false })`

**Registro de reproducción**:
- Se maneja desde `MusicPlayer.tsx` con `setInterval` de 1s
- Acumula segundos en `cumulativeSeconds` (useRef)
- Al llegar a 10s: llama `registrarReproduccion.mutate(currentSong.id)` y limpia el interval
- Se resetea al cambiar de canción (`useEffect` con dep `currentSong.id`)

### 35.3. Hooks: `src/hooks/useMusic.ts`

| Hook | Query Key | Propósito |
|------|-----------|-----------|
| `useCanciones()` | `["canciones"]` | Obtiene todas las canciones activas |
| `useCancion(id)` | `["cancion", id]` | Canción específica |
| `useSaveCancion()` | mutation | Crear/actualizar canción |
| `useDeleteCancion()` | mutation | Soft-delete (marca `deleted: true`) |
| `useResetMusicCollection()` | mutation | Reset total de la colección |
| `useReproducciones()` | `["reproducciones"]` | Todas las reproducciones |
| `useRegistrarReproduccion()` | mutation | Registrar nueva reproducción |
| `useLikes()` | `["likes"]` | Todos los likes |
| `useToggleLike()` | mutation | Dar/quitar like a una canción |
| `useMonthlyRanking()` | computed | Top 5 del mes (peso: likes=3, reproducciones=1) |
| `useUserLikedSongs()` | `["user-liked"]` | IDs de canciones liked por el usuario |
| `useSongStats(cancionId)` | computed | Total plays + total likes de una canción |

**Modo mock**: Todos los hooks usan arrays mutables a nivel de módulo (`mockCanciones`, `mockReproducciones`, `mockLikes`). Las mutations modifican estos arrays directamente e invalidan queries.

### 35.4. Flujo de reproducción

```
Usuario hace clic en SongCard/otro
    ↓
playSong(cancion)
    ├─ ¿Es la misma canción actual?
    │   ├─ Sí: toggle play/pause
    │   └─ No: playNewSong()
    │       ├─ createNewAudio() → nuevo Audio() + eventos
    │       ├─ set({ currentSong, isPlaying: true, progress: 0, ... })
    │       └─ a.play()
    │
    ↓ (en MusicPlayer, vía useEffect)
setInterval 1s → acumula segundos
    ↓ cuando cumulativeSeconds >= 10
registrarReproduccion.mutate(currentSong.id)
    ↓ (en el hook)
mockReproducciones.push({ cancionId, usuarioId, fechaReproduccion })
invalidar query ["reproducciones"]
    ↓
    ↓ (cuando termina la canción)
ended → onEnded() → playNext() (auto-advance)
```

### 35.5. Componentes UI

| Componente | Archivo | Props | Descripción |
|-----------|---------|-------|-------------|
| MusicSection | `src/components/music/MusicSection.tsx` | ninguna | Layout completo: llama `useCanciones()`, sincroniza `setPlaylist()`, renderiza MusicPlayer + MonthlyRanking + SongCards |
| MusicPlayer | `src/components/music/MusicPlayer.tsx` | ninguna | Reproductor visual con vinilo animado, controles, barra de progreso, volumen |
| SongCard | `src/components/music/SongCard.tsx` | `{ cancion: Cancion, index?: number }` | Tarjeta individual con track number, portada, stats, like |
| MonthlyRanking | `src/components/music/MonthlyRanking.tsx` | `{ canciones: Cancion[], compact?: boolean }` | Top 5 del mes, contador de reproducciones del día |
| Equalizer | `src/components/music/Equalizer.tsx` | `{ active: boolean, className?: string }` | Barras animadas |
| AdminMusicPanel | `src/components/music/AdminMusicPanel.tsx` | ninguna | Admin: subir, editar, eliminar canciones, importación masiva |

### 35.6. Tipos (`src/types/music.ts`)

```typescript
interface Cancion {
  id: string
  titulo: string
  artista: string
  archivoUrl: string       // URL del archivo MP3 (Firebase Storage o local)
  portadaUrl: string       // URL de la imagen de portada
  fechaSubida: string      // ISO date
  activo: boolean
}

interface Reproduccion {
  id: string
  cancionId: string
  usuarioId: string | null
  fechaReproduccion: string  // ISO date
}

interface LikeCancion {
  id: string
  cancionId: string
  usuarioId: string
  fechaLike: string
}

interface MonthlyRankingEntry {
  posicion: number
  cancionId: string
  titulo: string
  artista: string
  portadaUrl: string
  puntaje: number          // likes*3 + reproducciones
  likes: number
  reproducciones: number
}
```

### 35.7. Colecciones Firestore

| Colección | Documento | Propósito |
|-----------|-----------|-----------|
| `canciones` | `Cancion` | Catálogo de canciones |
| `reproducciones` | `Reproduccion` | Registro de cada reproducción >10s |
| `likes` | `LikeCancion` | Likes de usuarios a canciones |

En modo mock, todos los datos se almacenan en arrays mutables a nivel de módulo en `useMusic.ts`.

### 35.8. Estilos del reproductor (`src/index.css`)

```css
.music-player-wrapper     /* Contenedor relativo para glow */
.music-player-card        /* Card glass con backdrop-filter blur(40px) */
.vinyl-spin               /* Animación rotación 6s linear infinite */
.vinyl-spin-paused        /* Misma animación pero pausada */
.animate-pulse-ring       /* Pulse ring glow */
```

El disco de vinilo usa una imagen fija (`/images/pasta.jpg`) con overlay de brillo. La rotación se activa/desactiva toggleando las clases `vinyl-spin` / `vinyl-spin-paused`.

---

## 36. Exportación/Importación de Catálogo y Gestión Masiva de Productos

### 36.1. Exportación de Catálogo (CSV/Excel) — `ExportDialog.tsx`

Se agregaron dos nuevas funciones de exportación específicas para el catálogo de productos, separadas de las exportaciones de ventas/reportes:

| Función | Formato | Archivo |
|---------|---------|---------|
| `exportCatalogCSV()` | CSV | `catalogo-glamours.csv` |
| `exportCatalogExcel()` | XLSX | `catalogo-glamours.xlsx` |

**Columnas exportadas**: Nombre, Marca, Categoría, Género, Precio, Precio Anterior, Descripción, Imagen URL, Material, Tags, Sección, Estado, Colores, y todos los talles (XS, S, M, L, XL, XXL) con stock total por talle.

El campo **Tags** se usa para almacenar números de artículo. Se exporta como columna `"Tags"` (no `"Etiquetas"`) para que coincida con el nombre que espera la importación.

**Layout UI**: El Card de exportación se dividió en dos secciones:
- "Ventas y Reportes" → PDF / CSV / Excel (ventas)
- "Catálogo de Productos" → Descargar CSV / Descargar Excel

### 36.2. Importación Mejorada — `ImportDialog.tsx`

**Flujo actual (3 pasos)**:
1. **Seleccionar archivo** (CSV/XLSX) → se analiza y muestra preview con cantidad de productos detectados
2. **Imágenes locales** (opcional) → si el archivo tiene rutas locales en `Imagen URL`, lista los nombres de archivo necesarios. El usuario selecciona TODAS las imágenes de una vez. El sistema empareja automáticamente por **nombre de archivo** (extrae el filename de la ruta y lo matchea con las imágenes seleccionadas).
3. **Botón "Importar N productos"** → recién ahí se ejecuta la importación. No se importa automáticamente al seleccionar el archivo.

**Soporte de rutas locales de imagen**: Si `Imagen URL` contiene una ruta local (ej: `C:\ropa\7060450010.jpeg`), se detecta automáticamente. Si el usuario seleccionó una imagen con el mismo nombre de archivo (`7060450010.jpeg`), se sube a Firebase Storage (o se guarda como data URL comprimida si Storage no está disponible). Si no hay match, se guarda la ruta literal (no se verá en la web).

**Subida de imágenes (paso 2)**:
- **Procesamiento secuencial**: las imágenes se procesan una por una, no con `Promise.all`
- **Progreso visible**: muestra contador "Comprimiendo y subiendo imágenes... (3/5)"
- **Errores individuales**: si una imagen falla, muestra el error sin cancelar las demás
- **Timeout + fallback**: intenta Firebase Storage con 15s de timeout; si falla, usa la imagen redimensionada como data URL comprimida (600x600, JPEG 0.6, ~50-150KB en base64)

**Manejo de data URLs**: Si la columna `Imagen URL` contiene un data URL base64 (ej: `data:image/jpeg;base64,...`), el sistema lo sube automáticamente a Firebase Storage durante la importación para evitar el límite de 1MB de Firestore. Si Firebase Storage no está disponible, la imagen se redimensiona y almacena como data URL comprimida.

**Soporte bilingüe (español/inglés)**: Cada campo puede venir con nombre en español o inglés:

| Campo español | Campo inglés | Requerido |
|--------------|--------------|-----------|
| `Nombre` | `name` | Sí |
| `Marca` | `brand` | Sí |
| `Categoría` | `category` | Sí |
| `Precio` | `price` | Sí |
| `Precio Anterior` | `previousPrice` | No |
| `Descripción` | `description` | No |
| `Imagen URL` | `imageUrl` | No |
| `Material` | `material` | No |
| `Tags` / `Etiquetas` | `tags` | No |
| `Sección` | `seccion` | No |
| `Estado` | `status` | No |
| `Género` | `gender` | No |
| `Colores` | `colors` | No |

**Detección inteligente**:
- **Género**: `hombre/mujer/niños/bebes/unisex` (input flexible: acepta "hom", "muj", "nin", "beb")
- **Estado**: `activo/active`, `borrador/draft`, `archivado/archived`
- **Sección**: `ofertas/oferta`, `nueva-coleccion/nueva`
- **Colores**: se parsea como JSON array primero, si falla se divide por coma
- **Tags**: se dividen por coma

**Plantilla de ejemplo**: Se agregó enlace de descarga `/planilla_ejemplo.xlsx` generada por `scripts/generate-sample-sheet.mjs`.

### 36.3. Selección Múltiple y Eliminación en Lote — `ProductManager.tsx`

**Master checkbox** en la barra superior que permite:
- Seleccionar/deseleccionar todos los productos filtrados
- Estado indeterminado (`indeterminate`) cuando solo algunos están seleccionados
- Contador visible de productos seleccionados

**Eliminación en lote**:
1. Se seleccionan productos vía checkbox individual o master checkbox
2. Aparece botón "Eliminar" con cuenta de seleccionados
3. Confirmación con "Sí/No" antes de ejecutar
4. Usa `writeBatch` de Firestore para eliminar en lote
5. Invalida query `["products"]` al finalizar
6. Compatible con mock mode (no ejecuta batch si no hay API key real)

### 36.4. Assets de Productos — `ropa/`

Directorio con 18 imágenes de productos (9 artículos × 2 imágenes cada uno: `.jpeg` y `_model.png`) listas para ser referenciadas desde el catálogo. Pendiente de integración con los productos en Firestore.

### 36.5. Scripts

| Archivo | Propósito |
|---------|-----------|
| `scripts/generate-sample-sheet.mjs` | Genera `public/planilla_ejemplo.xlsx` con estructura de columnas esperada por la importación, fila de ejemplo y comentarios por columna |

### 36.6. Notas para Futuras AI

14. **Bilingüe en importación**: El importador acepta nombres de columna en español E inglés. Si se agregan nuevos campos, mantener ambos mapeos.
15. **Tags como números de artículo**: El campo `tags` almacena IDs de artículo como strings separados por coma. Se exporta como columna "Tags".
16. **Bulk delete en lote**: Usa `writeBatch` de Firestore (máximo 500 docs por lote). Para más de 500 productos, habría que dividir en múltiples batches.
17. **Planilla de ejemplo**: Se sirve desde `public/planilla_ejemplo.xlsx`. Si se cambian las columnas esperadas, regenerarla con `scripts/generate-sample-sheet.mjs`.
18. **Importación no automática**: El importador ya no guarda al seleccionar el archivo. Primero muestra preview, luego el usuario hace clic en "Importar".
19. **Imágenes locales en importación**: El input de imágenes es independiente del input de datos. El usuario selecciona el Excel, después selecciona las imágenes. El emparejamiento es por nombre de archivo (case-insensitive).
20. **Truncado en export Excel**: Los campos `Descripción`, `Imagen URL` y `Tags` se truncan a 30.000 caracteres para evitar el límite de 32.767 caracteres por celda de XLSX.
21. **Login obligatorio para comprar**: `ProductDetailModal` y `CartPage` redirigen a `/login?redirect=...` si el usuario no está autenticado. `LoginPage` lee el query param `redirect` y vuelve a esa ruta después de autenticar.
22. **Datos de cliente en pedidos**: Al crear una orden, se guarda `userId` en el documento `orders/{orderId}` y se actualiza `users/{userId}` con `name`, `email`, `phone`, `lastOrderId`, `lastOrderDate`.