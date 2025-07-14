'use client'

import React, { useState } from 'react'
import { Wand2, Settings, Shuffle } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Card } from './ui/Card'
import { ImageUpload } from './ImageUpload'
import type { GenerationRequest, AspectRatio, OutputFormat, SafetyTolerance, FluxModel } from '@/lib/types'
import { generateRandomSeed, getAspectRatioInfo, getImageDimensions, detectAspectRatio, formatAspectRatioText } from '@/lib/utils'

interface GenerationFormProps {
  onGenerate: (request: GenerationRequest) => void
  loading?: boolean
}

const aspectRatioOptions = [
  { value: 'auto', label: '自动' },
  { value: '1:1', label: '正方形 (1:1)' },
  { value: '16:9', label: '宽屏 (16:9)' },
  { value: '9:16', label: '手机竖屏 (9:16)' },
  { value: '4:3', label: '标准 (4:3)' },
  { value: '3:4', label: '竖版 (3:4)' },
  { value: '21:9', label: '超宽屏 (21:9)' },
  { value: '9:21', label: '超长竖屏 (9:21)' },
  { value: '3:2', label: '经典 (3:2)' },
  { value: '2:3', label: '竖版 (2:3)' }
]

const outputFormatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' }
]

const safetyToleranceOptions = [
  { value: '0', label: '最严格 (0)' },
  { value: '1', label: '严格 (1)' },
  { value: '2', label: '标准 (2)' }
]

const modelOptions = [
  { value: 'max', label: 'FLUX.1 Kontext Max - 更强大的模型，处理复杂任务' },
  { value: 'pro', label: 'FLUX.1 Kontext Pro - 专业图片编辑模型' }
]

