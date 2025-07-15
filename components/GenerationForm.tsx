'use client'

import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Wand2, Settings, Shuffle } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { ModelSelector } from './ui/ModelSelector'
import { Card } from './ui/Card'
import { ImageUpload } from './ImageUpload'
import { MultiImageUpload } from './MultiImageUpload'
import type { GenerationRequest, AspectRatio, OutputFormat, SafetyTolerance, FluxModel } from '@/lib/types'
import { generateRandomSeed, getAspectRatioInfo, getImageDimensions, detectAspectRatio, formatAspectRatioText } from '@/lib/utils'

interface GenerationFormProps {
  onGenerate: (request: GenerationRequest) => void
  loading?: boolean
  defaultPrompt?: string
}

export interface GenerationFormRef {
  addToPrompt: (text: string) => void
}

const baseAspectRatioOptions = [
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
  { value: '1', label: '最严格 (1)' },
  { value: '2', label: '严格 (2)' },
  { value: '3', label: '标准 (3)' },
  { value: '4', label: '宽松 (4)' },
  { value: '5', label: '最宽松 (5)' }
]



export const GenerationForm = forwardRef<GenerationFormRef, GenerationFormProps>(
  ({ onGenerate, loading = false, defaultPrompt = '' }, ref) => {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('auto')
  const [guidanceScale, setGuidanceScale] = useState(3.5)
  const [numImages, setNumImages] = useState(1)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png')
  const [safetyTolerance, setSafetyTolerance] = useState<SafetyTolerance>('5')
  const [model, setModel] = useState<FluxModel>('max')
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 自动检测相关状态
  const [detectedRatio, setDetectedRatio] = useState<Exclude<AspectRatio, 'auto'> | ''>('')
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    addToPrompt: (text: string) => {
      setPrompt(prev => {
        const trimmedPrev = prev.trim()
        if (trimmedPrev === '') {
          return text
        }
        // 如果已经包含这个文本，就不重复添加
        if (trimmedPrev.includes(text)) {
          return prev
        }
        // 添加文本，用逗号分隔
        return `${trimmedPrev}, ${text}`
      })
    }
  }), [])

  // 根据模型类型动态生成比例选项
  const aspectRatioOptions = useMemo(() => {
    const isTextToImageModel = model === 'max-text-to-image' || model === 'pro-text-to-image'

    if (isTextToImageModel) {
      // 文生图模型不显示"自动"选项
      return baseAspectRatioOptions
    } else {
      // 其他模型显示"自动"选项
      return [{ value: 'auto', label: '自动' }, ...baseAspectRatioOptions]
    }
  }, [model])

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

  // 处理单图片上传
  const handleImageUpload = (url: string) => {
    setImageUrl(url)
    detectImageAspectRatio(url)
  }

  // 处理单图片移除
  const handleImageRemove = () => {
    setImageUrl('')
    setImageDimensions(null)
    setDetectedRatio('')
  }

  // 处理多图片变化
  const handleMultiImagesChange = (urls: string[]) => {
    setImageUrls(urls)
    // 如果有图片且是自动模式，检测第一张图片的比例
    if (urls.length > 0 && aspectRatio === 'auto') {
      detectImageAspectRatio(urls[0])
    } else if (urls.length === 0) {
      setImageDimensions(null)
      setDetectedRatio('')
    }
  }

  // 处理比例选择变化
  const handleAspectRatioChange = (newRatio: AspectRatio) => {
    setAspectRatio(newRatio)
    if (newRatio !== 'auto') {
      setDetectedRatio('')
      setImageDimensions(null)
    } else {
      // 根据模型类型检测图片比例
      const referenceUrl = model === 'max-multi'
        ? (imageUrls.length > 0 ? imageUrls[0] : null)
        : imageUrl
      if (referenceUrl) {
        detectImageAspectRatio(referenceUrl)
      }
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
      ...(model === 'max-multi' && imageUrls.length > 0 && { imageUrls }),
      ...(model !== 'max-multi' && imageUrl && { imageUrl }),
      ...(seed && { seed })
    }

    onGenerate(request)
  }

  const handleRandomSeed = () => {
    setSeed(generateRandomSeed())
  }

  // 处理模型切换
  const handleModelChange = (newModel: FluxModel) => {
    setModel(newModel)

    // 为文生图模型设置默认比例
    if (newModel === 'max-text-to-image' || newModel === 'pro-text-to-image') {
      // 文生图模型默认使用 3:2 比例
      setAspectRatio('3:2')
    } else {
      // 切换到其他模型时，如果当前比例不在选项中，设置为auto
      const currentModel = model
      const wasTextToImageModel = currentModel === 'max-text-to-image' || currentModel === 'pro-text-to-image'

      if (wasTextToImageModel && aspectRatio !== 'auto') {
        // 从文生图模型切换到其他模型，设置为auto
        setAspectRatio('auto')
      }
      // 其他情况保持当前比例
    }

    // 切换模型时清理图片状态，避免混乱
    if (newModel === 'max-text-to-image' || newModel === 'pro-text-to-image') {
      // 切换到文生图模型，清理所有图片状态
      setImageUrl('')
      setImageUrls([])
      setDetectedRatio('')
      setImageDimensions(null)
    } else if (newModel === 'max-multi') {
      // 切换到多图片模型，清理单图片状态
      if (imageUrl) {
        setImageUrls([imageUrl]) // 将单图片转为多图片数组
        setImageUrl('')
      }
    } else {
      // 切换到单图片模型，清理多图片状态
      if (imageUrls.length > 0) {
        setImageUrl(imageUrls[0]) // 使用第一张图片
        setImageUrls([])
      }
    }
  }

  const aspectRatioInfo = getAspectRatioInfo(aspectRatio)

  return (
    <Card title="AI 图片生成" description="使用 FLUX.1 Kontext 生成高质量图片">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 模型选择 */}
        <div>
          <ModelSelector
            label="AI 模型"
            value={model}
            onChange={handleModelChange}
            helperText="选择适合您需求的 FLUX.1 Kontext 模型"
          />
        </div>

        {/* 提示词输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            提示词
          </label>
          <textarea
            placeholder="描述你想要生成的图片..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 min-h-[88px] resize-none text-base"
            rows={3}
          />
          {errors.prompt && (
            <p className="mt-1 text-sm text-red-600">{errors.prompt}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">详细描述你想要的图片内容、风格、颜色等</p>
        </div>

        {/* 参考图片上传 - 仅非文生图模型显示 */}
        {!(model === 'max-text-to-image' || model === 'pro-text-to-image') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              参考图片 (可选)
            </label>

            {model === 'max-multi' ? (
              <MultiImageUpload
                onImagesChange={handleMultiImagesChange}
                currentImageUrls={imageUrls}
                disabled={loading}
                maxImages={4}
              />
            ) : (
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                currentImageUrl={imageUrl}
                disabled={loading}
              />
            )}

            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">
                {model === 'max-multi'
                  ? '上传多张参考图片可以帮助 AI 更好地理解复杂的需求和场景'
                  : '上传参考图片可以帮助 AI 更好地理解你的需求'
                }
              </p>
              {aspectRatio === 'auto' && (
                (model === 'max-multi' ? imageUrls.length > 0 : imageUrl) && (
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
                )
              )}
            </div>
          </div>
        )}

        {/* 基础设置 */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
          <div>
            <Select
              label="图片比例"
              options={aspectRatioOptions}
              value={aspectRatio}
              onChange={(e) => handleAspectRatioChange(e.target.value as AspectRatio)}
              helperText={
                // 文生图模型的帮助文本
                (model === 'max-text-to-image' || model === 'pro-text-to-image')
                  ? `${aspectRatioInfo.width} × ${aspectRatioInfo.height} 像素 - 文生图模型推荐手动选择比例`
                  : aspectRatio === 'auto'
                    ? (model === 'max-multi' ? imageUrls.length > 0 : imageUrl)
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
            <div className="space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
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

                <div>
                  <Select
                    label="输出格式"
                    options={outputFormatOptions}
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                    helperText="选择图片的输出格式"
                  />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                <div>
                  <Select
                    label="安全等级"
                    options={safetyToleranceOptions}
                    value={safetyTolerance}
                    onChange={(e) => setSafetyTolerance(e.target.value as SafetyTolerance)}
                    helperText="控制内容安全检查的严格程度"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    随机种子
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="留空为随机"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                      helperText="相同种子生成相同图片"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRandomSeed}
                      className="mt-0 self-start"
                      size="md"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 生成按钮 */}
        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !prompt.trim()}
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            {loading ? '生成中...' : '生成图片'}
          </Button>
        </div>
      </form>
    </Card>
  )
})

GenerationForm.displayName = 'GenerationForm'
