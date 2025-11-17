import { useState } from 'react';
import { MoreHorizontal, Plus, Minus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table';
import { Badge } from '@/core/components/ui/badge'; // Assuming Badge component exists
import { Product } from '@/domain/stock/types';
import { NewMovementDialog } from '../NewMovementDialog';
import { useDeleteProduct } from '@/domain/stock/hooks/useProducts';
import { toast } from 'sonner';

interface ProductListProps {
  products: Product[];
}

export const ProductList = ({ products }: ProductListProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const deleteProductMutation = useDeleteProduct();

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? Esta ação é irreversível.')) {
      deleteProductMutation.mutate(id, {
        onSuccess: () => toast.success('Produto excluído com sucesso!'),
        onError: () => toast.error('Falha ao excluir produto.'),
      });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="text-center">Estoque Atual</TableHead>
            <TableHead className="text-center">Estoque Mínimo</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isLowStock = product.quantity <= product.minimumStockLevel;
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="text-center">{product.quantity}</TableCell>
                <TableCell className="text-center">{product.minimumStockLevel}</TableCell>
                <TableCell className="text-center">
                  {isLowStock ? (
                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                      Baixo Estoque
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      OK
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(product)}>
                    Movimentar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProductMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selectedProduct && (
        <NewMovementDialog
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
};
