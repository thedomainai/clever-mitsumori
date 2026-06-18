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
  const [hinban, setHinban] = useState('')
  const [ecHinban, setEcHinban] = useState('')
  const [color, setColor] = useState('')
  const [freeText, setFreeText] = useState('')

  const handleSearch = () => {
    const filters: SearchFilter = {}

    if (zaishitsu) filters.zaishitsu = zaishitsu
    if (meopenMin) filters.meopen_um_min = parseFloat(meopenMin)
    if (meopenMax) filters.meopen_um_max = parseFloat(meopenMax)
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
              label="目開き(μ) 最小"
              type="number"
              placeholder="最小"
              value={meopenMin}
              onChange={(e) => setMeopenMin(e.target.value)}
            />
            <Input
              label="目開き(μ) 最大"
              type="number"
              placeholder="最大"
              value={meopenMax}
              onChange={(e) => setMeopenMax(e.target.value)}
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
