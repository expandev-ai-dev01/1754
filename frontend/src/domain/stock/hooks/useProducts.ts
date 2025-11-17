import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services';
import { ProductCreateDTO, ProductListParams } from '../types';

const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (params: ProductListParams) => [...productQueryKeys.lists(), params] as const,
};

export const useProducts = (params: ProductListParams = {}) => {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => productService.list(params),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreateDTO) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
    },
  });
};
