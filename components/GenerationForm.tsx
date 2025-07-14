'use client'

import React, { useState } from 'react'
import { Wand2, Settings, Shuffle } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Card } from './ui/Card'
import { ImageUpload } from './ImageUpload'
import type { GenerationRequest, AspectRatio, OutputFormat, SafetyTolerance } from '@/lib/types'
import { generateRandomSeed, getAspectRatioInfo } from '@/lib/utils'

interface GenerationFormProps {
  onGenerate: (request: GenerationRequest) => void
  loading?: boolean
}

const aspectRatioOptions = [
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
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' }
]

const safetyToleranceOptions = [
  { value: '1', label: '最严格 (1)' },
  { value: '2', label: '严格 (2)' },
  { value: '3', label: '中等 (3)' },
  { value: '4', label: '宽松 (4)' },
  { value: '5', label: '很宽松 (5)' },
  { value: '6', label: '最宽松 (6)' }
]

export function GenerationForm({ onGenerate, loading = false }: GenerationFormProps) {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1')
  const [guidanceScale, setGuidanceScale] = useState(3.5)
  const [numImages, setNumImages] = useState(1)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg')
  const [safetyTolerance, setSafetyTolerance] = useState<SafetyTolerance>('2')
  const [seed, setSeed] = useState<number | undefined>(undefined)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const request: GenerationRequest = {
      prompt: prompt.trim(),
      aspectRatio,
      guidanceScale,
      numImages,
      outputFormat,
      safetyTolerance,
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
            onImageUpload={setImageUrl}
            onImageRemove={() => setImageUrl('')}
            currentImageUrl={imageUrl}
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            上传参考图片可以帮助 AI 更好地理解你的需求
          </p>
        </div>

        {/* 基础设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="图片比例"
            options={aspectRatioOptions}
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            helperText={`${aspectRatioInfo.width} × ${aspectRatioInfo.height} 像素`}
          />

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
