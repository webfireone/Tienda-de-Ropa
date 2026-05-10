import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { useNavigate, useLocation } from "react-router-dom"
import { ShoppingCart, LayoutDashboard, Store, AlertTriangle, FileUp, Sparkles, User, LogOut, Package, Tag, Layers, Settings, Megaphone, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ComponentType } from "react"

const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key"

interface NavLink { to: string; label: string; icon: ComponentType<{ className?: string }>; external?: boolean }

const navLinks: NavLink[] = [
  { to: "/", label: "Inicio", icon: Sparkles },
  { to: "/catalog", label: "Catálogo", icon: Store },
  { to: "/outlet", label: "Outlet", icon: Tag },
  { to: "/nueva-coleccion", label: "Nueva Colección", icon: Layers },
]

const adminLinks: NavLink[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Productos", icon: Package },
  { to: "/alerts", label: "Alertas", icon: AlertTriangle },
  { to: "/import-export", label: "Import/Export", icon: FileUp },
  { to: "/config", label: "Config", icon: Settings },
  { to: "/marketing", label: "Marketing", icon: Megaphone },
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
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {allLinks.map(link => {
              const isActive = !link.external && (link.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.to))
              return (
                <button
                  key={link.to}
                  onClick={() => link.external ? window.open(link.to, "_blank") : navigate(link.to)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-xl transition-all duration-300 whitespace-nowrap shrink-0",
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

          {/* Cart + Auth (desktop) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.open("/manual-usuario.pdf", "_blank")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Manual de usuario"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Manual</span>
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Carrito</span>
              <span className="w-4 h-4 rounded-full gradient-primary text-white text-[8px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            </button>
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground hidden xl:inline">{user.email}</span>
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

        {/* Mobile nav + cart + auth */}
        <div className="md:hidden flex flex-col">
          <div className="flex overflow-x-auto px-4 pb-2 gap-2">
            {allLinks.map(link => {
              const isActive = !link.external && location.pathname === link.to
              return (
                <button
                  key={link.to}
                  onClick={() => link.external ? window.open(link.to, "_blank") : navigate(link.to)}
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
          <div className="flex items-center justify-between px-4 pb-3 border-t border-primary/5 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open("/manual-usuario.pdf", "_blank")}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Manual</span>
              </button>
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
                <div className="flex items-center gap-2">
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
      </div>
    </header>
  )
}
