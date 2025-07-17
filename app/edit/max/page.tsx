'use client'

import React, { useState } from 'react'
import { Image } from 'lucide-react'
import { GenerationForm } from '@/components/GenerationForm'
import { ImageGallery } from '@/components/ImageGallery'
import { useToast } from '@/components/ui/Toast'
import type { GenerationRequest, GeneratedImage } from '@/lib/types'

export default function MaxEditPage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentSeed, setCurrentSeed] = useState<number>()
  const [currentModel, setCurrentModel] = useState<string>('max')
  const { addToast, ToastContainer, success, error: showError } = useToast()

  const handleGenerate = async (request: GenerationRequest) => {
    setLoading(true)
    setCurrentPrompt(request.prompt)
    setCurrentSeed(request.seed)
    setCurrentModel(request.model)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          model: 'max' // 强制使用 max 模型
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setImages(result.data.images)
        setCurrentSeed(result.data.seed)
        success('生成成功', `已生成 ${result.data.images.length} 张图片`)
      } else {
        showError('生成失败', result.error || '请重试')
        setImages([])
      }
    } catch (error) {
      console.error('生成错误:', error)
      showError('网络错误', '请检查连接后重试')
      setImages([])
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen">
      {/* 页面标题 */}
      <div className="text-center mb-8 pc:mb-12">
        <div className="flex items-center justify-center mb-4 pc:mb-6">
          <Image className="w-6 h-6 pc:w-8 pc:h-8 text-primary-600 mr-2" />
          <h2 className="text-2xl pc:text-3xl lg:text-4xl font-bold text-gray-900">FLUX.1 Kontext Max 图片编辑</h2>
        </div>
        <p className="text-base pc:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          使用最强大的 FLUX.1 Kontext Max 模型进行图片编辑，
          上传参考图片并添加提示词，创造令人惊艳的变化。
        </p>
      </div>

      {/* 隐私安全警告 */}
      <div className="mb-6 pc:mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 pc:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 pc:w-6 pc:h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3 pc:ml-4">
              <h3 className="text-sm pc:text-base font-medium text-blue-800">隐私保护提醒</h3>
              <div className="mt-1 text-sm pc:text-base text-blue-700">
                <p>为保证您的隐私及数据安全，已强制开启Sync Mode，结果直接返回终端，生成结果不记入上游API请求历史。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要布局 - 移动端单列，PC端双列 */}
      <div className="main-layout-grid">
        {/* 生成表单 */}
        <div className="order-1">
          <GenerationForm
            onGenerate={handleGenerate}
            loading={loading}
          />
        </div>

        {/* 图片展示 */}
        <div className="order-2">
          <ImageGallery
            images={images}
            prompt={currentPrompt}
            seed={currentSeed}
            model={currentModel}
            loading={loading}
          />
        </div>
      </div>



      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  )
}
