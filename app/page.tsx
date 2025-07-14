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
  const { addToast, ToastContainer, success, error: showError } = useToast()

  const handleGenerate = async (request: GenerationRequest) => {
    setLoading(true)
    setCurrentPrompt(request.prompt)
    setCurrentSeed(request.seed)

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
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">FLUX.1 Kontext</h1>
                  <p className="text-sm text-gray-500">AI 绘图应用</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 介绍部分 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">AI 图片生成</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基于 FLUX.1 Kontext Max 模型，为您提供高质量的 AI 图片生成服务。
            支持文本到图片、图片编辑等多种功能。
          </p>
        </div>



        {/* 主要布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：生成表单 */}
          <div>
            <GenerationForm onGenerate={handleGenerate} loading={loading} />
          </div>

          {/* 右侧：图片展示 */}
          <div>
            <ImageGallery
              images={images}
              prompt={currentPrompt}
              seed={currentSeed}
              loading={loading}
            />
          </div>
        </div>

        {/* 功能特点 */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">功能特点</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">高质量生成</h4>
              <p className="text-gray-600">基于 FLUX.1 Kontext Max 模型，生成高分辨率、高质量的图片</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">多样化风格</h4>
              <p className="text-gray-600">支持多种艺术风格和图片比例，满足不同创作需求</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">快速响应</h4>
              <p className="text-gray-600">优化的 API 调用，通常在 10-30 秒内完成图片生成</p>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              基于 FLUX.1 Kontext API 构建 | 
              <a href="https://fal.ai" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 ml-1">
                Powered by FAL.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  )
}
