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
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
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

### Other Components
| Componente | Descripción |
|-------------|-------------|
| BackgroundMusic | Reproductor de música de fondo con 2 tracks MP3 |
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

### Render (Deployment recomendado)
1. Crear cuenta en render.com
2. Conectar repositorio Git
3. Configurar:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Node Version: 20.x

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

---

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
│       │       │   └── Firebase (suscriptores)
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