import { useAuth } from "@/context/AuthContext"
import { useCartStore } from "@/store/cartStore"
import { useParamsStore } from "@/store/paramsStore"
import { useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { ShoppingCart, LayoutDashboard, Store, AlertTriangle, FileUp, Sparkles, User, LogOut, Package, Tag, Layers, Settings, BarChart3, FileText, ClipboardList, Truck, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "./Logo"
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
  { to: "/admin", label: "Inicio", icon: Sparkles },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Productos", icon: Package },
  { to: "/orders", label: "Pedidos", icon: ClipboardList },
  { to: "/alerts", label: "Alertas", icon: AlertTriangle },
  { to: "/import-export", label: "Import/Export", icon: FileUp },
  { to: "/belleza", label: "Belleza", icon: Sparkles },
  { to: "/config", label: "Config", icon: Settings },
  { to: "/marketing", label: "Marketing", icon: BarChart3 },
]

export function Header() {
  const { isAdmin, user, signOut, setMockRole } = useAuth()
  const { totalItems } = useCartStore()
  const { params } = useParamsStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const allLinks = isAdmin ? adminLinks : navLinks

  const showBanner = !isAdmin && params.shipping.announcementBannerEnabled && params.shipping.announcementBannerText

  const bannerText = params.shipping.announcementBannerText || "Envío gratis en compras +$120.000 · 3 cuotas sin interés"
  const segments = bannerText.split("·").map(s => s.trim()).filter(Boolean)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled ? "shadow-[0_8px_32px_rgba(124,92,252,0.12)]" : ""
      )}
    >
      {showBanner && (
        <div className="relative overflow-hidden bg-foreground text-background py-2">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20" />
          <div className="relative flex items-center">
            <div className="shrink-0 px-4 z-10 flex items-center gap-2">
              <Truck className="h-3 w-3" />
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
                {[...Array(3)].map((_, rep) => (
                  <div key={rep} className="flex items-center gap-6 px-4">
                    {segments.map((seg, i) => (
                      <span key={i} className="flex items-center gap-3">
                        <span className="font-semibold text-[11px] tracking-[0.15em] uppercase">
                          {seg}
                        </span>
                        {i < segments.length - 1 && (
                          <span className="text-[11px] opacity-40">·</span>
                        )}
                      </span>
                    ))}
                    <span className="px-4 opacity-30">·</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 px-4 z-10 flex items-center gap-2">
              <CreditCard className="h-3 w-3" />
            </div>
          </div>
        </div>
      )}

      <div
        className={`glass relative transition-all duration-500 ${scrolled ? "backdrop-blur-xl" : ""}`}
        style={{
          borderBottom: scrolled
            ? "1px solid rgba(124,92,252,0.2)"
            : "1px solid rgba(124,92,252,0.08)",
        }}
      >
        {/* Gradient border line at top */}
        <div
          className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500 z-10"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(124,92,252,0.7), rgba(236,72,153,0.6), transparent)",
            opacity: scrolled ? 0.8 : 0.4,
          }}
        />
        <div className="max-w-7xl mx-auto px-6 max-sm:h-12 sm:h-14 flex items-center justify-between gap-2 relative z-0">
          {/* Logo (solo para no-admin) */}
          {!isAdmin && (
            <div
              className="flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() => navigate("/")}
            >
              <Logo />
            </div>
          )}

          {/* Desktop nav */}
          <nav className={cn(
            "hidden md:flex items-center gap-0 overflow-x-auto",
            isAdmin ? "flex-1 justify-center" : "flex-1 justify-center"
          )} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {allLinks.map(link => {
              const isActive = !link.external && (link.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.to))
              return (
                <button
                  key={link.to}
                  onClick={() => link.external ? window.open(link.to, "_blank") : navigate(link.to)}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-1.5 text-[11px] font-menu rounded-lg transition-all duration-300 whitespace-nowrap shrink-0",
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
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {isAdmin && (
              <button
                onClick={() => window.open("/manual-usuario.pdf", "_blank")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Manual de usuario"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Manual</span>
              </button>
            )}
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
          <div className="flex overflow-x-auto px-3 pb-1 gap-1 no-scrollbar">
            {allLinks.map(link => {
              const isActive = !link.external && location.pathname === link.to
              return (
                <button
                  key={link.to}
                  onClick={() => link.external ? window.open(link.to, "_blank") : navigate(link.to)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 text-[10px] font-menu rounded-lg whitespace-nowrap transition-all duration-200 shrink-0",
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <link.icon className="h-2.5 w-2.5" />
                  {link.label}
                </button>
              )
            })}
          </div>
          <div className="flex items-center justify-between px-3 pb-2 border-t border-primary/5 pt-1.5">
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => window.open("/manual-usuario.pdf", "_blank")}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  <span>Manual</span>
                </button>
              )}
              <button
                onClick={() => navigate("/cart")}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShoppingCart className="h-3 w-3" />
                <span>Carrito</span>
                <span className="w-3.5 h-3.5 rounded-full gradient-primary text-white text-[7px] flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {USE_MOCK ? (
                <button
                  onClick={() => setMockRole(isAdmin ? "viewer" : "admin")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-medium transition-all",
                    isAdmin
                      ? "gradient-primary text-white shadow-sm"
                      : "border border-primary/20 text-primary hover:bg-primary hover:text-white"
                  )}
                >
                  <User className="h-2.5 w-2.5" />
                  {isAdmin ? "Admin" : "Cliente"}
                </button>
              ) : user ? (
                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <span className="text-[8px] font-semibold uppercase tracking-wider gradient-primary text-white px-1.5 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-medium border border-primary/10 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  >
                    <LogOut className="h-2.5 w-2.5" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-medium gradient-primary text-white shadow-sm hover:opacity-90 transition-all"
                >
                  <User className="h-2.5 w-2.5" />
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
