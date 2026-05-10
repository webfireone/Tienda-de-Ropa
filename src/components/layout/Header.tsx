import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { useNavigate, useLocation } from "react-router-dom"
import { ShoppingCart, LayoutDashboard, Store, AlertTriangle, FileUp, Sparkles, User, LogOut, Package, Tag, Layers, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

const navLinks = [
  { to: "/", label: "Inicio", icon: Sparkles },
  { to: "/catalog", label: "Catálogo", icon: Store },
  { to: "/outlet", label: "Outlet", icon: Tag },
  { to: "/nueva-coleccion", label: "Nueva Colección", icon: Layers },
]

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Productos", icon: Package },
  { to: "/alerts", label: "Alertas", icon: AlertTriangle },
  { to: "/import-export", label: "Import/Export", icon: FileUp },
  { to: "/config", label: "Config", icon: Settings },
]

export function Header() {
  const { isAdmin, user, signOut, setMockRole } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const allLinks = [...navLinks, ...(isAdmin ? adminLinks : [])]

  return (
    <header className="sticky top-0 z-50">
      <div className="gradient-primary text-white text-[10px] tracking-[0.2em] uppercase text-center py-2 px-4">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3 w-3" />
          Envío gratis en compras +$120.000 · 3 cuotas sin interés
          <Sparkles className="h-3 w-3" />
        </span>
      </div>

      <div className="glass border-b border-primary/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 animate-float">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight hidden sm:inline">
              <span className="gradient-text">Tienda de Ropa</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto justify-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {allLinks.map(link => {
              const isActive = link.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.to)
              return (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 whitespace-nowrap",
                    isActive
                      ? "bg-secondary text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </button>
              )
            })}
          </nav>

          {/* Spacer for desktop */}
          <div className="hidden md:block w-20" />
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto px-4 pb-3 gap-2">
          {allLinks.map(link => {
            const isActive = location.pathname === link.to
            return (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <link.icon className="h-3 w-3" />
                {link.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sub-bar: Cart + Auth */}
      <div className="border-b border-primary/5 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Carrito</span>
              <span className="w-4 h-4 rounded-full gradient-primary text-white text-[8px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {USE_MOCK ? (
              <button
                onClick={() => setMockRole(isAdmin ? "viewer" : "admin")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all",
                  isAdmin
                    ? "gradient-primary text-white shadow-sm"
                    : "border border-primary/20 text-primary hover:bg-primary hover:text-white"
                )}
              >
                <User className="h-3 w-3" />
                {isAdmin ? "Admin" : "Cliente"}
              </button>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground hidden sm:inline">{user.email}</span>
                {isAdmin && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider gradient-primary text-white px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-primary/10 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium gradient-primary text-white shadow-sm hover:opacity-90 transition-all"
              >
                <User className="h-3 w-3" />
                Ingresar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
