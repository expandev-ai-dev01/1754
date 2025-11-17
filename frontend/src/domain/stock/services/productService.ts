import { authenticatedClient } from '@/core/lib/api';
import type { Product, ProductCreateDTO, ProductListParams } from '../types';

/**
 * @service productService
 * @summary Manages API calls for products.
 */
export const productService = {
  async list(params: ProductListParams = {}): Promise<{ data: Product[]; total: number }> {
    const response = await authenticatedClient.get('/product', { params });
    return response.data.data;
  },

  async create(data: ProductCreateDTO): Promise<Product> {
    const response = await authenticatedClient.post('/product', data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await authenticatedClient.delete(`/product/${id}`);
  },
};
