// 材質マスタ: 商品データの材質表記 → 耐薬品性の判定表の素材名・耐熱温度
//
// 耐薬品性: chemical-resistance.json（くればぁ社の判定確認シート v0 から生成。
//   resource/import_chemical_table.py で再生成する）
// 耐熱温度: material-properties.ts（日本クレバー「メッシュクロスの基礎知識」）。
//   金属の耐熱温度は未収録（耐熱の表を受け取ったらここに足す）
//
// 対応づけは一義的に決まるものだけを収録する。「SUS」（鋼種不明）・「テフロン」
// （PTFE か ETFE か不明）・ブランド名のネットは収録しない。収録しない材質は
// 「同じ材質どうし」でしか類似品にならない（誤った代替を出さないため）。

import chemicalTable from './chemical-resistance.json'
import { MATERIAL_PROPERTIES, type ChemicalGrade } from './material-properties'

export type ChemicalEntry = {
  id: number
  category: string
  name: string
  condition: string | null
  alias: string | null
  grades: Record<string, ChemicalGrade>
}

export const CHEMICALS: ChemicalEntry[] = chemicalTable.chemicals as ChemicalEntry[]
export const CHEMICAL_TABLE_SOURCE: string = chemicalTable.source

/** NFKC 正規化した材質表記 → 判定表の素材名 */
const TABLE_MATERIAL: Record<string, string> = {
  'ナイロン': 'ナイロンメッシュ',
  'PET': 'ポリエステルメッシュ',
  'PP': 'ポリプロピレンメッシュ',
  'PE': 'ポリエチレンメッシュ',
  'PTFE': 'PTFEメッシュ',
  'ETFE': 'ETFEメッシュ',
  'PEEK': 'PEEKメッシュ',
  'PPS': 'PPSメッシュ',
  'サランネット': 'サランネット（PVDC）',
  'サランネット濾過布': 'サランネット（PVDC）',
  'サラン濾過布': 'サランネット（PVDC）',
  'SUS304': 'SUS304メッシュ',
  'SUS304平織': 'SUS304メッシュ',
  'SUS316': 'SUS316メッシュ',
  'SUS316L': 'SUS316メッシュ',
  'SUS316畳織': 'SUS316メッシュ',
  'SUS430': 'SUS430メッシュ',
  '銅': '銅メッシュ',
  '真鍮': '真鍮メッシュ',
  'チタン': 'チタンメッシュ',
  'ハステロイ': 'ハステロイメッシュ',
  'アルミ': 'アルミメッシュ',
  'トリカルネット': 'トリカルネット',
}

export function normalizeMaterial(zaishitsu: string | undefined | null): string {
  return (zaishitsu ?? '').normalize('NFKC').replace(/[\s　]/g, '')
}

export type MaterialInfo = {
  /** 同じ材質かどうかの判定キー（判定表の素材名。対応が無ければ正規化した表記） */
  key: string
  /** 判定表の素材名（対応が無ければ undefined） */
  tableName?: string
  heatMaxC?: number
}

export function getMaterialInfo(zaishitsu: string | undefined | null): MaterialInfo {
  const norm = normalizeMaterial(zaishitsu)
  const tableName = TABLE_MATERIAL[norm]
  const heatMaxC = zaishitsu ? MATERIAL_PROPERTIES[zaishitsu.trim()]?.heatMaxC : undefined
  return { key: tableName ?? norm, tableName, heatMaxC }
}

export function getChemicalGrade(tableName: string | undefined, chemicalId: number): ChemicalGrade | undefined {
  if (!tableName) return undefined
  return CHEMICALS.find((c) => c.id === chemicalId)?.grades[tableName]
}
