import { useNavigate } from "react-router-dom"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-[120px] md:text-[180px] font-bold leading-none gradient-text mb-4">
        404
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Página no encontrada
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        La página que buscas no existe o fue movida. Revisá la URL o volvé al inicio.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-8 py-3 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
      >
        Volver al inicio
      </button>
    </div>
  )
}
