import { useAuth } from "@/context/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { ShoppingCart, LayoutDashboard, Store, AlertTriangle, FileUp, Sparkles, User, LogOut, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

const navLinks = [
  { to: "/", label: "Inicio", icon: Sparkles },
  { to: "/catalog", label: "Catálogo", icon: Store },
  { to: "/cart", label: "Carrito", icon: ShoppingCart },
]

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Productos", icon: Package },
  { to: "/alerts", label: "Alertas", icon: AlertTriangle },
  { to: "/import-export", label: "Import/Export", icon: FileUp },
]

export function Header() {
  const { isAdmin, user, signOut, setMockRole } = useAuth()
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 animate-float">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              <span className="gradient-text">Tienda de Ropa</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {allLinks.map(link => {
              const isActive = link.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.to)
              return (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-secondary text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {link.to === "/cart" && (
                    <span className="w-5 h-5 rounded-full gradient-primary text-white text-[9px] flex items-center justify-center font-bold">
                      0
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {USE_MOCK ? (
              <button
                onClick={() => setMockRole(isAdmin ? "viewer" : "admin")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-300",
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
                <span className="text-xs text-muted-foreground hidden md:inline">{user.email}</span>
                {isAdmin && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider gradient-primary text-white px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-primary/10 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium gradient-primary text-white shadow-sm hover:opacity-90 transition-all"
              >
                <User className="h-3 w-3" />
                Ingresar
              </button>
            )}
          </div>
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
    </header>
  )
}
