import { dbRequest, ExpectedReturn } from '@/utils/database';
import { IRecordSet } from 'mssql';
import {
  Product,
  ProductCreateRequest,
  ProductListRequest,
  ProductUpdateRequest,
  ProductListResponse,
} from './productTypes';

export const createProduct = async (
  params: ProductCreateRequest & { idAccount: number; idUser: number }
): Promise<{ idProduct: number }> => {
  return dbRequest('[functional].[spProductCreate]', params, ExpectedReturn.Single);
};

export const listProducts = async (
  params: ProductListRequest & { idAccount: number }
): Promise<ProductListResponse> => {
  const result = (await dbRequest(
    '[functional].[spProductList]',
    params,
    ExpectedReturn.Multi
  )) as IRecordSet<any>[];

  return {
    products: result[0],
    totalRecords: result[1][0].totalRecords,
  };
};

export const getProductById = async (params: {
  idAccount: number;
  idProduct: number;
}): Promise<Product | null> => {
  return dbRequest('[functional].[spProductGet]', params, ExpectedReturn.Single);
};

export const updateProduct = async (
  params: ProductUpdateRequest & { idAccount: number; idUser: number; idProduct: number }
): Promise<void> => {
  return dbRequest('[functional].[spProductUpdate]', params, ExpectedReturn.None);
};

export const deleteProduct = async (params: {
  idAccount: number;
  idUser: number;
  idProduct: number;
}): Promise<void> => {
  return dbRequest('[functional].[spProductDelete]', params, ExpectedReturn.None);
};
