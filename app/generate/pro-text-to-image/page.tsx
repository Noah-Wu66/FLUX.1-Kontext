'use client'

import React, { useState } from 'react'
import { Zap } from 'lucide-react'
import { GenerationForm } from '@/components/GenerationForm'
import { ImageGallery } from '@/components/ImageGallery'
import { useToast } from '@/components/ui/Toast'
import type { GenerationRequest, GeneratedImage } from '@/lib/types'

export default function ProTextToImagePage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentSeed, setCurrentSeed] = useState<number>()
  const [currentModel, setCurrentModel] = useState<string>('pro-text-to-image')
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
          model: 'pro-text-to-image' // 强制使用 pro-text-to-image 模型
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
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mr-2" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">FLUX.1 Kontext Pro Text-to-Image</h2>
        </div>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          使用高效的 FLUX.1 Kontext Pro 模型进行文本到图像生成，
          平衡性能与质量，适合快速创意表达。
        </p>
      </div>

      {/* 隐私安全警告 */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-2 sm:ml-3">
              <h3 className="text-sm font-medium text-blue-800">隐私保护提醒</h3>
              <div className="mt-1 text-xs sm:text-sm text-blue-700">
                <p>为保证您的隐私及数据安全，已强制开启Sync Mode，结果直接返回终端，生成结果不记入上游API请求历史。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* 左侧：生成表单 */}
        <div className="order-1 lg:col-span-2">
          <GenerationForm
            ref={generationFormRef}
            onGenerate={handleGenerate}
            loading={loading}
          />
        </div>

        {/* 右侧：预设词和图片展示 */}
        <div className="order-2 space-y-6">
          {/* 预设词 */}
          <Card title="预设提示词" description="快速添加常用创意指令">
            <PromptPresets onPresetClick={handlePresetClick} />
          </Card>

          {/* 图片展示 */}
          <ImageGallery
            images={images}
            prompt={currentPrompt}
            seed={currentSeed}
            model={currentModel}
            loading={loading}
          />
        </div>
      </div>

      {/* 功能特点 */}
      <div className="mt-12 sm:mt-16">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Pro Text-to-Image 特点</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">高效生成</h4>
            <p className="text-sm sm:text-base text-gray-600">优化的性能表现，比Max模型更快的生成速度，适合快速迭代</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">资源优化</h4>
            <p className="text-sm sm:text-base text-gray-600">更低的计算资源需求，适合大批量图像生成和资源受限场景</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">稳定可靠</h4>
            <p className="text-sm sm:text-base text-gray-600">更稳定的生成结果，减少失败率和不可预期的输出</p>
          </div>
        </div>
      </div>

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  )
}
