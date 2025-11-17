/**
 * @summary
 * Utility functions for interacting with the database.
 *
 * @module utils/database
 */
import { getPool } from '@/instances/database';
import { IRecordSet, IResult } from 'mssql';

export enum ExpectedReturn {
  Single,
  Multi,
  None,
}

/**
 * Executes a stored procedure with the given parameters.
 * @param routine The name of the stored procedure (e.g., '[schema].[spName]').
 * @param parameters An object containing the input parameters for the procedure.
 * @param expectedReturn The expected return type from the procedure.
 * @returns The result from the database operation.
 */
export async function dbRequest(
  routine: string,
  parameters: Record<string, any>,
  expectedReturn: ExpectedReturn
): Promise<any> {
  const pool = getPool();
  const request = pool.request();

  for (const key in parameters) {
    if (Object.prototype.hasOwnProperty.call(parameters, key)) {
      request.input(key, parameters[key]);
    }
  }

  const result: IResult<any> = await request.execute(routine);

  switch (expectedReturn) {
    case ExpectedReturn.Single:
      return result.recordset[0] || null;
    case ExpectedReturn.Multi:
      return result.recordsets;
    case ExpectedReturn.None:
      return;
    default:
      throw new Error('Invalid ExpectedReturn type.');
  }
}
