'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Download, Copy, Maximize2, X } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import type { GeneratedImage } from '@/lib/types'
import { downloadImage, copyToClipboard } from '@/lib/utils'

interface ImageGalleryProps {
  images: GeneratedImage[]
  prompt: string
  seed?: number
  model?: string
  loading?: boolean
}

export function ImageGallery({ images, prompt, seed, model, loading = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [downloading, setDownloading] = useState<string>('')
  const [copying, setCopying] = useState<string>('')

  const handleDownload = async (image: GeneratedImage, index: number) => {
    setDownloading(image.url)
    try {
      const filename = `flux-kontext-${Date.now()}-${index + 1}.${image.url.includes('.png') ? 'png' : 'jpg'}`
      await downloadImage(image.url, filename)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    } finally {
      setDownloading('')
    }
  }

  const handleCopyUrl = async (url: string) => {
    setCopying(url)
    try {
      const success = await copyToClipboard(url)
      if (success) {
        alert('图片链接已复制到剪贴板')
      } else {
        alert('复制失败，请手动复制')
      }
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请重试')
    } finally {
      setCopying('')
    }
  }

  if (loading) {
    return (
      <Card title="生成中..." description="请稍候，AI 正在为您创作图片">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600">正在生成图片，请耐心等待...</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">这通常需要 10-30 秒</p>
          </div>
        </div>
      </Card>
    )
  }

  if (images.length === 0) {
    return (
      <Card title="生成结果" description="生成的图片将在这里显示">
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Maximize2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <p className="text-sm sm:text-base text-gray-600">还没有生成图片</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">填写提示词并点击生成按钮开始创作</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card
        title="生成结果"
        description={`使用 ${model?.toUpperCase() || 'FLUX.1'} 模型，基于提示词"${prompt}"生成了 ${images.length} 张图片${seed ? ` (种子: ${seed})` : ''}`}
      >
        <div className={`grid gap-3 sm:gap-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {images.map((image, index) => (
            <div key={index} className="group relative">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={image.url}
                  alt={`生成的图片 ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />

                {/* 悬浮操作按钮 - 桌面端 */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 items-center justify-center hidden sm:flex">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(image, index)}
                      loading={downloading === image.url}
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyUrl(image.url)}
                      loading={copying === image.url}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 移动端操作按钮 - 始终显示 */}
                <div className="absolute bottom-2 right-2 flex gap-1 sm:hidden">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedImage(image)}
                    className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(image, index)}
                    loading={downloading === image.url}
                    className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 图片信息 */}
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs sm:text-sm text-gray-600">{image.width} × {image.height} 像素</p>
                {/* 移动端复制按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyUrl(image.url)}
                  loading={copying === image.url}
                  className="sm:hidden p-1 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  复制
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 图片预览模态框 */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="relative w-full max-w-4xl max-h-full flex flex-col">
            {/* 关闭按钮 */}
            <div className="flex justify-end mb-2 sm:mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>

            {/* 图片容器 */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <Image
                src={selectedImage.url}
                alt="预览图片"
                width={selectedImage.width}
                height={selectedImage.height}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-center gap-2 mt-3 sm:mt-4 pb-safe">
              <Button
                variant="secondary"
                onClick={() => handleDownload(selectedImage, 0)}
                loading={downloading === selectedImage.url}
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleCopyUrl(selectedImage.url)}
                loading={copying === selectedImage.url}
                className="flex-1 sm:flex-none"
              >
                <Copy className="w-4 h-4 mr-2" />
                复制链接
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
