'use client'

import React, { useState } from 'react'
import { Palette, Sparkles, Github } from 'lucide-react'
import { GenerationForm } from '@/components/GenerationForm'
import { ImageGallery } from '@/components/ImageGallery'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { GenerationRequest, GeneratedImage } from '@/lib/types'

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentSeed, setCurrentSeed] = useState<number>()
  const [currentModel, setCurrentModel] = useState<string>('')
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
        body: JSON.stringify(request),
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
      {/* 主要内容 */}
      <div>
        {/* 介绍部分 */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mr-2" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">AI 图片生成</h2>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            基于 FLUX.1 Kontext 模型，为您提供高质量的 AI 图片生成服务。
            支持文本到图片、图片编辑等多种功能。
          </p>

          {/* 导航提示 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-medium text-blue-800">快速开始</h3>
            </div>
            <p className="text-sm text-blue-700">
              使用顶部菜单选择您需要的功能：
              <span className="font-medium">图片生成</span> 用于文本到图像创作，
              <span className="font-medium">图片编辑</span> 用于基于参考图片的编辑和变换。
            </p>
          </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 左侧：生成表单 */}
          <div className="order-1">
            <GenerationForm onGenerate={handleGenerate} loading={loading} />
          </div>

          {/* 右侧：图片展示 */}
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

        {/* 功能特点 */}
        <div className="mt-12 sm:mt-16">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">功能特点</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">高质量生成</h4>
              <p className="text-sm sm:text-base text-gray-600">基于 FLUX.1 Kontext Max 模型，生成高分辨率、高质量的图片</p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">多样化风格</h4>
              <p className="text-sm sm:text-base text-gray-600">支持多种艺术风格和图片比例，满足不同创作需求</p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">快速响应</h4>
              <p className="text-sm sm:text-base text-gray-600">优化的 API 调用，通常在 10-30 秒内完成图片生成</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  )
}
