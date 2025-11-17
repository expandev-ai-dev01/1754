import { z } from 'zod';
import { createProductSchema, listProductsSchema, updateProductSchema } from './productValidation';

export type ProductCreateRequest = z.infer<typeof createProductSchema>['body'];
export type ProductListRequest = z.infer<typeof listProductsSchema>['query'];
export type ProductUpdateRequest = z.infer<typeof updateProductSchema>['body'];

export interface Product {
  idProduct: number;
  sku: string;
  name: string;
  description: string | null;
  minimumStockLevel: number;
  status: number; // 0: Inactive, 1: Active
  currentQuantity: number;
}

export interface ProductListItem extends Product {
  lowStockWarning: boolean;
}

export interface ProductListResponse {
  products: ProductListItem[];
  totalRecords: number;
}
