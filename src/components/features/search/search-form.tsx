'use client'

import { useState } from 'react'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import type { SearchFilter } from '@/lib/types'

export interface SearchFormProps {
  onSearch: (filters: SearchFilter) => void
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [zaishitsu, setZaishitsu] = useState('')
  const [meopenMin, setMeopenMin] = useState('')
  const [meopenMax, setMeopenMax] = useState('')
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
    onSearch({})
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const nev = e.nativeEvent ?? e
    if ((nev as KeyboardEvent).isComposing || e.keyCode === 229) return
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <Card title="検索条件">
      <div className="space-y-5" onKeyDown={handleKeyDown}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="材質"
            type="text"
            placeholder="例: ナイロン、PE"
            value={zaishitsu}
            onChange={(e) => setZaishitsu(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              label="目開き(μm) 最小"
              type="number"
              placeholder="最小"
              value={meopenMin}
              onChange={(e) => setMeopenMin(e.target.value)}
            />
            <Input
              label="目開き(μm) 最大"
              type="number"
              placeholder="最大"
              value={meopenMax}
              onChange={(e) => setMeopenMax(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              label="メッシュ数 最小"
              type="number"
              placeholder="最小"
              value={meshCountMin}
              onChange={(e) => setMeshCountMin(e.target.value)}
            />
            <Input
              label="メッシュ数 最大"
              type="number"
              placeholder="最大"
              value={meshCountMax}
              onChange={(e) => setMeshCountMax(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              label="線径(μm) 最小"
              type="number"
              placeholder="最小"
              value={senkeiMin}
              onChange={(e) => setSenkeiMin(e.target.value)}
            />
            <Input
              label="線径(μm) 最大"
              type="number"
              placeholder="最大"
              value={senkeiMax}
              onChange={(e) => setSenkeiMax(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              label="開口率(%) 最小"
              type="number"
              placeholder="最小"
              value={kaikouritsuMin}
              onChange={(e) => setKaikouritsuMin(e.target.value)}
            />
            <Input
              label="開口率(%) 最大"
              type="number"
              placeholder="最大"
              value={kaikouritsuMax}
              onChange={(e) => setKaikouritsuMax(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Input
              label="幅(mm) 最小"
              type="number"
              placeholder="最小"
              value={habaMin}
              onChange={(e) => setHabaMin(e.target.value)}
            />
            <Input
              label="幅(mm) 最大"
              type="number"
              placeholder="最大"
              value={habaMax}
              onChange={(e) => setHabaMax(e.target.value)}
            />
          </div>
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
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <Input
            label="フリーワード"
            type="text"
            placeholder="品番・材質・カラーを横断検索"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="primary" size="md" onClick={handleSearch} className="flex-1">
            検索
          </Button>
          <Button variant="secondary" size="md" onClick={handleClear}>
            クリア
          </Button>
        </div>
      </div>
    </Card>
  )
}
