'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

export interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  className?: string
}

export default function FileUpload({ onFileSelect, accept = '.csv', className = '' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.csv')) {
        onFileSelect(file)
      }
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`
        group relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragging
          ? 'border-indigo-400 bg-indigo-50/50'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }
        ${className}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      <div className={`
        w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors duration-200
        ${isDragging ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-slate-200'}
      `}>
        <svg
          className={`w-5 h-5 transition-colors duration-200 ${isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <p className="text-sm">
        <span className="font-medium text-indigo-600">ファイルを選択</span>
        <span className="text-slate-500"> またはドラッグ&ドロップ</span>
      </p>
      <p className="mt-1 text-xs text-slate-400">CSV形式のみ対応</p>
    </div>
  )
}
