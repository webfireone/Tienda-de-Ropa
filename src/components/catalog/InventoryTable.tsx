import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { SIZES } from "@/types"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"

interface InventoryTableProps {
  product: Product
  onUpdate: (product: Product) => void
}

export function InventoryTable({ product, onUpdate }: InventoryTableProps) {
  const { isAdmin } = useAuth()
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "")

  const currentColor = product.colors.find(c => c.name === selectedColor)

  const updateColorSize = (size: string, qty: number) => {
    const newColors = product.colors.map(c =>
      c.name === selectedColor ? { ...c, sizes: { ...c.sizes, [size]: qty } } : c
    )
    onUpdate({ ...product, colors: newColors })
  }

  if (product.colors.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin colores configurados.</p>
  }

  return (
    <div className="space-y-4">
      {/* Color selector */}
      <div className="flex flex-wrap gap-2">
        {product.colors.map(c => (
          <button
            key={c.name}
            onClick={() => setSelectedColor(c.name)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full transition-all",
              selectedColor === c.name
                ? "gradient-primary text-white shadow-sm"
                : "bg-muted/50 border border-primary/10 hover:border-primary/30"
            )}
          >
            {c.name} ({Object.values(c.sizes).reduce((a, b) => a + b, 0)})
          </button>
        ))}
      </div>

      {currentColor && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Talla</TableHead>
              <TableHead>Stock ({selectedColor})</TableHead>
              {isAdmin && <TableHead>Actualizar</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {SIZES.map(size => (
              <TableRow key={size}>
                <TableCell className="font-medium">{size}</TableCell>
                <TableCell>{currentColor.sizes[size] ?? 0}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <Input
                      type="number"
                      className="w-24 h-8"
                      min={0}
                      value={currentColor.sizes[size] ?? 0}
                      onChange={(e) => {
                        const qty = Math.max(0, parseInt(e.target.value) || 0)
                        updateColorSize(size, qty)
                      }}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
