'use client'

import { useState } from 'react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import RangeField from '@/components/ui/range-field'
import type { SearchFilter } from '@/lib/types'
import { STOCK_STATUS_LABEL, type StockStatus } from '@/lib/constants/stock-status'
import { MATERIAL_PROPERTIES_SOURCE_LABEL, MATERIAL_PROPERTIES_SOURCE_URL } from '@/lib/constants/material-properties'

export interface SearchFormProps {
  onSearch: (filters: SearchFilter) => void
  /** Prefill values (e.g. from URL params) */
  initialFilters?: SearchFilter
  /** Suggestions for the 材質 field */
  materialOptions?: string[]
}

export default function SearchForm({ onSearch, initialFilters, materialOptions = [] }: SearchFormProps) {
  const init = initialFilters ?? {}
  const numStr = (v: number | undefined) => (v != null ? String(v) : '')

  const [zaishitsu, setZaishitsu] = useState(init.zaishitsu ?? '')
  const [meopenMin, setMeopenMin] = useState(numStr(init.meopen_um_min))
  const [meopenMax, setMeopenMax] = useState(numStr(init.meopen_um_max))
  const [meshCountMin, setMeshCountMin] = useState('')
  const [meshCountMax, setMeshCountMax] = useState('')
  const [senkeiMin, setSenkeiMin] = useState('')
  const [senkeiMax, setSenkeiMax] = useState('')
  const [kaikouritsuMin, setKaikouritsuMin] = useState('')
  const [kaikouritsuMax, setKaikouritsuMax] = useState('')
  const [habaMin, setHabaMin] = useState('')
  const [habaMax, setHabaMax] = useState('')
  const [hinban, setHinban] = useState('')
  const [ecHinban, setEcHinban] = useState('')
  const [color, setColor] = useState('')
  const [freeText, setFreeText] = useState('')
  const [stockStatus, setStockStatus] = useState<StockStatus | ''>(init.stockStatus ?? '')
  const [heatMin, setHeatMin] = useState(numStr(init.heatMaxC_min))
  const [acidOnly, setAcidOnly] = useState(init.acidResistantOnly ?? false)
  const [alkaliOnly, setAlkaliOnly] = useState(init.alkaliResistantOnly ?? false)
  const [solventOnly, setSolventOnly] = useState(init.solventResistantOnly ?? false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const advancedValues = [
    meshCountMin, meshCountMax, senkeiMin, senkeiMax,
    kaikouritsuMin, kaikouritsuMax, habaMin, habaMax,
    hinban, ecHinban, color, freeText,
  ]
  const activeAdvancedCount = advancedValues.filter((v) => v !== '').length

  const handleSearch = () => {
    const filters: SearchFilter = {}

    if (zaishitsu) filters.zaishitsu = zaishitsu
    if (meopenMin) filters.meopen_um_min = parseFloat(meopenMin)
    if (meopenMax) filters.meopen_um_max = parseFloat(meopenMax)
    if (meshCountMin) filters.mesh_count_min = parseFloat(meshCountMin)
    if (meshCountMax) filters.mesh_count_max = parseFloat(meshCountMax)
    if (senkeiMin) filters.senkei_um_min = parseFloat(senkeiMin)
    if (senkeiMax) filters.senkei_um_max = parseFloat(senkeiMax)
    if (kaikouritsuMin) filters.kaikouritsu_min = parseFloat(kaikouritsuMin)
    if (kaikouritsuMax) filters.kaikouritsu_max = parseFloat(kaikouritsuMax)
    if (habaMin) filters.zaiko_haba_mm_min = parseFloat(habaMin)
    if (habaMax) filters.zaiko_haba_mm_max = parseFloat(habaMax)
    if (hinban) filters.hinban = hinban
    if (ecHinban) filters.ec_hinban = ecHinban
    if (color) filters.color = color
    if (freeText) filters.freeText = freeText
    if (stockStatus) filters.stockStatus = stockStatus as 'in_stock' | 'direct_ship'
    if (heatMin) filters.heatMaxC_min = parseFloat(heatMin)
    if (acidOnly) filters.acidResistantOnly = true
    if (alkaliOnly) filters.alkaliResistantOnly = true
    if (solventOnly) filters.solventResistantOnly = true

    onSearch(filters)
  }

  const handleClear = () => {
    setZaishitsu('')
    setMeopenMin('')
    setMeopenMax('')
    setMeshCountMin('')
    setMeshCountMax('')
    setSenkeiMin('')
    setSenkeiMax('')
    setKaikouritsuMin('')
    setKaikouritsuMax('')
    setHabaMin('')
    setHabaMax('')
    setHinban('')
    setEcHinban('')
    setColor('')
    setFreeText('')
    setStockStatus('')
    setHeatMin('')
    setAcidOnly(false)
    setAlkaliOnly(false)
    setSolventOnly(false)
    onSearch({})
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const nev = e.nativeEvent ?? e
    if ((nev as KeyboardEvent).isComposing || e.keyCode === 229) return
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="bg-white rounded-lg border border-stone-200/80 shadow-card">
      <div className="p-5" onKeyDown={handleKeyDown}>
        {/* Primary: the two fields that answer 90% of inquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_auto] gap-4 lg:items-end">
          <div className="w-full">
            <label className="block text-xs font-medium text-stone-500 mb-1.5">
              材質 <span className="text-stone-400 font-normal">（任意）</span>
            </label>
            <input
              type="text"
              list="search-material-options"
              placeholder="例: ナイロン、PET"
              value={zaishitsu}
              onChange={(e) => setZaishitsu(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-stone-300 bg-white placeholder:text-stone-400 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500 transition-colors duration-150"
            />
            <datalist id="search-material-options">
              {materialOptions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
          <RangeField
            label="目開き"
            unit="μm"
            minValue={meopenMin}
            maxValue={meopenMax}
            onMinChange={setMeopenMin}
            onMaxChange={setMeopenMax}
            minPlaceholder="150"
            maxPlaceholder="250"
          />
          <div className="flex gap-2">
            <Button variant="primary" size="md" onClick={handleSearch} className="flex-1 lg:flex-none lg:px-8">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              検索
            </Button>
            <Button variant="secondary" size="md" onClick={handleClear}>
              クリア
            </Button>
          </div>
        </div>

        {/* Stock status + material properties: frequently used, always visible */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-start gap-x-8 gap-y-3">
          <div>
            <p className="text-xs font-medium text-stone-500 mb-1.5">在庫状況</p>
            <div className="inline-flex items-center gap-0.5 p-0.5 bg-stone-100 rounded-lg">
              {([
                ['', 'すべて'],
                ['in_stock', STOCK_STATUS_LABEL.in_stock],
                ['direct_ship', '直送品'],
              ] as const).map(([value, label]) => (
                <button
                  key={value || 'all'}
                  type="button"
                  onClick={() => setStockStatus(value)}
                  className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${
                    stockStatus === value
                      ? 'bg-white shadow-card text-stone-900'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-stone-500 mb-1.5">
              素材特性
              <a
                href={MATERIAL_PROPERTIES_SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1.5 font-normal text-stone-400 hover:text-stone-600 underline underline-offset-2"
              >
                出典: {MATERIAL_PROPERTIES_SOURCE_LABEL}
              </a>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  placeholder="例: 150"
                  value={heatMin}
                  onChange={(e) => setHeatMin(e.target.value)}
                  className="w-28 h-8 pl-3 pr-8 text-xs rounded-lg border border-stone-300 bg-white placeholder:text-stone-400 hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500 transition-colors duration-150"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] text-stone-400">
                  ℃以上
                </span>
              </div>
              {([
                [acidOnly, setAcidOnly, '耐酸性◎'],
                [alkaliOnly, setAlkaliOnly, '耐アルカリ性◎'],
                [solventOnly, setSolventOnly, '耐溶剤性◎'],
              ] as const).map(([checked, setChecked, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setChecked(!checked)}
                  className={`h-8 px-3 rounded-md text-xs font-medium ring-1 ring-inset transition-colors ${
                    checked
                      ? 'bg-stone-900 text-white ring-stone-900'
                      : 'bg-white text-stone-600 ring-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-stone-400">
              特性データはナイロン・PET・PP・PE・PEEK・ETFE・サランネットのみ収録
            </p>
          </div>
        </div>

        {/* Advanced filters (progressive disclosure) */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${advancedOpen ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            詳細条件
            {!advancedOpen && activeAdvancedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-stone-900 text-white text-[10px] font-semibold rounded-full leading-none">
                {activeAdvancedCount}
              </span>
            )}
          </button>

          {advancedOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
              <RangeField
                label="メッシュ数"
                minValue={meshCountMin}
                maxValue={meshCountMax}
                onMinChange={setMeshCountMin}
                onMaxChange={setMeshCountMax}
              />
              <RangeField
                label="線径"
                unit="μm"
                minValue={senkeiMin}
                maxValue={senkeiMax}
                onMinChange={setSenkeiMin}
                onMaxChange={setSenkeiMax}
              />
              <RangeField
                label="開口率"
                unit="%"
                minValue={kaikouritsuMin}
                maxValue={kaikouritsuMax}
                onMinChange={setKaikouritsuMin}
                onMaxChange={setKaikouritsuMax}
              />
              <RangeField
                label="幅"
                unit="mm"
                minValue={habaMin}
                maxValue={habaMax}
                onMinChange={setHabaMin}
                onMaxChange={setHabaMax}
              />
              <Input
                label="品番"
                type="text"
                placeholder="部分一致"
                value={hinban}
                onChange={(e) => setHinban(e.target.value)}
              />
              <Input
                label="EC品番"
                type="text"
                placeholder="部分一致"
                value={ecHinban}
                onChange={(e) => setEcHinban(e.target.value)}
              />
              <Input
                label="カラー"
                type="text"
                placeholder="例: 白、黒"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <div className="md:col-span-2">
                <Input
                  label="フリーワード"
                  type="text"
                  placeholder="品番・材質・カラーを横断検索"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
