import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HeroSection } from "@/components/dashboard/Decorative3D"
import { Star, Quote, Truck, RefreshCw, CreditCard, Shield, Sparkles, Tag, AlertCircle } from "lucide-react"
import { useProducts } from "@/hooks/useFirestore"
import { usePromotions } from "@/hooks/usePromotions"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

const testimonials = [
  { name: "María G.", location: "Buenos Aires", text: "La calidad de las prendas es increíble. Me encanta la nueva colección.", rating: 5 },
  { name: "Carolina L.", location: "Córdoba", text: "Siempre encuentro lo que busco. Mi marca favorita.", rating: 5 },
  { name: "Lucía M.", location: "Neuquén", text: "El envío llegó súper rápido y la atención es excelente.", rating: 5 },
  { name: "Valentina R.", location: "Rosario", text: "Las telas son de altísima calidad. Se nota el trabajo.", rating: 4 },
]

const ITEMS = [
  { title: "Elegante", desc: "Looks sofisticados para tus momentos especiales", gradient: "from-violet-600/80 via-violet-600/20 to-transparent" },
  { title: "Casual", desc: "Estilo relajado para el día a día", gradient: "from-fuchsia-600/80 via-fuchsia-600/20 to-transparent" },
  { title: "Urbano", desc: "Lo último en moda urbana y tendencias", gradient: "from-indigo-600/80 via-indigo-600/20 to-transparent" },
]

