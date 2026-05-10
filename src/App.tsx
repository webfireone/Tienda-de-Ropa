import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/context/AuthContext"
import { ParamsProvider } from "@/context/ParamsContext"
import { CartProvider } from "@/context/CartContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { LandingPage } from "@/pages/LandingPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { CatalogPage } from "@/pages/CatalogPage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"
import { CartPage } from "@/pages/CartPage"
import { AlertsPage } from "@/pages/AlertsPage"
import { ImportExportPage } from "@/pages/ImportExportPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { LoginPage } from "@/pages/LoginPage"
import { ConfigPage } from "@/pages/ConfigPage"
import { OutletPage } from "@/pages/OutletPage"
import { NuevaColeccionPage } from "@/pages/NuevaColeccionPage"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ParamsProvider>
          <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
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
              </Route>
            </Routes>
          </BrowserRouter>
          </CartProvider>
        </ParamsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
