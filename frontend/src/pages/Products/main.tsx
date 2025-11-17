import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, History } from 'lucide-react';
import { useProducts } from '@/domain/stock/hooks/useProducts';
import { Button } from '@/core/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/core/components/ui/card';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { ProductList } from './_impl/ProductList';

const ProductsPage = () => {
  const { data, isLoading, error } = useProducts();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Estoque de Produtos</CardTitle>
            <CardDescription>Visualize e gerencie o estado atual do seu estoque.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/history">
                <History className="mr-2 h-4 w-4" />
                Histórico
              </Link>
            </Button>
            <Button asChild>
              <Link to="/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Produto
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-500">Falha ao carregar produtos.</p>}
        {data && <ProductList products={data.data} />}
      </CardContent>
    </Card>
  );
};

export default ProductsPage;
