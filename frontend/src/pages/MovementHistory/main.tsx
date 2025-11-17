import { useStockMovements } from '@/domain/stock/hooks/useStockMovements';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/core/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/table';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { format } from 'date-fns';

const MovementHistoryPage = () => {
  const { data, isLoading, error } = useStockMovements();

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <p className="text-red-500">Falha ao carregar histórico.</p>;
    if (!data || data.data.length === 0) return <p>Nenhuma movimentação encontrada.</p>;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Quantidade</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Usuário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{format(new Date(movement.movementDate), 'dd/MM/yyyy HH:mm')}</TableCell>
              <TableCell>
                {movement.product.name} ({movement.product.sku})
              </TableCell>
              <TableCell>{movement.movementType}</TableCell>
              <TableCell className="text-center">{movement.quantity}</TableCell>
              <TableCell>{movement.reason || '-'}</TableCell>
              <TableCell>{movement.user.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
        <CardDescription>Consulte todas as entradas, saídas e ajustes de estoque.</CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default MovementHistoryPage;
