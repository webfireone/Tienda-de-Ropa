import { NavLink, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  AlertTriangle,
  FileUp,
  Shirt,
  User,
  Package,
} from "lucide-react"

export function Sidebar() {
  const { isAdmin, user, setMockRole } = useAuth()
  const navigate = useNavigate()

  const clientLinks = [
    { to: "/", label: "Inicio", icon: Shirt },
    { to: "/catalog", label: "Catálogo", icon: Store },
    { to: "/cart", label: "Carrito de Compra", icon: ShoppingCart },
  ]

  const adminLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Productos", icon: Package },
    { to: "/catalog", label: "Catálogo", icon: Store },
    { to: "/cart", label: "Carrito de Compra", icon: ShoppingCart },
    { to: "/alerts", label: "Alertas", icon: AlertTriangle },
    { to: "/import-export", label: "Importar/Exportar", icon: FileUp },
  ]

  const links = isAdmin ? adminLinks : clientLinks

  return (
    <aside className="w-64 border-r border-border bg-background min-h-screen p-6 flex flex-col">
      <div
        className="flex items-center gap-3 mb-10 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 bg-primary flex items-center justify-center">
          <Shirt className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-heading text-lg font-semibold tracking-tight">Sail</span>
          <span className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
            {isAdmin ? "Admin Panel" : "Tienda"}
          </span>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-4 px-3">
        {isAdmin ? "Administración" : "Navegación"}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/" || to === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-300 border-l-2",
                isActive
                  ? "text-foreground border-l-primary bg-muted/50"
                  : "text-muted-foreground border-l-transparent hover:text-foreground hover:border-l-border"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <div className="w-8 h-8 bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email?.split("@")[0]}</p>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
              {isAdmin ? "Admin" : "Cliente"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setMockRole(isAdmin ? "viewer" : "admin")}
          className="w-full text-xs text-muted-foreground hover:text-foreground tracking-wider uppercase py-2 text-center transition-colors"
        >
          {isAdmin ? "Ver como cliente →" : "Modo admin →"}
        </button>
      </div>
    </aside>
  )
}