export function GenerationForm({ onGenerate, loading = false }: GenerationFormProps) {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('auto')
  const [guidanceScale, setGuidanceScale] = useState(3.5)
  const [numImages, setNumImages] = useState(1)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png')
  const [safetyTolerance, setSafetyTolerance] = useState<SafetyTolerance>('2')
  const [model, setModel] = useState<FluxModel>('max')
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 自动检测相关状态
  const [detectedRatio, setDetectedRatio] = useState<Exclude<AspectRatio, 'auto'> | ''>('')
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!prompt.trim()) {
      newErrors.prompt = '请输入提示词'
    }

    if (guidanceScale < 1 || guidanceScale > 20) {
      newErrors.guidanceScale = '引导强度必须在 1-20 之间'
    }

    if (numImages < 1 || numImages > 4) {
      newErrors.numImages = '图片数量必须在 1-4 之间'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 检测图片比例
  const detectImageAspectRatio = async (url: string) => {
    if (aspectRatio !== 'auto') return

    setIsDetecting(true)
    try {
      const dimensions = await getImageDimensions(url)
      setImageDimensions(dimensions)

      const detected = detectAspectRatio(dimensions.width, dimensions.height)
      setDetectedRatio(detected)
    } catch (error) {
      console.error('检测图片比例失败:', error)
      setDetectedRatio('1:1') // 默认使用正方形
    } finally {
      setIsDetecting(false)
    }
  }

  // 处理图片上传
  const handleImageUpload = (url: string) => {
    setImageUrl(url)
    detectImageAspectRatio(url)
  }

  // 处理图片移除
  const handleImageRemove = () => {
    setImageUrl('')
    setImageDimensions(null)
    setDetectedRatio('')
  }

  // 处理比例选择变化
  const handleAspectRatioChange = (newRatio: AspectRatio) => {
    setAspectRatio(newRatio)
    if (newRatio !== 'auto') {
      setDetectedRatio('')
      setImageDimensions(null)
    } else if (imageUrl) {
      detectImageAspectRatio(imageUrl)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // 确定最终使用的比例
    let finalAspectRatio: Exclude<AspectRatio, 'auto'>
    if (aspectRatio === 'auto') {
      finalAspectRatio = detectedRatio || '1:1'
    } else {
      finalAspectRatio = aspectRatio
    }

    const request: GenerationRequest = {
      prompt: prompt.trim(),
      aspectRatio: finalAspectRatio,
      guidanceScale,
      numImages,
      outputFormat,
      safetyTolerance,
      model,
      ...(imageUrl && { imageUrl }),
      ...(seed && { seed })
    }

    onGenerate(request)
  }

  const handleRandomSeed = () => {
    setSeed(generateRandomSeed())
  }

  const aspectRatioInfo = getAspectRatioInfo(aspectRatio)

  return (
    <Card title="AI 图片生成" description="使用 FLUX.1 Kontext 生成高质量图片">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 模型选择 */}
        <div>
          <Select
            label="AI 模型"
            options={modelOptions}
            value={model}
            onChange={(e) => setModel(e.target.value as FluxModel)}
            helperText="选择适合您需求的 FLUX.1 Kontext 模型"
          />
        </div>

        {/* 提示词输入 */}
        <div>
          <Input
            label="提示词"
            placeholder="描述你想要生成的图片..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            error={errors.prompt}
            helperText="详细描述你想要的图片内容、风格、颜色等"
          />
        </div>

        {/* 参考图片上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            参考图片 (可选)
          </label>
          <ImageUpload
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            currentImageUrl={imageUrl}
            disabled={loading}
          />
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500">
              上传参考图片可以帮助 AI 更好地理解你的需求
            </p>
            {aspectRatio === 'auto' && imageUrl && (
              <div className="text-xs">
                {isDetecting ? (
                  <span className="text-blue-600">🔍 正在检测图片比例...</span>
                ) : imageDimensions && detectedRatio ? (
                  <span className="text-green-600">
                    ✓ 检测到: {formatAspectRatioText(imageDimensions.width, imageDimensions.height, detectedRatio)}
                  </span>
                ) : (
                  <span className="text-gray-500">等待检测图片比例</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 基础设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="图片比例"
              options={aspectRatioOptions}
              value={aspectRatio}
              onChange={(e) => handleAspectRatioChange(e.target.value as AspectRatio)}
              helperText={
                aspectRatio === 'auto'
                  ? imageUrl
                    ? detectedRatio
                      ? `自动检测: ${getAspectRatioInfo(detectedRatio).label}`
                      : '等待检测图片比例'
                    : '默认使用正方形 (1:1)'
                  : `${aspectRatioInfo.width} × ${aspectRatioInfo.height} 像素`
              }
            />
          </div>

          <div>
            <Input
              label="图片数量"
              type="number"
              min="1"
              max="4"
              value={numImages}
              onChange={(e) => setNumImages(parseInt(e.target.value))}
              error={errors.numImages}
              helperText="一次最多生成 4 张图片"
            />
          </div>
        </div>

        {/* 高级设置 */}
        <div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mb-4"
          >
            <Settings className="w-4 h-4 mr-2" />
            高级设置
          </Button>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="引导强度"
                    type="number"
                    min="1"
                    max="20"
                    step="0.1"
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                    error={errors.guidanceScale}
                    helperText="控制 AI 对提示词的遵循程度 (1-20)"
                  />
                </div>

                <Select
                  label="输出格式"
                  options={outputFormatOptions}
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  helperText="选择图片的输出格式"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="安全等级"
                  options={safetyToleranceOptions}
                  value={safetyTolerance}
                  onChange={(e) => setSafetyTolerance(e.target.value as SafetyTolerance)}
                  helperText="控制内容安全检查的严格程度"
                />

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label="随机种子"
                      type="number"
                      placeholder="留空为随机"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      helperText="相同种子生成相同图片"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRandomSeed}
                    className="mb-6"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 生成按钮 */}
        <div className="flex justify-center">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !prompt.trim()}
            size="lg"
            className="w-full md:w-auto"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            {loading ? '生成中...' : '生成图片'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
