'use client'

import { useState } from 'react'
import Select from '@/components/ui/select'
import Input from '@/components/ui/input'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import ProductTypeSelector from './product-type-selector'
import { SearchFilter, ProductType, InventoryStatus } from '@/lib/types'

export interface SearchFormProps {
  onSearch: (filters: SearchFilter) => void
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [productType, setProductType] = useState<ProductType | 'all'>('all')
  const [productCode, setProductCode] = useState('')
  const [commonKey, setCommonKey] = useState('')
  const [material, setMaterial] = useState('')
  const [meshSizeMin, setMeshSizeMin] = useState('')
  const [meshSizeMax, setMeshSizeMax] = useState('')
  const [meshCount, setMeshCount] = useState('')
  const [widthMin, setWidthMin] = useState('')
  const [widthMax, setWidthMax] = useState('')
  const [color, setColor] = useState('')
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus | 'all'>('all')

  const inventoryStatusOptions = [
    { value: 'all', label: '全て' },
    { value: 'IN_STOCK', label: '在庫あり' },
    { value: 'DELIVERY_INQUIRY', label: '納期回答' },
    { value: 'EXCESS', label: '余剰在庫' },
  ]

  const handleSearch = () => {
    const filters: SearchFilter = {}

    if (productType !== 'all') filters.productType = productType as ProductType
    if (productCode) filters.productCode = productCode
    if (commonKey) filters.commonKey = commonKey
    if (material && productType === 'mesh') filters.material = material
    if ((meshSizeMin || meshSizeMax) && productType === 'mesh') {
      filters.meshSize = {}
      if (meshSizeMin) filters.meshSize.min = parseFloat(meshSizeMin)
      if (meshSizeMax) filters.meshSize.max = parseFloat(meshSizeMax)
    }
    if (meshCount && productType === 'mesh') filters.meshCount = meshCount
    if (widthMin || widthMax) {
      filters.width = {}
      if (widthMin) filters.width.min = parseFloat(widthMin)
      if (widthMax) filters.width.max = parseFloat(widthMax)
    }
    if (color && (productType === 'netoron' || productType === 'trikaru' || productType === 'all')) {
      filters.color = color
    }
    if (inventoryStatus !== 'all') filters.inventoryStatus = inventoryStatus as InventoryStatus

    onSearch(filters)
  }

  const handleClear = () => {
    setProductType('all')
    setProductCode('')
    setCommonKey('')
    setMaterial('')
    setMeshSizeMin('')
    setMeshSizeMax('')
    setMeshCount('')
    setWidthMin('')
    setWidthMax('')
    setColor('')
    setInventoryStatus('all')
  }

  const showMeshFields = productType === 'mesh' || productType === 'all'
  const showColorField = productType === 'netoron' || productType === 'trikaru' || productType === 'all'

  return (
    <Card title="検索条件">
      <div className="space-y-5">
        <ProductTypeSelector value={productType} onChange={setProductType} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="品番" type="text" placeholder="部分一致" value={productCode} onChange={(e) => setProductCode(e.target.value)} />
          <Input label="共通キー" type="text" value={commonKey} onChange={(e) => setCommonKey(e.target.value)} />
          {showMeshFields && (
            <Input label="材質" type="text" value={material} onChange={(e) => setMaterial(e.target.value)} />
          )}
          {showMeshFields && (
            <div className="flex gap-2">
              <Input label="目開き(μ) 最小" type="number" placeholder="最小" value={meshSizeMin} onChange={(e) => setMeshSizeMin(e.target.value)} />
              <Input label="目開き(μ) 最大" type="number" placeholder="最大" value={meshSizeMax} onChange={(e) => setMeshSizeMax(e.target.value)} />
            </div>
          )}
          {showMeshFields && (
            <Input label="メッシュor線径" type="text" value={meshCount} onChange={(e) => setMeshCount(e.target.value)} />
          )}
          <div className="flex gap-2">
            <Input label="幅(mm) 最小" type="number" placeholder="最小" value={widthMin} onChange={(e) => setWidthMin(e.target.value)} />
            <Input label="幅(mm) 最大" type="number" placeholder="最大" value={widthMax} onChange={(e) => setWidthMax(e.target.value)} />
          </div>
          {showColorField && (
            <Input label="カラー" type="text" value={color} onChange={(e) => setColor(e.target.value)} />
          )}
          <Select label="在庫ステータス" options={inventoryStatusOptions} value={inventoryStatus} onChange={(e) => setInventoryStatus(e.target.value as InventoryStatus | 'all')} />
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
