import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSaveProduct } from "@/hooks/useProducts"
import { SIZES, CATEGORIES, SECCIONES, GENDERS, type Product } from "@/types"
import { getTotalStock } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Save, Sparkles } from "lucide-react"

interface ProductFormProps {
  product?: Product
  onComplete?: () => void
}

const emptySizes = Object.fromEntries(SIZES.map(s => [s, 0])) as Record<string, number>

const emptyProduct = {
  id: "",
  name: "",
  brand: "",
  category: "Remeras" as const,
  gender: "unisex" as const,
  price: 0,
  previousPrice: 0,
  description: "",
  imageUrl: "",
  colors: [] as { name: string; sizes: Record<string, number> }[],
  material: "",
  tags: [] as string[],
  seccion: "general" as const,
  status: "active" as const,
  createdAt: "",
  updatedAt: "",
}

export function ProductForm({ product, onComplete }: ProductFormProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Product>(() => product || { ...emptyProduct, id: crypto.randomUUID(), createdAt: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString().split("T")[0] })
  const [colorInput, setColorInput] = useState("")
  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null)
  const [tagInput, setTagInput] = useState("")
  const saveProduct = useSaveProduct()

  const update = (partial: Partial<Product>) => setForm(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString().split("T")[0] }))

  const isEdit = !!product
  const totalSteps = 3

  const canNext = {
    1: form.name && form.brand && form.price > 0 && form.imageUrl,
    2: true,
    3: true,
  }

  const addColor = () => {
    const trimmed = colorInput.trim()
    if (trimmed && !form.colors.find(c => c.name === trimmed)) {
      update({ colors: [...form.colors, { name: trimmed, sizes: { ...emptySizes } }] })
      setSelectedColorIdx(form.colors.length)
    }
    setColorInput("")
  }

  const removeColor = (idx: number) => {
    const newColors = form.colors.filter((_, i) => i !== idx)
    update({ colors: newColors })
    if (selectedColorIdx === idx) setSelectedColorIdx(null)
    else if (selectedColorIdx !== null && selectedColorIdx > idx) setSelectedColorIdx(selectedColorIdx - 1)
  }

  const updateColorSize = (colorIdx: number, size: string, qty: number) => {
    const newColors = form.colors.map((c, i) =>
      i === colorIdx ? { ...c, sizes: { ...c.sizes, [size]: qty } } : c
    )
    update({ colors: newColors })
  }

  const handleSave = () => {
    saveProduct.mutate(form, {
      onSuccess: () => onComplete?.()
    })
  }

  const steps = [
    {
      label: "Info Básica",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre *</label>
              <Input value={form.name} onChange={e => update({ name: e.target.value })} placeholder="Ej: Remera Urban Fit" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Marca *</label>
              <Input value={form.brand} onChange={e => update({ brand: e.target.value })} placeholder="Ej: Urban Fit" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categoría</label>
              <select
                value={form.category}
                onChange={e => update({ category: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Género</label>
              <select
                value={form.gender}
                onChange={e => update({ gender: e.target.value as Product["gender"] })}
                className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm"
              >
                {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Material</label>
              <Input value={form.material} onChange={e => update({ material: e.target.value })} placeholder="Ej: Algodón 100%" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio *</label>
              <Input type="number" value={form.price || ""} onChange={e => update({ price: parseInt(e.target.value) || 0 })} placeholder="25000" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio anterior</label>
              <Input type="number" value={form.previousPrice || ""} onChange={e => update({ previousPrice: parseInt(e.target.value) || 0 })} placeholder="12000" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sección</label>
              <select
                value={form.seccion}
                onChange={e => update({ seccion: e.target.value as Product["seccion"] })}
                className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm"
              >
                {SECCIONES.map(s => (
                  <option key={s} value={s}>
                    {s === "general" ? "General" : s === "outlet" ? "Outlet" : "Nueva Colección"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</label>
              <select
                value={form.status}
                onChange={e => update({ status: e.target.value as Product["status"] })}
                className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm"
              >
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => update({ description: e.target.value })}
              placeholder="Descripción del producto..."
              rows={3}
              className="flex w-full rounded-xl border border-input bg-card px-4 py-2 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">URL de Imagen *</label>
            <Input value={form.imageUrl} onChange={e => update({ imageUrl: e.target.value })} placeholder="https://..." />
            {form.imageUrl && (
              <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-primary/10">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.src = "https://placehold.co/200x200/1a1a30/8888a8?text=Error")} />
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      label: "Inventario",
      content: (
        <div className="space-y-6">
          {/* Colors */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Colores</label>
            <div className="flex gap-2">
              <Input value={colorInput} onChange={e => setColorInput(e.target.value)} placeholder="Agregar color" className="flex-1"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addColor() } }}
              />
              <Button variant="outline" size="sm" onClick={addColor}>+</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.colors.map((c, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedColorIdx(i)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all ${selectedColorIdx === i ? "gradient-primary text-white" : "bg-muted hover:bg-muted/80"}`}
                >
                  {c.name}
                  <button onClick={(e) => { e.stopPropagation(); removeColor(i) }} className="text-inherit opacity-60 hover:opacity-100">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Per-color sizes */}
          {selectedColorIdx !== null && form.colors[selectedColorIdx] && (
            <div className="p-4 rounded-xl bg-muted/30 border border-primary/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Stock para <span className="text-foreground">{form.colors[selectedColorIdx].name}</span>
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {SIZES.map(size => (
                  <div key={size} className="space-y-1">
                    <label className="text-xs text-muted-foreground block text-center">{size}</label>
                    <Input
                      type="number"
                      min={0}
                      value={form.colors[selectedColorIdx].sizes[size] ?? 0}
                      onChange={e => updateColorSize(selectedColorIdx, size, Math.max(0, parseInt(e.target.value) || 0))}
                      className="text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Agregar tag" className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => { if (tagInput && !form.tags.includes(tagInput)) { update({ tags: [...form.tags, tagInput.toLowerCase()] }); setTagInput("") } }}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs">
                    {t}
                    <button onClick={() => update({ tags: form.tags.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-foreground">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sección</label>
              <select
                value={form.seccion}
                onChange={e => update({ seccion: e.target.value as Product["seccion"] })}
                className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm"
              >
                {SECCIONES.map(s => (
                  <option key={s} value={s}>
                    {s === "general" ? "General" : s === "outlet" ? "Outlet" : "Nueva Colección"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Confirmación",
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
            <div className="flex items-start gap-6">
              {form.imageUrl && (
                <img src={form.imageUrl} alt={form.name} className="w-24 h-24 rounded-xl object-cover border border-primary/10" onError={e => (e.currentTarget.src = "https://placehold.co/200x200/1a1a30/8888a8?text=Error")} />
              )}
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold">{form.name || "Sin nombre"}</h3>
                <p className="text-sm text-muted-foreground">{form.brand} · {form.category}</p>
                <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="font-display text-lg font-bold gradient-text">${form.price.toLocaleString("es-AR")}</span>
                  {form.previousPrice > 0 && <span className="text-xs text-muted-foreground line-through">${form.previousPrice.toLocaleString("es-AR")}</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Stock total</p>
              <p className="font-display text-xl font-bold">{getTotalStock(form)} unidades</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Colores</p>
              <div className="flex flex-wrap gap-1">
                {form.colors.length > 0 ? form.colors.map((c, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-card border border-primary/10">
                    {c.name} ({Object.values(c.sizes).reduce((a, b) => a + b, 0)})
                  </span>
                )) : <span className="text-xs text-muted-foreground">-</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((t, i) => (
              <span key={i} className="text-[10px] px-2.5 py-1 rounded-full gradient-primary text-white">{t}</span>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle>{isEdit ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === i + 1 ? "gradient-primary text-white" : i + 1 < step ? "bg-emerald-900/50 text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`w-6 h-0.5 ${i + 1 < step ? "bg-emerald-500" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-fade-up" key={step}>
          <p className="text-xs text-muted-foreground mb-6">{steps[step - 1].label}</p>
          {steps[step - 1].content}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary/10">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : onComplete?.()} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> {step > 1 ? "Anterior" : "Cancelar"}
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext[step as keyof typeof canNext]} className="gap-2">
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saveProduct.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {saveProduct.isPending ? "Guardando..." : isEdit ? "Actualizar Producto" : "Crear Producto"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
