import { z } from 'zod';
import { createStockMovementSchema, listStockMovementsSchema } from './stockMovementValidation';

export type StockMovementCreateRequest = z.infer<typeof createStockMovementSchema>['body'];
export type StockMovementListRequest = z.infer<typeof listStockMovementsSchema>['query'];

export interface StockMovement {
  idStockMovement: number;
  productName: string;
  productSku: string;
  movementType: number; // 1: ENTRADA, 2: SAIDA
  quantity: number;
  reason: string | null;
  userName: string;
  movementDate: Date;
}

export interface StockMovementListResponse {
  movements: StockMovement[];
  totalRecords: number;
}
