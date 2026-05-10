import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/context/AuthContext"
import { ParamsProvider } from "@/context/ParamsContext"
import { AppLayout } from "@/components/layout/AppLayout"
import { LandingPage } from "@/pages/LandingPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { CatalogPage } from "@/pages/CatalogPage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"
import { CartPage } from "@/pages/CartPage"
import { AlertsPage } from "@/pages/AlertsPage"
import { ImportExportPage } from "@/pages/ImportExportPage"
import { ProductsPage } from "@/pages/ProductsPage"

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
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/import-export" element={<ImportExportPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ParamsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
