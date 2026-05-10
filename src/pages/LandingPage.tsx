import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HeroSection } from "@/components/dashboard/Decorative3D"
import { Star, Quote, Truck, RefreshCw, CreditCard, Shield, Sparkles } from "lucide-react"

const BRANDS = [
  { name: "Sail", logo: "/logos/sail.jpg" },
  { name: "OWOKO", logo: "/logos/owoko.jpg" },
  { name: "Legacy", logo: "/logos/legacy.jpg" },
  { name: "Billi", logo: "/logos/billi.jpg" },
]

const testimonials = [
  { name: "María G.", location: "Buenos Aires", text: "La calidad de las prendas es increíble. Me encanta la nueva colección.", rating: 5 },
  { name: "Carolina L.", location: "Córdoba", text: "Siempre encuentro lo que busco. Mi marca favorita.", rating: 5 },
  { name: "Lucía M.", location: "Neuquén", text: "El envío llegó súper rápido y la atención es excelente.", rating: 5 },
  { name: "Valentina R.", location: "Rosario", text: "Las telas son de altísima calidad. Se nota el trabajo.", rating: 4 },
]

export function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  const gradients = [
    "from-violet-600/30 via-fuchsia-600/20 to-indigo-600/30",
    "from-fuchsia-600/30 via-rose-600/20 to-violet-600/30",
    "from-indigo-600/30 via-violet-600/20 to-fuchsia-600/30",
    "from-rose-600/30 via-fuchsia-600/20 to-indigo-600/30",
  ]
  const borders = [
    "border-violet-500/30 hover:border-violet-400/60",
    "border-fuchsia-500/30 hover:border-fuchsia-400/60",
    "border-indigo-500/30 hover:border-indigo-400/60",
    "border-rose-500/30 hover:border-rose-400/60",
  ]

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-8">
        <HeroSection />
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: "Envío gratis", desc: "desde $120.000", color: "from-violet-500/30 to-fuchsia-500/30" },
            { icon: RefreshCw, title: "Cambios", desc: "30 días", color: "from-rose-500/30 to-amber-500/30" },
            { icon: CreditCard, title: "3 cuotas", desc: "sin interés", color: "from-cyan-500/30 to-blue-500/30" },
            { icon: Shield, title: "Seguro", desc: "100% protegido", color: "from-emerald-500/30 to-teal-500/30" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-primary/10 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nuestras Marcas */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d0d1a] via-[#161627] to-[#1a0a2e] border border-primary/10 min-h-[420px] mx-6 my-16">
        <div className="hero-grid absolute inset-0 opacity-30" />

        {/* Brand cards grid (right side) */}
        <div className="absolute inset-y-0 right-0 w-1/2 md:w-3/5 flex items-center justify-center p-8 pointer-events-none">
          <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
            {BRANDS.map((brand, i) => (
              <div
                key={brand.name}
                className="relative aspect-square rounded-2xl bg-gradient-to-br from-card/60 via-card/40 to-card/60 backdrop-blur-sm border shadow-xl overflow-hidden group pointer-events-auto"
                style={{ borderColor: "inherit" }}
              >
                {/* Gradient background overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i]} opacity-60 group-hover:opacity-90 transition-opacity duration-500`} />
                {/* Gradient border faux via inset */}
                <div className={`absolute inset-0 rounded-2xl border ${borders[i]} transition-colors duration-300`} />
                {/* Inner glow */}
                <div className="absolute -inset-12 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Logo */}
                <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                  <div className="relative w-full h-full">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain brightness-[1.2] contrast-[0.9]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/50 via-fuchsia-500/50 to-indigo-500/50 mix-blend-color" />
                  </div>
                </div>
                {/* Brand name label */}
                <div className="absolute bottom-0 left-0 right-0 text-center pb-2 z-10">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50 group-hover:text-white/80 transition-colors duration-300">
                    {brand.name}
                  </span>
                </div>
                {/* Corner accents */}
                <div className="absolute top-3 left-3 w-6 h-[1px] bg-gradient-to-r from-violet-400/60 to-transparent" />
                <div className="absolute top-3 left-3 w-[1px] h-6 bg-gradient-to-b from-violet-400/60 to-transparent" />
                <div className="absolute bottom-3 right-3 w-6 h-[1px] bg-gradient-to-l from-fuchsia-400/60 to-transparent" />
                <div className="absolute bottom-3 right-3 w-[1px] h-6 bg-gradient-to-t from-fuchsia-400/60 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        {/* Left text */}
        <div className="relative z-10 flex flex-col justify-center h-full min-h-[420px] max-w-xl px-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-primary/10 text-xs font-semibold text-primary mb-6 w-fit shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Marcas exclusivas
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
            <span className="gradient-text">Nuestras</span>
            <br />
            <span className="gradient-text">Marcas</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            Sail, OWOKO, Legacy y Billi — calidad y estilo en cada prenda.
          </p>
        </div>
      </section>

      {/* Secciones */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Secciones</p>
          <h2 className="font-display text-3xl font-bold">Explorá por sección</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Catálogo", image: "https://placehold.co/600x800/6c5ce7/ffffff?text=Catalogo", count: "Todos los productos", path: "/catalog" },
            { title: "Outlet", image: "https://placehold.co/600x800/fd79a8/ffffff?text=Outlet", count: "Precios especiales", path: "/outlet" },
            { title: "Nueva Colección", image: "https://placehold.co/600x800/00b894/ffffff?text=Nueva+Coleccion", count: "Lo último", path: "/nueva-coleccion" },
          ].map(cat => (
            <div
              key={cat.title}
              className="group cursor-pointer relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              onClick={() => navigate(cat.path)}
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-xl font-bold text-white mb-1">{cat.title}</h3>
                <p className="text-sm text-white/80">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-gradient-to-br from-[#0d0d1a] via-[#161627] to-[#1a0a2e] border-y border-primary/10 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Quote className="h-10 w-10 mx-auto mb-6 text-primary/30" />
          <blockquote className="font-display text-2xl md:text-3xl leading-relaxed mb-6 font-medium">
            "Vestir es una forma de expresar quién eres. Nos enorgullece inspirar a través de la ropa, para que cada persona se sienta auténtica y segura."
          </blockquote>
          <p className="text-sm text-muted-foreground tracking-wider uppercase mb-8">— Equipo de Tienda de Ropa</p>
          <Button variant="default" onClick={() => navigate("/catalog")}>
            Conocé nuestra colección
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Testimonios</p>
          <h2 className="font-display text-3xl font-bold">#ComunidadTienda</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-primary/10 shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s < t.rating ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.location}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden gradient-primary py-20">
        <div className="absolute inset-0 hero-grid opacity-10" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/5 blur-3xl animate-float-reverse" />

        <div className="max-w-xl mx-auto px-6 text-center relative z-10">
          <Sparkles className="h-8 w-8 mx-auto mb-4 text-white/60" />
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            ¿Listo para actualizar tu estilo?
          </h2>
          <p className="text-base text-white/80 mb-8">
            Suscribite y recibí 10% OFF en tu primera compra
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); setEmail("") }}
            className="flex gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white rounded-xl"
            />
            <Button type="submit" className="bg-white text-primary hover:bg-white/90 shadow-xl whitespace-nowrap rounded-xl">
              Suscribirme
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-white/60 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-display text-lg font-bold text-white">Tienda de Ropa</span>
              </div>
              <p className="text-sm leading-relaxed">Moda unisex con estilo y calidad desde 2024.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">Tienda</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/catalog")} className="text-sm hover:text-white transition-colors">Catálogo</button></li>
                <li><button onClick={() => navigate("/outlet")} className="text-sm hover:text-white transition-colors">Outlet</button></li>
                <li><button onClick={() => navigate("/nueva-coleccion")} className="text-sm hover:text-white transition-colors">Nueva Colección</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">Ayuda</h4>
              <ul className="space-y-2">
                <li><span className="text-sm">Envíos</span></li>
                <li><span className="text-sm">Cambios y Devoluciones</span></li>
                <li><span className="text-sm">Preguntas Frecuentes</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-white mb-4">Redes</h4>
              <ul className="space-y-2">
                <li><span className="text-sm">Instagram</span></li>
                <li><span className="text-sm">Facebook</span></li>
                <li><span className="text-sm">TikTok</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-xs">© 2026 Tienda de Ropa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
