import { z } from 'zod'

export const ProductTypeSchema = z.enum(['mesh', 'netoron', 'trikaru'])

export const InventoryStatusSchema = z.enum(['IN_STOCK', 'DELIVERY_INQUIRY', 'EXCESS'])

export const UnifiedProductSchema = z.object({
  id: z.string().uuid(),
  productType: ProductTypeSchema,
  productCode: z.string().min(1),
  commonKey: z.string().optional(),
  location: z.string().optional(),
  shelfLevel: z.string().optional(),
  material: z.string().optional(),
  meshSize: z.number().positive().optional(),
  meshCount: z.string().optional(),
  width: z.number().positive(),
  color: z.string().optional(),
  stockQuantity: z.number().min(0),
  inventoryStatus: InventoryStatusSchema,
  arrivalDate: z.string().nullable(),
  lastShipmentDate: z.string().nullable(),
  purchasePrice: z.number().positive(),
  currentPurchasePrice: z.number().positive().optional(),
  unitPrice: z.number().positive().optional(),
  purchasePricePerSqm: z.number().positive().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type UnifiedProductSchemaType = z.infer<typeof UnifiedProductSchema>
