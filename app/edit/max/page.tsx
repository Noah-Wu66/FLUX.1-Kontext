'use client'

import React, { useState, useRef } from 'react'
import { Image } from 'lucide-react'
import { GenerationForm } from '@/components/GenerationForm'
import { ImageGallery } from '@/components/ImageGallery'
import { PromptPresets } from '@/components/PromptPresets'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import type { GenerationRequest, GeneratedImage } from '@/lib/types'

export default function MaxEditPage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentSeed, setCurrentSeed] = useState<number>()
  const [currentModel, setCurrentModel] = useState<string>('max')
  const { addToast, ToastContainer, success, error: showError } = useToast()
  const generationFormRef = useRef<{ addToPrompt: (text: string) => void }>(null)

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

  const handlePresetClick = (presetText: string) => {
    if (generationFormRef.current) {
      generationFormRef.current.addToPrompt(presetText)
    }
  }

  return (
    <div className="min-h-screen">
      {/* 页面标题 */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <Image className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mr-2" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">FLUX.1 Kontext Max 图片编辑</h2>
        </div>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          使用最强大的 FLUX.1 Kontext Max 模型进行图片编辑，
          上传参考图片并添加提示词，创造令人惊艳的变化。
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
          <Card title="预设提示词" description="快速添加常用编辑指令">
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
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Max 图片编辑特点</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Image className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">精准编辑</h4>
            <p className="text-sm sm:text-base text-gray-600">强大的图像理解能力，能够精确捕捉和修改图像中的细节</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">风格转换</h4>
            <p className="text-sm sm:text-base text-gray-600">能够在保留原始图像结构的同时，应用各种艺术风格和视觉效果</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">高级细节</h4>
            <p className="text-sm sm:text-base text-gray-600">能够处理和生成复杂的纹理、光影和细节，创造出专业级的图像效果</p>
          </div>
        </div>
      </div>

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  )
}
