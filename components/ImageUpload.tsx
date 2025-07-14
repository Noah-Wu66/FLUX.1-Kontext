'use client'

import React, { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/Button'
import { formatFileSize, isValidImageFile } from '@/lib/utils'

interface ImageUploadProps {
  onImageUpload: (url: string) => void
  onImageRemove: () => void
  currentImageUrl?: string
  disabled?: boolean
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>('')

  const handleUpload = useCallback(async (file: File) => {
    if (!isValidImageFile(file)) {
      setError('请上传 JPEG、PNG 或 WebP 格式的图片')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        onImageUpload(result.url)
      } else {
        setError(result.error || '上传失败')
      }
    } catch (error) {
      console.error('上传错误:', error)
      setError('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }, [onImageUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  if (currentImageUrl) {
    return (
      <div className="relative">
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={currentImageUrl}
            alt="上传的图片"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={onImageRemove}
              disabled={disabled}
              className="opacity-0 hover:opacity-100 transition-opacity duration-200"
            >
              <X className="w-4 h-4 mr-1" />
              移除
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400 hover:bg-gray-50 cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center">
          {uploading ? (
            <>
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-600">上传中...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                拖拽图片到此处或点击上传
              </p>
              <p className="text-xs text-gray-500">
                支持 JPEG、PNG、WebP 格式，最大 10MB
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
