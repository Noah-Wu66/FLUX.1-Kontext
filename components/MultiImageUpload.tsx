'use client'

import React, { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react'
import { Button } from './ui/Button'
import { formatFileSize, isValidImageFile } from '@/lib/utils'

interface MultiImageUploadProps {
  onImagesChange: (urls: string[]) => void
  currentImageUrls?: string[]
  disabled?: boolean
  maxImages?: number
}

export function MultiImageUpload({
  onImagesChange,
  currentImageUrls = [],
  disabled = false,
  maxImages = 4
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>('')

  const handleUpload = useCallback(async (files: FileList) => {
    const validFiles: File[] = []
    const errors: string[] = []

    // 检查文件数量限制
    if (currentImageUrls.length + files.length > maxImages) {
      setError(`最多只能上传 ${maxImages} 张图片`)
      return
    }

    // 验证每个文件
    Array.from(files).forEach((file, index) => {
      if (!isValidImageFile(file)) {
        errors.push(`文件 ${index + 1}: 请上传 JPEG、PNG 或 WebP 格式的图片`)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        errors.push(`文件 ${index + 1}: 文件大小不能超过 10MB`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setError(errors.join('; '))
      return
    }

    if (validFiles.length === 0) {
      return
    }

    setError('')
    setUploading(true)

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || '上传失败')
        }
        return result.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newUrls = [...currentImageUrls, ...uploadedUrls]
      onImagesChange(newUrls)
    } catch (error) {
      console.error('上传错误:', error)
      setError('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }, [currentImageUrls, maxImages, onImagesChange])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleUpload(files)
    }
  }, [handleUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleUpload(files)
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

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const newUrls = currentImageUrls.filter((_, index) => index !== indexToRemove)
    onImagesChange(newUrls)
  }, [currentImageUrls, onImagesChange])

  const canAddMore = currentImageUrls.length < maxImages

  return (
    <div className="w-full space-y-4">
      {/* 已上传的图片展示 */}
      {currentImageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {currentImageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square">
                <img
                  src={url}
                  alt={`上传的图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* 桌面端悬浮按钮 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 items-center justify-center hidden sm:flex">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {/* 移动端固定按钮 */}
                <div className="absolute top-1 right-1 sm:hidden">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled}
                    className="p-1 bg-white bg-opacity-90 hover:bg-opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {canAddMore && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors duration-200 min-h-[100px] sm:min-h-[120px]
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
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center h-full">
            {uploading ? (
              <>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-2 sm:mb-4" />
                <p className="text-xs sm:text-sm text-gray-600">上传中...</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-full mb-2 sm:mb-4">
                  {currentImageUrls.length > 0 ? (
                    <Plus className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                  ) : (
                    <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                  {currentImageUrls.length > 0
                    ? `添加更多图片 (${currentImageUrls.length}/${maxImages})`
                    : <><span className="hidden sm:inline">拖拽图片到此处或</span>点击上传</>
                  }
                </p>
                <p className="text-xs text-gray-500">
                  支持 JPEG、PNG、WebP 格式，最大 10MB，最多 {maxImages} 张
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {currentImageUrls.length >= maxImages && (
        <p className="text-sm text-gray-500 text-center">
          已达到最大图片数量限制 ({maxImages} 张)
        </p>
      )}
    </div>
  )
}
