import { z } from 'zod'
import { ProductTypeSchema, InventoryStatusSchema } from './product'

export const SearchFilterSchema = z.object({
  productType: ProductTypeSchema.optional(),
  productCode: z.string().optional(),
  commonKey: z.string().optional(),
  material: z.string().optional(),
  meshSize: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
  }).optional(),
  meshCount: z.string().optional(),
  width: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
  }).optional(),
  color: z.string().optional(),
  inventoryStatus: InventoryStatusSchema.optional(),
  minStock: z.number().min(0).optional(),
  location: z.string().optional(),
  shelfLevel: z.string().optional(),
})

export const SortSchema = z.object({
  field: z.enum(['productCode', 'width', 'stockQuantity', 'purchasePrice', 'meshSize']),
  order: z.enum(['asc', 'desc']),
})

export type SearchFilterSchemaType = z.infer<typeof SearchFilterSchema>
export type SortSchemaType = z.infer<typeof SortSchema>
