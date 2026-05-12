import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HeroSection } from "@/components/dashboard/Decorative3D"
import { Star, Truck, RefreshCw, CreditCard, Shield, Tag } from "lucide-react"
import { useProducts } from "@/hooks/useFirestore"
import { usePromotions } from "@/hooks/usePromotions"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
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
  const { isAdmin } = useAuth()

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin", { replace: true })
    }
  }, [isAdmin, navigate])

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

      {/* Active promotions */}
      {activePromos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-8">
          <div className="flex flex-col gap-3">
            {activePromos.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-5 group cursor-pointer hover:bg-white/[0.04] transition-all duration-500"
                onClick={() => navigate("/catalog")}
              >
                <div className="flex items-center gap-5">
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
                    <Tag className="h-5 w-5 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-semibold text-white/80">{p.title}</h3>
                    <p className="text-xs text-white/30 mt-0.5">{p.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {p.discountPercent > 0 && (
                        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-violet-400">{p.discountPercent}% OFF</span>
                      )}
                      {p.promoCode && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">{p.promoCode}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-white/20 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wider uppercase">Ver →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features — inline minimal */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {[
            { icon: Truck, title: "Envío gratis", desc: "desde $120.000" },
            { icon: RefreshCw, title: "Cambios", desc: "30 días" },
            { icon: CreditCard, title: "3 cuotas", desc: "sin interés" },
            { icon: Shield, title: "Seguro", desc: "100% protegido" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 p-5 hover:bg-white/[0.03] transition-colors duration-300">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <p className="text-xs font-medium text-white/60">{title}</p>
                <p className="text-[10px] text-white/20 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inspírate — DRAMATIC TYPOGRAPHY */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/20 mb-4"
          >
            Inspiración
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] text-white/90"
          >
            Descubrí<br />
            <span className="gradient-text">tu estilo</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs text-white/30 mt-6 tracking-wider max-w-xs mx-auto"
          >
            Looks seleccionados para cada ocasión
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ITEMS.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              key={item.title}
              className="group cursor-pointer relative aspect-[3/4] rounded-2xl overflow-hidden"
              onClick={() => navigate("/catalog")}
            >
              {currentImages[i] ? (
                <img src={currentImages[i]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-2">{item.title}</p>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-1">
                <span className="text-white/60 text-sm">→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Secciones — DRAMATIC */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/20 mb-4"
          >
            Secciones
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-6xl md:text-8xl font-bold tracking-tight leading-[0.9]"
          >
            <span className="gradient-text">Explorá</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: "Catálogo", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop", count: "Todos los productos", path: "/catalog" },
            { title: "Outlet", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=600&fit=crop", count: "Precios especiales", path: "/outlet" },
            { title: "Nueva Colección", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop", count: "Lo último", path: "/nueva-coleccion" },
          ].map((cat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              key={cat.title}
              className="group cursor-pointer relative aspect-[4/5] rounded-2xl overflow-hidden"
              onClick={() => navigate(cat.path)}
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30 mb-2">{cat.count}</p>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">{cat.title}</h3>
                <div className="mt-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/50 border-b border-white/20 pb-1">Explorar →</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/20 mb-8"
          >
            Nuestra filosofía
          </motion.p>
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight text-white/70"
          >
            "Vestir es una forma de expresar quién sos"
          </motion.blockquote>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-8"
          >
            <div className="h-px w-8 bg-white/10" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/20">Desde 2019</p>
            <div className="h-px w-8 bg-white/10" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10"
          >
            <button
              onClick={() => navigate("/catalog")}
              className="px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white/60 text-[10px] font-medium tracking-[0.2em] uppercase hover:bg-white/10 hover:text-white/80 transition-all duration-500"
            >
              Ver colección
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/20 mb-4"
          >
            Comunidad
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-6xl md:text-8xl font-bold tracking-tight leading-[0.9]"
          >
            <span className="gradient-text">Lo que</span><br />
            <span className="text-white/30">dicen</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={`h-3 w-3 ${s < t.rating ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                ))}
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-5">"{t.text}"</p>
              <p className="text-xs font-semibold text-white/60">{t.name}</p>
              <p className="text-[10px] text-white/20 mt-0.5">{t.location}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/20 mb-4"
          >
            Newsletter
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[0.95]"
          >
            <span className="text-white/60">10%</span><br />
            <span className="gradient-text">OFF</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs text-white/30 mt-4 tracking-wider"
          >
            En tu primera compra
          </motion.p>

          {!subscribed ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
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
                } catch {
                  setSubError("Ocurrió un error. Intentá de nuevo.")
                } finally {
                  setSubLoading(false)
                }
              }}
              className="mt-10 flex gap-2"
            >
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubError("") }}
                required
                className="flex-1 bg-white/5 border-white/10 text-white/60 placeholder:text-white/20 text-xs rounded-full px-5 focus-visible:ring-white/20 focus-visible:border-white/20"
              />
              <Button
                type="submit"
                disabled={subLoading}
                className="px-6 rounded-full bg-white/10 border border-white/10 text-white/60 text-[10px] font-medium tracking-wider uppercase hover:bg-white/20 hover:text-white/80 transition-all duration-500 disabled:opacity-30"
              >
                {subLoading ? "..." : "Suscribirme"}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10"
            >
              <p className="text-sm text-white/60">✓ Suscripto. Pronto recibirás tu código.</p>
            </motion.div>
          )}
          {subError && (
            <p className="text-[10px] text-rose-400/80 mt-3">{subError}</p>
          )}
        </div>
      </section>

      {/* Footer — MASSIVE BRAND NAME */}
      <footer className="relative overflow-hidden pt-20 pb-8" style={{ background: "var(--color-background)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="font-display text-6xl md:text-8xl font-bold tracking-tight text-white/10">
              GLAMOURS
            </h3>
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/20 mt-4">
              Moda Unisex · Desde 2019
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-12">
            <a href="https://www.instagram.com/glamoursok/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white/30 hover:text-white/60 transition-colors">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://wa.me/5491122618116" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white/30 hover:text-white/60 transition-colors">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          </div>

          <div className="border-t border-white/5 pt-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/20 mb-3">Tienda</p>
              <button onClick={() => navigate("/catalog")} className="block text-xs text-white/30 hover:text-white/60 transition-colors mx-auto">Catálogo</button>
              <button onClick={() => navigate("/outlet")} className="block text-xs text-white/30 hover:text-white/60 transition-colors mx-auto mt-1.5">Outlet</button>
              <button onClick={() => navigate("/nueva-coleccion")} className="block text-xs text-white/30 hover:text-white/60 transition-colors mx-auto mt-1.5">Nueva Colección</button>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/20 mb-3">Ayuda</p>
              <p className="text-xs text-white/30">Envíos</p>
              <p className="text-xs text-white/30 mt-1.5">Cambios</p>
              <p className="text-xs text-white/30 mt-1.5">Preguntas</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/20 mb-3">Contacto</p>
              <p className="text-xs text-white/30">@glamoursok</p>
              <p className="text-xs text-white/30 mt-1.5">+54 9 11 2261-8116</p>
              <p className="text-xs text-white/30 mt-1.5">Italia 1037, Luján</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/20 mb-3">Horarios</p>
              <p className="text-xs text-white/30">Lun a Vie</p>
              <p className="text-[10px] text-white/20 mt-0.5">09:00–13:00 / 16:30–20:30</p>
              {!isAdmin && (
                <>
                  <p className="text-xs text-white/30 mt-1.5">Sáb</p>
                  <p className="text-[10px] text-white/20 mt-0.5">10:00–13:00 / 16:00–20:00</p>
                </>
              )}
            </div>
          </div>

          {/* Mapa */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative rounded-xl overflow-hidden border border-white/5">
              <iframe
                src="https://www.google.com/maps?q=Italia+1037+Luján+Buenos+Aires+Argentina&output=embed"
                className="w-full h-[160px] grayscale opacity-60"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación GLAMOURS"
              />
            </div>
          </div>

          <div className="text-center pt-4 border-t border-white/5">
            <p className="text-[10px] text-white/20 tracking-wider">© 2026 GLAMOURS · Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
