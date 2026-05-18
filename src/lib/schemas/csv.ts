import { z } from 'zod'

export const MeshCsvRowSchema = z.object({
  'エリア': z.string(),
  '棚段': z.string(),
  '材質': z.string(),
  '品番': z.string().min(1),
  '共通キー': z.string().optional(),
  '目開き(μ)': z.string(),
  '幅(mm)': z.string(),
  'ﾒｯｼｭor線径': z.string().optional(),
  '入荷日': z.string().optional(),
  '最終出荷': z.string().optional(),
  '残り(m)': z.string(),
  '仕入値(m)': z.string(),
  '現行仕入値(m)': z.string().optional(),
})

export const NetoronCsvRowSchema = z.object({
  '1': z.string().optional(),
  '棚段': z.string().optional(),
  '品番': z.string().min(1),
  '共通キー': z.string().optional(),
  'カラー': z.string().optional(),
  '幅(mm)': z.string(),
  '仕切り単価/m': z.string().optional(),
  '入荷日': z.string().optional(),
  '最終出荷日': z.string().optional(),
  '残り(m)': z.string(),
  '仕入値': z.string(),
})

export const TrikaruCsvRowSchema = z.object({
  '': z.string().optional(),
  '棚段': z.string().optional(),
  '品番': z.string().min(1),
  '共通キー': z.string().optional(),
  'カラー': z.string().optional(),
  '幅(mm)': z.string(),
  '仕切り単価/m': z.string().optional(),
  '入荷日': z.string().optional(),
  '最終出荷日': z.string().optional(),
  '残り(m)': z.string(),
  '仕入値(sqm)': z.string().optional(),
  '仕入値(m)': z.string(),
})

export type MeshCsvRow = z.infer<typeof MeshCsvRowSchema>
export type NetoronCsvRow = z.infer<typeof NetoronCsvRowSchema>
export type TrikaruCsvRow = z.infer<typeof TrikaruCsvRowSchema>
