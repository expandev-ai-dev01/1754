import { authenticatedClient } from '@/core/lib/api';
import type { StockMovement, StockMovementCreateDTO, StockMovementListParams } from '../types';

/**
 * @service stockMovementService
 * @summary Manages API calls for stock movements.
 */
export const stockMovementService = {
  async list(
    params: StockMovementListParams = {}
  ): Promise<{ data: StockMovement[]; total: number }> {
    const response = await authenticatedClient.get('/stock-movement/history', { params });
    return response.data.data;
  },

  async create(data: StockMovementCreateDTO): Promise<void> {
    await authenticatedClient.post('/stock-movement', data);
  },
};
