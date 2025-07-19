'use client'

import React, { useState } from 'react'
import { GenerationForm } from '@/components/GenerationForm'
import { ImageGallery } from '@/components/ImageGallery'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Sparkles, Zap, Target, Brain } from 'lucide-react'
import Link from 'next/link'
import type { GenerationRequest, GeneratedImage } from '@/lib/types'
import { saveGenerationResult, scrollToResultOnMobile } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

export default function KontextDevPage() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(false)
  const [currentSeed, setCurrentSeed] = useState<number | undefined>(undefined)
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const { success, error: showError, ToastContainer } = useToast()

  const handleGenerate = async (request: GenerationRequest) => {
    setLoading(true)
    setImages([])
    setCurrentPrompt(request.prompt)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          model: 'kontext-dev' // 强制使用 kontext-dev 模型
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setImages(result.data.images)
        setCurrentSeed(result.data.seed)
        success('生成成功', `已生成 ${result.data.images.length} 张图片`)

        // 保存生成结果到本地存储
        saveGenerationResult({
          images: result.data.images,
          prompt: request.prompt,
          seed: result.data.seed,
          model: 'kontext-dev' // 强制使用 kontext-dev 模型
        })

        // 移动端自动滚动到生成结果
        scrollToResultOnMobile()
      } else {
        showError('生成失败', result.error || '请重试')
        setImages([])
      }
    } catch (error) {
      console.error('生成请求失败:', error)
      showError('网络错误', '请检查网络连接后重试')
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回首页</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">FLUX.1 Kontext [dev]</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 模型介绍 */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Brain className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">前沿图片编辑模型</h2>
                <p className="text-sm text-gray-600">理解图片上下文，编辑更精准</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">精准理解</h3>
                  <p className="text-sm text-blue-700">深度理解图片内容和上下文</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-900">智能编辑</h3>
                  <p className="text-sm text-green-700">无需详细描述，智能推理编辑意图</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-medium text-purple-900">迭代优化</h3>
                  <p className="text-sm text-purple-700">支持多轮编辑，逐步完善</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2">使用建议：</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• 使用精确的语言描述，如具体的颜色名称和详细描述</li>
                <li>• 明确指出要保持不变的元素，如"保持相同的面部特征"</li>
                <li>• 复杂变换可以分多步进行，每次专注一个方面</li>
                <li>• 直接命名主体，如"黑发短发女性"而不是"她"</li>
                <li>• 高级设置中可调整推理步数、生成加速等参数优化效果</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 生成表单 */}
          <div>
            <GenerationForm onGenerate={handleGenerate} loading={loading} />
          </div>

          {/* 生成结果 */}
          <div>
            <ImageGallery
              images={images}
              loading={loading}
              seed={currentSeed}
              model="kontext-dev"
              prompt={currentPrompt}
            />
          </div>
        </div>
      </div>

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  )
}
