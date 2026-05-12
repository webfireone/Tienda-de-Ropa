import { lazy, Suspense, type ComponentType } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/context/AuthContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { CursorGlow } from "@/components/ui/CursorGlow"

function lazyPage<T extends ComponentType<any>>(importFn: () => Promise<{ [K: string]: T }>, name: string) {
  return lazy(() => importFn().then(m => ({ default: m[name] })))
}

const LandingPage = lazyPage(() => import("@/pages/LandingPage"), "LandingPage")
const DashboardPage = lazyPage(() => import("@/pages/DashboardPage"), "DashboardPage")
const CatalogPage = lazyPage(() => import("@/pages/CatalogPage"), "CatalogPage")
const ProductDetailPage = lazyPage(() => import("@/pages/ProductDetailPage"), "ProductDetailPage")
const CartPage = lazyPage(() => import("@/pages/CartPage"), "CartPage")
const AlertsPage = lazyPage(() => import("@/pages/AlertsPage"), "AlertsPage")
const ImportExportPage = lazyPage(() => import("@/pages/ImportExportPage"), "ImportExportPage")
const ProductsPage = lazyPage(() => import("@/pages/ProductsPage"), "ProductsPage")
const LoginPage = lazyPage(() => import("@/pages/LoginPage"), "LoginPage")
const ConfigPage = lazyPage(() => import("@/pages/ConfigPage"), "ConfigPage")
const OutletPage = lazyPage(() => import("@/pages/OutletPage"), "OutletPage")
const NuevaColeccionPage = lazyPage(() => import("@/pages/NuevaColeccionPage"), "NuevaColeccionPage")
const MarketingPage = lazyPage(() => import("@/pages/MarketingPage"), "MarketingPage")
const OrdersPage = lazyPage(() => import("@/pages/OrdersPage"), "OrdersPage")
const AdminHomePage = lazyPage(() => import("@/pages/AdminHomePage"), "AdminHomePage")
const NotFoundPage = lazyPage(() => import("@/pages/NotFoundPage"), "NotFoundPage")

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: 1,
    },
  },
})

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <CursorGlow />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/admin" element={<AdminHomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/import-export" element={<ImportExportPage />} />
                <Route path="/config" element={<ConfigPage />} />
                <Route path="/outlet" element={<OutletPage />} />
                <Route path="/nueva-coleccion" element={<NuevaColeccionPage />} />
                <Route path="/marketing" element={<MarketingPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
