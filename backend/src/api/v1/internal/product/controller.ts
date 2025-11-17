import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/response';
import * as productService from '@/services/product/productService';
import {
  ProductCreateRequest,
  ProductListRequest,
  ProductUpdateRequest,
} from '@/services/product/productTypes';

// Hardcoded for now, would come from auth token in a real app
const idAccount = 1;
const idUser = 1;

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productData: ProductCreateRequest = req.body;
    const result = await productService.createProduct({
      ...productData,
      idAccount,
      idUser,
    });
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryParams = req.query as unknown as ProductListRequest;
    const result = await productService.listProducts({
      ...queryParams,
      idAccount,
    });
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await productService.getProductById({
      idAccount,
      idProduct: parseInt(id, 10),
    });
    if (!result) {
      return res.status(404).json(successResponse(null));
    }
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const productData: ProductUpdateRequest = req.body;
    await productService.updateProduct({
      ...productData,
      idAccount,
      idUser,
      idProduct: parseInt(id, 10),
    });
    res.status(200).json(successResponse({ message: 'Product updated successfully.' }));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct({
      idAccount,
      idUser,
      idProduct: parseInt(id, 10),
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
