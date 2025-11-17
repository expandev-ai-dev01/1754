import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../services';
import { StockMovementCreateDTO, StockMovementListParams } from '../types';

const movementQueryKeys = {
  all: ['stockMovements'] as const,
  lists: () => [...movementQueryKeys.all, 'list'] as const,
  list: (params: StockMovementListParams) => [...movementQueryKeys.lists(), params] as const,
};

export const useStockMovements = (params: StockMovementListParams = {}) => {
  return useQuery({
    queryKey: movementQueryKeys.list(params),
    queryFn: () => stockMovementService.list(params),
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StockMovementCreateDTO) => stockMovementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Invalidate products to update quantities
      queryClient.invalidateQueries({ queryKey: movementQueryKeys.lists() });
    },
  });
};
