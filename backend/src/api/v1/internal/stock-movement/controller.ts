import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/utils/response';
import * as stockMovementService from '@/services/stockMovement/stockMovementService';
import {
  StockMovementCreateRequest,
  StockMovementListRequest,
} from '@/services/stockMovement/stockMovementTypes';

// Hardcoded for now, would come from auth token in a real app
const idAccount = 1;
const idUser = 1;

export const createStockMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movementData: StockMovementCreateRequest = req.body;
    await stockMovementService.createStockMovement({
      ...movementData,
      idAccount,
      idUser,
    });
    res.status(201).json(successResponse({ message: 'Stock movement created successfully.' }));
  } catch (error) {
    next(error);
  }
};

export const listStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryParams = req.query as unknown as StockMovementListRequest;
    const result = await stockMovementService.listStockMovements({
      ...queryParams,
      idAccount,
    });
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
