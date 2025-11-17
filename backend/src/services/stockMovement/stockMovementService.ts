import { dbRequest, ExpectedReturn } from '@/utils/database';
import { IRecordSet } from 'mssql';
import {
  StockMovementCreateRequest,
  StockMovementListRequest,
  StockMovementListResponse,
} from './stockMovementTypes';

export const createStockMovement = async (
  params: StockMovementCreateRequest & { idAccount: number; idUser: number }
): Promise<void> => {
  return dbRequest('[functional].[spStockMovementCreate]', params, ExpectedReturn.None);
};

export const listStockMovements = async (
  params: StockMovementListRequest & { idAccount: number }
): Promise<StockMovementListResponse> => {
  const result = (await dbRequest(
    '[functional].[spStockMovementList]',
    params,
    ExpectedReturn.Multi
  )) as IRecordSet<any>[];

  return {
    movements: result[0],
    totalRecords: result[1][0].totalRecords,
  };
};
