/**
 * @summary
 * Reusable Zod schemas for common data types and validation rules.
 *
 * @module utils/zodValidation
 */
import { z } from 'zod';

// --- Primitive Types ---
export const zString = z.string().trim();
export const zBit = z.boolean().or(z.number().min(0).max(1));

// --- Common Business Types ---
export const zName = zString
  .min(1, 'Name is required')
  .max(100, 'Name must be 100 characters or less');
export const zDescription = zString.max(500, 'Description must be 500 characters or less');
export const zNullableDescription = zDescription.nullable();

// --- Identifiers ---
export const zId = z.coerce.number().int().positive('ID must be a positive integer');
export const zNullableId = zId.nullable();
