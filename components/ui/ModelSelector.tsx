'use client'

import React, { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FluxModel } from '@/lib/types'

interface ModelCategory {
  id: string
  name: string
  description: string
  models: ModelOption[]
}

interface ModelOption {
  value: FluxModel
  name: string
  description: string
}

interface ModelSelectorProps {
  value: FluxModel
  onChange: (model: FluxModel) => void
  label?: string
  helperText?: string
  className?: string
}

// 模型分类配置
const modelCategories: ModelCategory[] = [
  {
    id: 'text-to-image',
    name: '图片生成',
    description: '从文本描述生成全新图片',
    models: [
      {
        value: 'max-text-to-image',
        name: 'FLUX.1 Kontext Max',
        description: '前沿图像生成模型，质量最高'
      },
      {
        value: 'pro-text-to-image',
        name: 'FLUX.1 Kontext Pro',
        description: '专业文本到图像生成，速度更快'
      }
    ]
  },
  {
    id: 'image-edit',
    name: '图片编辑',
    description: '基于参考图片进行编辑和变换',
    models: [
      {
        value: 'max',
        name: 'FLUX.1 Kontext Max',
        description: '更强大的模型，处理复杂任务'
      },
      {
        value: 'pro',
        name: 'FLUX.1 Kontext Pro',
        description: '专业图片编辑模型'
      },
      {
        value: 'max-multi',
        name: 'FLUX.1 Kontext Max Multi',
        description: '支持多图片输入的强大模型'
      }
    ]
  }
]

// 获取模型的显示信息
function getModelDisplayInfo(model: FluxModel) {
  for (const category of modelCategories) {
    const modelOption = category.models.find(m => m.value === model)
    if (modelOption) {
      return {
        categoryName: category.name,
        modelName: modelOption.name,
        description: modelOption.description
      }
    }
  }
  return {
    categoryName: '未知类型',
    modelName: '未知模型',
    description: ''
  }
}

export function ModelSelector({
  value,
  onChange,
  label,
  helperText,
  className
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const displayInfo = getModelDisplayInfo(value)

  const handleModelSelect = (model: FluxModel) => {
    onChange(model)
    setIsOpen(false)
    setSelectedCategory(null)
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-white',
          'min-h-[44px] text-base text-left flex items-center justify-between',
          'border-gray-300 hover:border-gray-400'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {displayInfo.categoryName} — {displayInfo.modelName}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {displayInfo.description}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
      </button>

      {helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {/* 选择弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedCategory ? '选择模型' : '选择生图类型'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4 overflow-y-auto">
              {!selectedCategory ? (
                // 显示分类列表
                <div className="space-y-3">
                  {modelCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                    </button>
                  ))}
                </div>
              ) : (
                // 显示选中分类的模型列表
                <div className="space-y-3">
                  {/* 返回按钮 */}
                  <button
                    onClick={handleBackToCategories}
                    className="text-sm text-primary-600 hover:text-primary-700 mb-3"
                  >
                    ← 返回分类选择
                  </button>
                  
                  {modelCategories
                    .find(cat => cat.id === selectedCategory)
                    ?.models.map((model) => (
                      <button
                        key={model.value}
                        onClick={() => handleModelSelect(model.value)}
                        className={cn(
                          'w-full p-3 text-left border rounded-lg transition-colors',
                          value === model.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                        )}
                      >
                        <div className="font-medium text-gray-900">{model.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{model.description}</div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
