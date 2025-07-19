'use client'

import React, { useState, useEffect } from 'react'
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
        value: 'pro-text-to-image',
        name: 'FLUX.1 Kontext Pro',
        description: '专业文本到图像生成，速度更快'
      },
      {
        value: 'max-text-to-image',
        name: 'FLUX.1 Kontext Max',
        description: '前沿图像生成模型，质量最高'
      }
    ]
  },
  {
    id: 'image-edit',
    name: '图片编辑',
    description: '基于参考图片进行编辑和变换',
    models: [
      {
        value: 'kontext-dev',
        name: 'FLUX.1 Kontext [dev]',
        description: '前沿图片编辑模型，理解图片上下文，编辑更精准（推荐）'
      },
      {
        value: 'pro',
        name: 'FLUX.1 Kontext Pro',
        description: '专业图片编辑模型'
      },
      {
        value: 'max',
        name: 'FLUX.1 Kontext Max',
        description: '更强大的模型，处理复杂任务'
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
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const displayInfo = getModelDisplayInfo(value)

  // 移动端键盘适配
  useEffect(() => {
    if (isOpen) {
      // 防止背景滚动
      document.body.style.overflow = 'hidden'
      // 移动端视口适配
      if (window.innerWidth < 768) {
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
      }
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])

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

  const handleClose = () => {
    setIsOpen(false)
    setSelectedCategory(null)
  }

  // 处理背景点击关闭（仅桌面端）
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && window.innerWidth >= 768) {
      handleClose()
    }
  }

  // 移动端滑动手势处理
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isDownSwipe = distance < -minSwipeDistance

    // 向下滑动关闭弹窗（仅移动端）
    if (isDownSwipe && window.innerWidth < 768) {
      handleClose()
    }
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
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white',
          'min-h-[44px] text-base text-left flex items-center justify-between',
          'border-gray-300 hover:border-gray-400 active:bg-gray-50 touch-feedback'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm pc:text-base font-medium text-gray-900 truncate">
            {displayInfo.categoryName} — {displayInfo.modelName}
          </div>
          <div className="text-xs pc:text-sm text-gray-500 truncate mt-0.5">
            {displayInfo.description}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 pc:w-5 pc:h-5 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200" />
      </button>

      {helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {/* 选择弹窗 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 pc:flex pc:items-center pc:justify-center pc:p-4"
          onClick={handleBackdropClick}
        >
          {/* 移动端全屏弹窗 */}
          <div
            className="bg-white h-full w-full pc:h-auto pc:max-h-[80vh] pc:max-w-md pc:rounded-lg pc:shadow-xl overflow-hidden animate-slide-up pc:animate-none flex flex-col"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* 移动端滑动指示器 */}
            <div className="pc:hidden flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-4 pc:p-6 border-b border-gray-200 bg-white sticky top-0 z-10 pt-safe">
              <h3 className="text-lg pc:text-xl font-medium text-gray-900">
                {selectedCategory ? '选择模型' : '选择生图类型'}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors p-2 -m-2 min-h-[48px] min-w-[48px] flex items-center justify-center touch-feedback"
                aria-label="关闭"
              >
                <X className="w-5 h-5 pc:w-6 pc:h-6" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="flex-1 p-4 pc:p-6 overflow-y-auto pb-safe mobile-scroll">
              {!selectedCategory ? (
                // 显示分类列表
                <div className="space-y-4 pc:space-y-3">
                  {modelCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="w-full p-4 pc:p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 min-h-[60px] pc:min-h-[auto] flex flex-col justify-center touch-feedback"
                    >
                      <div className="font-medium text-gray-900 text-base pc:text-sm">{category.name}</div>
                      <div className="text-sm pc:text-sm text-gray-500 mt-1">{category.description}</div>
                    </button>
                  ))}
                </div>
              ) : (
                // 显示选中分类的模型列表
                <div className="space-y-4 pc:space-y-3">
                  {/* 返回按钮 */}
                  <button
                    onClick={handleBackToCategories}
                    className="text-sm pc:text-base text-primary-600 hover:text-primary-700 active:text-primary-800 mb-4 pc:mb-3 p-2 -m-2 min-h-[48px] flex items-center transition-all duration-200 touch-feedback"
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
                          'w-full p-4 pc:p-3 text-left border rounded-lg transition-all duration-200 min-h-[60px] pc:min-h-[auto] flex flex-col justify-center touch-feedback',
                          value === model.value
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 active:bg-primary-100'
                        )}
                      >
                        <div className="font-medium text-gray-900 text-base pc:text-sm">{model.name}</div>
                        <div className="text-sm pc:text-sm text-gray-500 mt-1">{model.description}</div>
                        {value === model.value && (
                          <div className="text-xs text-primary-600 mt-1 font-medium">✓ 当前选中</div>
                        )}
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
