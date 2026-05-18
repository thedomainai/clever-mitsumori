'use client'

import { useState } from 'react'
import Select from '@/components/ui/select'
import Button from '@/components/ui/button'
import FileUpload from '@/components/ui/file-upload'
import Card from '@/components/ui/card'
import { ProductType } from '@/lib/types'
import { parseCsv } from '@/lib/services/csv-parser'
import { saveInventory, loadInventory } from '@/lib/store'
import CsvUploadProgress from './csv-upload-progress'
import CsvUploadSuccess from './csv-upload-success'
import CsvValidationErrors from './csv-validation-errors'

export interface CsvUploadFormProps {
  onUploadSuccess: () => void
}

export default function CsvUploadForm({ onUploadSuccess }: CsvUploadFormProps) {
  const [productType, setProductType] = useState<ProductType>('mesh')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    validRows: number
    errorRows: number
    errors: Array<{ row: number; message: string }>
  } | null>(null)

  const productTypeOptions = [
    { value: 'mesh', label: 'メッシュ' },
    { value: 'netoron', label: 'ネトロン' },
    { value: 'trikaru', label: 'トリカル' },
  ]

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const result = await parseCsv(selectedFile, productType)

      if (result.success) {
        const { products, stats } = result.data

        // Merge with existing products (keep other types, replace same type)
        const existingResult = loadInventory()
        let existingProducts = existingResult.success ? existingResult.data.products : []
        existingProducts = existingProducts.filter(p => p.productType !== productType)
        const mergedProducts = [...existingProducts, ...products]

        saveInventory(mergedProducts)

        setUploadResult({
          success: true,
          validRows: stats.validRows,
          errorRows: stats.errorRows,
          errors: stats.errors,
        })

        if (products.length > 0) {
          onUploadSuccess()
        }
      } else {
        setUploadResult({
          success: false,
          validRows: 0,
          errorRows: 0,
          errors: [{ row: 0, message: result.error.message }],
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        validRows: 0,
        errorRows: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : '不明なエラーが発生しました' }],
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card title="CSVアップロード">
      <div className="space-y-4">
        <Select
          label="商品タイプ"
          options={productTypeOptions}
          value={productType}
          onChange={(e) => setProductType(e.target.value as ProductType)}
          disabled={isUploading}
        />

        <FileUpload onFileSelect={handleFileSelect} accept=".csv" />

        {selectedFile && (
          <div className="text-sm text-gray-600">
            選択されたファイル: <span className="font-medium">{selectedFile.name}</span>
          </div>
        )}

        <Button
          variant="primary"
          size="md"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          loading={isUploading}
          className="w-full"
        >
          アップロード
        </Button>

        {isUploading && <CsvUploadProgress />}

        {uploadResult && uploadResult.success && (
          <CsvUploadSuccess validRows={uploadResult.validRows} errorRows={uploadResult.errorRows} />
        )}

        {uploadResult && uploadResult.errors.length > 0 && !uploadResult.success && (
          <CsvValidationErrors errors={uploadResult.errors} />
        )}
      </div>
    </Card>
  )
}
