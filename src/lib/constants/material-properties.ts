// 素材特性の参照データ（耐熱性・耐薬品性）
//
// 出典: 日本クレバー株式会社「メッシュクロスの基礎知識」
// https://www.nippon-clever.co.jp/about-mesh-cloth
//
// zaishitsu（在庫表・EC管理表の材質表記）と、出典ページの原材料名が
// 一致または一義的に対応すると判断できるものだけを収録する。
// 「ﾄﾘｶﾙﾈｯﾄ」「ﾈﾄﾛﾝﾈｯﾄ」等のブランド名は樹脂種が不明なため収録しない
// （誤った耐性情報で見積もりを誤らせるリスクを避けるため）。

export type ChemicalGrade = '◎' | '○' | '△' | '×'

export type MaterialProperties = {
  /** 出典ページ上の原材料名 */
  label: string
  /** 実用温度範囲（℃） */
  heatMinC?: number
  heatMaxC?: number
  /** 耐薬品性（幅がある場合は最も厳しい側の記号のみを保持） */
  acid: ChemicalGrade
  alkali: ChemicalGrade
  solvent: ChemicalGrade
}

export const MATERIAL_PROPERTIES_SOURCE_URL = 'https://www.nippon-clever.co.jp/about-mesh-cloth'
export const MATERIAL_PROPERTIES_SOURCE_LABEL = '日本クレバー「メッシュクロスの基礎知識」'

// zaishitsu の生値 → 特性データ
export const MATERIAL_PROPERTIES: Record<string, MaterialProperties> = {
  'ﾅｲﾛﾝ': { label: 'ナイロンメッシュ', heatMinC: -40, heatMaxC: 115, acid: '×', alkali: '◎', solvent: '○' },
  'PET': { label: 'ポリエステルメッシュ', heatMinC: -75, heatMaxC: 150, acid: '◎', alkali: '○', solvent: '◎' },
  'PP': { label: 'ポリプロピレンメッシュ', heatMinC: -30, heatMaxC: 90, acid: '◎', alkali: '◎', solvent: '◎' },
  'PE': { label: 'ポリエチレンメッシュ', heatMinC: -20, heatMaxC: 60, acid: '◎', alkali: '◎', solvent: '○' },
  'PEEK': { label: 'PEEKメッシュ', heatMinC: -60, heatMaxC: 260, acid: '◎', alkali: '◎', solvent: '◎' },
  'ETFE': { label: 'ETFEテフロンメッシュ', heatMinC: -190, heatMaxC: 150, acid: '◎', alkali: '◎', solvent: '◎' },
  'ｻﾗﾝﾈｯﾄ': { label: 'サランネット（難燃）', acid: '◎', alkali: '◎', solvent: '◎' },
  'ｻﾗﾝﾈｯﾄ濾過布': { label: 'サランネット（難燃）', acid: '◎', alkali: '◎', solvent: '◎' },
}

export function getMaterialProperties(zaishitsu: string | undefined | null): MaterialProperties | undefined {
  if (!zaishitsu) return undefined
  return MATERIAL_PROPERTIES[zaishitsu.trim()]
}

const GRADE_RANK: Record<ChemicalGrade, number> = { '◎': 4, '○': 3, '△': 2, '×': 1 }

/** grade が要求グレード以上かどうか（◎が最上位） */
export function meetsGrade(grade: ChemicalGrade, required: ChemicalGrade): boolean {
  return GRADE_RANK[grade] >= GRADE_RANK[required]
}
