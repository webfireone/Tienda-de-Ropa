import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { usePromotions, useSubscribers, useSavePromotion, useDeletePromotion } from "@/hooks/usePromotions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Megaphone, Users, Plus, Trash2, Copy, Download, Tag, Calendar, CheckCircle, XCircle } from "lucide-react"
import type { Promotion } from "@/types"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
}

export function MarketingPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<"promociones" | "suscriptores">("promociones")
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [copyMsg, setCopyMsg] = useState("")

  const { data: promotions = [], isLoading: promLoading } = usePromotions()
  const { data: subscribers = [], isLoading: subLoading } = useSubscribers()
  const savePromo = useSavePromotion()
  const deletePromo = useDeletePromotion()

  const [form, setForm] = useState({
    title: "", description: "", discountPercent: 0, promoCode: "",
    startDate: "", endDate: "", bannerImage: "", active: true,
  })

  if (!isAdmin) {
    navigate("/", { replace: true })
    return null
  }

  function resetForm() {
    setForm({ title: "", description: "", discountPercent: 0, promoCode: "", startDate: "", endDate: "", bannerImage: "", active: true })
    setEditId(null)
    setShowForm(false)
  }

  function editPromo(p: Promotion) {
    setForm({
      title: p.title, description: p.description, discountPercent: p.discountPercent,
      promoCode: p.promoCode, startDate: p.startDate, endDate: p.endDate,
      bannerImage: p.bannerImage, active: p.active,
    })
    setEditId(p.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await savePromo.mutateAsync({ ...form, id: editId || undefined })
    resetForm()
  }

  async function copyEmails() {
    const text = subscribers.map(s => s.email).join("\n")
    await navigator.clipboard.writeText(text)
    setCopyMsg(`${subscribers.length} emails copiados`)
    setTimeout(() => setCopyMsg(""), 2500)
  }

  function exportCSV() {
    const rows = [["Email", "Fecha", "Activo"]]
    subscribers.forEach(s => rows.push([s.email, s.subscribedAt, s.active ? "Sí" : "No"]))
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "suscriptores.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Megaphone className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Marketing</h1>
          <p className="text-sm text-muted-foreground">Gestioná promociones y suscriptores</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-2xl bg-muted/50 w-fit">
        <button
          onClick={() => setTab("promociones")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${tab === "promociones" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Megaphone className="h-4 w-4" />
          Promociones
        </button>
        <button
          onClick={() => setTab("suscriptores")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${tab === "suscriptores" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Users className="h-4 w-4" />
          Suscriptores
          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">{subscribers.length}</span>
        </button>
      </div>

      {tab === "promociones" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{promotions.length} promociones</p>
            <Button onClick={() => { resetForm(); setShowForm(!showForm) }} className="gap-2">
              <Plus className="h-4 w-4" />
              {showForm ? "Cancelar" : "Nueva promoción"}
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border border-border mb-6 space-y-4 animate-fade-up">
              <h3 className="font-semibold">{editId ? "Editar promoción" : "Nueva promoción"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Título</label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Hot Sale 2026" required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Descripción</label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ej: 20% off en toda la colección" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">% Descuento</label>
                  <Input type="number" min={0} max={100} value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Código promocional</label>
                  <Input value={form.promoCode} onChange={e => setForm(f => ({ ...f, promoCode: e.target.value }))} placeholder="Ej: HOTSAILE20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Inicio</label>
                  <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Fin</label>
                  <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">URL imagen de banner</label>
                  <Input value={form.bannerImage} onChange={e => setForm(f => ({ ...f, bannerImage: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm">Activa</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={savePromo.isPending}>{savePromo.isPending ? "Guardando..." : "Guardar"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              </div>
            </form>
          )}

          {/* Promotions list */}
          {promLoading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando...</div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">Sin promociones aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {promotions.map(p => (
                <div key={p.id} className="p-5 rounded-2xl bg-card border border-border flex items-start gap-4 hover:shadow-sm transition-shadow">
                  {p.bannerImage && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                      <img src={p.bannerImage} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{p.title}</h3>
                      {p.active ? (
                        <span className="text-[10px] flex items-center gap-1 text-success"><CheckCircle className="h-3 w-3" /> Activa</span>
                      ) : (
                        <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><XCircle className="h-3 w-3" /> Inactiva</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {p.discountPercent > 0 && <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {p.discountPercent}% OFF</span>}
                      {p.promoCode && <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-semibold">{p.promoCode}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(p.startDate)} → {formatDate(p.endDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => editPromo(p)} className="w-8 h-8 rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground text-xs font-medium">
                      Editar
                    </button>
                    <button onClick={() => { if (confirm("Eliminar promoción?")) deletePromo.mutate(p.id) }} className="w-8 h-8 rounded-lg hover:bg-destructive/10 transition-colors flex items-center justify-center text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "suscriptores" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{subscribers.length} suscriptores</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyEmails} className="gap-2 text-xs">
                <Copy className="h-3.5 w-3.5" />
                Copiar emails
              </Button>
              <Button variant="outline" onClick={exportCSV} className="gap-2 text-xs">
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {copyMsg && (
            <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/30 text-sm text-success flex items-center gap-2 animate-fade-up">
              <CheckCircle className="h-4 w-4" /> {copyMsg}
            </div>
          )}

          {subLoading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando...</div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">Sin suscriptores aún</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase">Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map(s => (
                      <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-foreground">{s.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(s.subscribedAt)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.source || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
