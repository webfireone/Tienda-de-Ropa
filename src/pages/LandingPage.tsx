import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/hooks/useFirestore"
import { HeroSection } from "@/components/dashboard/Decorative3D"
import { Star, Quote, ArrowRight, Truck, RefreshCw, CreditCard, Shield, Sparkles } from "lucide-react"

const testimonials = [
  { name: "María G.", location: "Buenos Aires", text: "La calidad de las prendas es increíble. Me encanta la nueva colección.", rating: 5 },
  { name: "Carolina L.", location: "Córdoba", text: "Siempre encuentro lo que busco. Mi marca favorita.", rating: 5 },
  { name: "Lucía M.", location: "Neuquén", text: "El envío llegó súper rápido y la atención es excelente.", rating: 5 },
  { name: "Valentina R.", location: "Rosario", text: "Las telas son de altísima calidad. Se nota el trabajo.", rating: 4 },
]

export function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const { data: products = [] } = useProducts()

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

      {/* Featured Products */}
      <section className="bg-gradient-to-b from-transparent via-primary/5 to-transparent py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Productos</p>
              <h2 className="font-display text-3xl font-bold">Destacados</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/catalog")}>
              Ver todo <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product, i) => {
              const totalStock = Object.values(product.sizes).reduce((a, b) => a + b, 0)
              return (
                <div
                  key={product.id}
                  className="group cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={() => navigate("/catalog")}
                >
                  <div className="relative aspect-[3/4] rounded-2xl bg-gradient-to-br from-muted to-card overflow-hidden mb-4 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-500">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {totalStock < 10 && (
                      <span className="absolute top-3 left-3 gradient-accent text-white text-[9px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg">
                        Poco stock
                      </span>
                    )}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/30 transition-all duration-500" />
                  </div>
                  <h3 className="font-display text-base font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{product.description}</p>
                  <p className="font-semibold text-primary">
                    ${product.price.toLocaleString("es-AR")}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Categorías</p>
          <h2 className="font-display text-3xl font-bold">Explorá por categoría</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Pantalones", image: "https://placehold.co/600x800/6c5ce7/ffffff?text=Pantalones", count: "12 productos" },
            { title: "Remeras", image: "https://placehold.co/600x800/fd79a8/ffffff?text=Remeras", count: "8 productos" },
            { title: "Sweaters", image: "https://placehold.co/600x800/00b894/ffffff?text=Sweaters", count: "10 productos" },
          ].map(cat => (
            <div
              key={cat.title}
              className="group cursor-pointer relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              onClick={() => navigate("/catalog")}
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
                <li><button onClick={() => navigate("/catalog")} className="text-sm hover:text-white transition-colors">Novedades</button></li>
                <li><button onClick={() => navigate("/catalog")} className="text-sm hover:text-white transition-colors">Ofertas</button></li>
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
