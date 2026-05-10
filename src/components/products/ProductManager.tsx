import { useState } from "react"
import { useProducts, useDeleteProduct } from "@/hooks/useProducts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "./ProductForm"
import { getTotalStock } from "@/lib/utils"
import { Edit3, Trash2, Search, Plus, Package, X, AlertTriangle } from "lucide-react"

export function ProductManager() {
  const { data: products = [], isLoading } = useProducts()
  const deleteProduct = useDeleteProduct()
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalStock = (p: Parameters<typeof getTotalStock>[0]) => getTotalStock(p)

  if (creating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setCreating(false)}>
            <X className="h-4 w-4" /> Volver
          </Button>
          <h3 className="font-display text-lg font-bold">Nuevo Producto</h3>
        </div>
        <ProductForm onComplete={() => setCreating(false)} />
      </div>
    )
  }

  if (editing) {
    const product = products.find(p => p.id === editing)
    if (!product) { setEditing(null); return null }
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setEditing(null)}>
            <X className="h-4 w-4" /> Volver
          </Button>
          <h3 className="font-display text-lg font-bold">Editando: {product.name}</h3>
        </div>
        <ProductForm product={product} onComplete={() => setEditing(null)} />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle>Gestión de Productos ({products.length})</CardTitle>
          </div>
          <Button size="sm" onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay productos</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-primary/5 hover:border-primary/20 transition-all group">
                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" onError={e => (e.currentTarget.src = "https://placehold.co/200x200/1a1a30/8888a8?text=N/A")} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand} · {p.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium">${p.price.toLocaleString("es-AR")}</span>
                    <Badge variant={p.status === "active" ? "success" : p.status === "draft" ? "warning" : "outline"}>{p.status}</Badge>
                    <span className="text-xs text-muted-foreground">Stock: {totalStock(p)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(p.id)}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  {confirmDelete === p.id ? (
                    <div className="flex items-center gap-1">
                      <Button variant="destructive" size="sm" onClick={() => { deleteProduct.mutate(p.id); setConfirmDelete(null) }}>
                        <AlertTriangle className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
