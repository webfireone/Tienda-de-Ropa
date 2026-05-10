import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { SIZES } from "@/types"
import type { Product } from "@/types"

interface InventoryTableProps {
  product: Product
  onUpdate: (product: Product) => void
}

export function InventoryTable({ product, onUpdate }: InventoryTableProps) {
  const { isAdmin } = useAuth()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Talla</TableHead>
          <TableHead>Stock</TableHead>
          {isAdmin && <TableHead>Actualizar</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {SIZES.map(size => (
          <TableRow key={size}>
            <TableCell className="font-medium">{size}</TableCell>
            <TableCell>{product.sizes[size] ?? 0}</TableCell>
            {isAdmin && (
              <TableCell>
                <Input
                  type="number"
                  className="w-24 h-8"
                  min={0}
                  value={product.sizes[size] ?? 0}
                  onChange={(e) => {
                    const qty = Math.max(0, parseInt(e.target.value) || 0)
                    onUpdate({
                      ...product,
                      sizes: { ...product.sizes, [size]: qty },
                    })
                  }}
                />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
