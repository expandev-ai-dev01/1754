export type ProductStatus = 'ATIVO' | 'INATIVO';
export type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  quantity: number;
  minimumStockLevel: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  product: { id: number; name: string; sku: string };
  movementType: MovementType;
  quantity: number;
  reason?: string | null;
  movementDate: string;
  user: { id: number; name: string };
}

// DTOs for API requests
export interface ProductCreateDTO {
  sku: string;
  name: string;
  description?: string;
  initialQuantity: number;
  minimumStockLevel: number;
}

export interface StockMovementCreateDTO {
  idProduct: number;
  movementType: MovementType;
  quantity: number;
  reason?: string;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface StockMovementListParams {
  page?: number;
  pageSize?: number;
  idProduct?: number;
  movementType?: MovementType;
  startDate?: string;
  endDate?: string;
}
