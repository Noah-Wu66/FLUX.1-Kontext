'use client'

import React, { useState, useRef } from 'react'
import { Layers } from 'lucide-react'
import { GenerationForm, type GenerationFormRef } from '@/components/GenerationForm'
import { ImageGallery } from '@/components/ImageGallery'
import { PromptPresets } from '@/components/PromptPresets'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import type { GenerationRequest, GeneratedImage } from '@/lib/types'

export default function MaxMultiEditPage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentSeed, setCurrentSeed] = useState<number>()
  const [currentModel, setCurrentModel] = useState<string>('max-multi')
  const { addToast, ToastContainer, success, error: showError } = useToast()
  const generationFormRef = useRef<GenerationFormRef>(null)

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
          model: 'max-multi' // 强制使用 max-multi 模型
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
          <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mr-2" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">FLUX.1 Kontext Max Multi 多图编辑</h2>
        </div>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          使用强大的 FLUX.1 Kontext Max Multi 模型进行多图片编辑，
          支持同时处理多张参考图片，创造复杂的合成效果。
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

      {/* 预设词 - 在移动端显示在顶部 */}
      <div className="mb-6 lg:hidden">
        <Card title="预设提示词" description="快速添加常用编辑指令">
          <PromptPresets onPresetClick={handlePresetClick} />
        </Card>
      </div>

      {/* 主要布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* 左侧：生成表单 */}
        <div className="order-1 lg:col-span-2">
          <GenerationForm
            ref={generationFormRef}
            onGenerate={handleGenerate}
            loading={loading}
            defaultPrompt="Maintain the consistency between the characters and the background."
          />
        </div>

        {/* 右侧：预设词和图片展示 */}
        <div className="order-2 space-y-6">
          {/* 预设词 - 在桌面端显示 */}
          <div className="hidden lg:block">
            <Card title="预设提示词" description="快速添加常用编辑指令">
              <PromptPresets onPresetClick={handlePresetClick} />
            </Card>
          </div>

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
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Max Multi 多图编辑特点</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">多图处理</h4>
            <p className="text-sm sm:text-base text-gray-600">同时处理多张参考图片，理解复杂的视觉关系和场景组合</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z" />
              </svg>
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">智能合成</h4>
            <p className="text-sm sm:text-base text-gray-600">智能分析多张图片的特征，创造出协调统一的合成效果</p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">创意融合</h4>
            <p className="text-sm sm:text-base text-gray-600">将多个创意元素融合，创造出单张图片无法实现的复杂视觉效果</p>
          </div>
        </div>
      </div>

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  )
}