function pickRandom(arr: string[], count: number, exclude: string[] = []): string[] {
  let pool = exclude.length > 0 && arr.length > exclude.length ? arr.filter(x => !exclude.includes(x)) : arr
  if (pool.length < count) pool = arr
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function LandingPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [subError, setSubError] = useState("")
  const [subLoading, setSubLoading] = useState(false)
  const { data: products = [] } = useProducts()
  const { data: promotions = [] } = usePromotions()
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const activePromos = promotions.filter(p => p.active && new Date(p.startDate) <= new Date() && new Date(p.endDate) >= new Date())

  useEffect(() => {
    const urls = products.filter(p => p.imageUrl).map(p => p.imageUrl)
    if (urls.length < 3) return
    setCurrentImages(pickRandom(urls, 3))
    const timer = setInterval(() => {
      setCurrentImages(prev => {
        const next = pickRandom(urls, 3, prev)
        return next.length === 3 ? next : pickRandom(urls, 3)
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [products])

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-8">
        <HeroSection />
      </section>

      {/* Active promotions banner */}
      {activePromos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-8">
          <div className="flex flex-col gap-4">
            {activePromos.map(p => (
              <div key={p.id} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-card border border-primary/20 p-5 group cursor-pointer" onClick={() => navigate("/catalog")}>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex w-14 h-14 rounded-xl bg-primary/30 items-center justify-center shrink-0">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-foreground">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {p.discountPercent > 0 && (
                        <span className="text-sm font-bold text-primary">{p.discountPercent}% OFF</span>
                      )}
                      {p.promoCode && (
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary">{p.promoCode}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Ver colección →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
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
      </motion.section>

      {/* Inspírate */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d0d1a] via-[#161627] to-[#1a0a2e] border border-primary/10 mx-6 my-16">
        <div className="hero-grid absolute inset-0 opacity-30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-primary/10 text-xs font-semibold text-primary mb-4 w-fit shadow-sm mx-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Inspiración
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
              <span className="gradient-text">Descubrí tu estilo</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              Looks seleccionados para cada ocasión. Encontrá la inspiración que buscás.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ITEMS.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                key={item.title}
                className="group cursor-pointer relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
                onClick={() => navigate("/catalog")}
              >
                {currentImages[i] ? (
                  <img src={currentImages[i]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 animate-pulse" />
                )}
                <div className={`absolute inset-0 bg-gradient-to-b ${item.gradient} opacity-70 group-hover:opacity-85 transition-opacity duration-500`} />
                <div className="absolute -inset-12 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Label badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-card/70 backdrop-blur-sm border border-white/20 text-xs font-semibold tracking-wide text-white shadow-lg shadow-black/20">
                    {item.title}
                  </span>
                </div>
                {/* Description at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <p className="text-sm text-white/80 leading-relaxed">{item.desc}</p>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-x-0 translate-x-2">
                  <span className="text-white text-lg leading-none">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Secciones */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Secciones</p>
          <h2 className="font-display text-3xl font-bold"><span className="gradient-text">Explorá por sección</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Catálogo", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=480&fit=crop", count: "Todos los productos", path: "/catalog", accent: "border-violet-500/30", glow: "from-violet-500/10 via-violet-500/5", iconBg: "bg-violet-500/20" },
            { title: "Outlet", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=480&fit=crop", count: "Precios especiales", path: "/outlet", accent: "border-rose-500/30", glow: "from-rose-500/10 via-rose-500/5", iconBg: "bg-rose-500/20" },
            { title: "Nueva Colección", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=480&fit=crop", count: "Lo último", path: "/nueva-coleccion", accent: "border-emerald-500/30", glow: "from-emerald-500/10 via-emerald-500/5", iconBg: "bg-emerald-500/20" },
          ].map((cat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
              key={cat.title}
              className="group cursor-pointer relative aspect-[5/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              onClick={() => navigate(cat.path)}
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`absolute inset-[1px] rounded-2xl border ${cat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              {/* Centered content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} backdrop-blur-sm border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-400`}>
                  <span className="text-white/80 text-xl font-bold">{cat.title.charAt(0)}</span>
                </div>
                <h3 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">{cat.title}</h3>
                <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors duration-300 max-w-[200px]">{cat.count}</p>
                <div className="mt-5 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/70 border-b border-white/30 pb-1">
                    Explorar
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </motion.div>
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
          <h2 className="font-display text-3xl font-bold"><span className="gradient-text">#ComunidadTienda</span></h2>
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
      <section className="relative overflow-hidden bg-gradient-to-br from-card via-background to-card border-y border-primary/10 py-20">
        <div className="absolute inset-0 hero-grid opacity-5" />
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl animate-float-reverse" />

        <div className="max-w-xl mx-auto px-6 text-center relative z-10">
          <Sparkles className="h-8 w-8 mx-auto mb-4 text-primary/60" />
          <h2 className="font-display text-3xl font-bold mb-4">
            <span className="gradient-text">¿Listo para actualizar tu estilo?</span>
          </h2>
          <p className="text-base text-muted-foreground mb-8">
            Suscribite y recibí 10% OFF en tu primera compra
          </p>
          {!subscribed ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!email) return
                setSubLoading(true)
                setSubError("")
                try {
                  await addDoc(collection(db, "subscribers"), {
                    email,
                    subscribedAt: new Date().toISOString(),
                    source: "landing-page",
                    active: true,
                  })
                  setSubscribed(true)
                } catch (err) {
                  setSubError("Ocurrió un error al suscribirte. Intentá de nuevo.")
                } finally {
                  setSubLoading(false)
                }
              }}
              className="flex flex-col gap-3 max-w-md mx-auto"
            >
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSubError("") }}
                  required
                  className="flex-1 bg-muted border-border text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary rounded-xl"
                />
                <Button type="submit" disabled={subLoading} className="bg-primary text-primary-foreground hover:opacity-90 shadow-xl whitespace-nowrap rounded-xl disabled:opacity-50">
                  {subLoading ? "Enviando..." : "Suscribirme"}
                </Button>
              </div>
              {subError && (
                <p className="text-xs text-destructive flex items-center gap-1.5 justify-center">
                  <AlertCircle className="h-3 w-3" /> {subError}
                </p>
              )}
            </form>
          ) : (
            <div className="animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-success text-2xl">✓</span>
              </div>
              <p className="text-lg font-semibold text-foreground">¡Gracias por suscribirte!</p>
              <p className="text-sm text-muted-foreground mt-1">Pronto recibirás novedades y ofertas exclusivas.</p>
            </div>
          )}
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
