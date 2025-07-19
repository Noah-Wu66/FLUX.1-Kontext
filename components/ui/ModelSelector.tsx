'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, X, Lock } from 'lucide-react'
import { cn, loadUnlockStatus, saveUnlockStatus, clearUnlockStatus } from '@/lib/utils'
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
  locked?: boolean // 是否需要解锁
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
        name: 'FLUX.1 Pro',
        description: '快速高效的文本生图模型，适合日常创作需求'
      },
      {
        value: 'max-text-to-image',
        name: 'FLUX.1 Max',
        description: '顶级文本生图模型，极致画质与细节表现',
        locked: true
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
        name: 'Kontext Dev',
        description: '开发版图片编辑模型，免费使用，功能全面（推荐）'
      },
      {
        value: 'pro',
        name: 'Kontext Pro',
        description: '专业图片编辑模型，平衡性能与质量的最佳选择',
        locked: true
      },
      {
        value: 'max',
        name: 'Kontext Max',
        description: '旗舰图片编辑模型，处理复杂场景与精细调整',
        locked: true
      },
      {
        value: 'max-multi',
        name: 'Kontext Multi',
        description: '多图融合编辑模型，支持复杂的多图片处理任务',
        locked: true
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

  // 解锁状态管理 - 从本地存储初始化
  const [unlockedModels, setUnlockedModels] = useState<Set<FluxModel>>(new Set())
  const [lockClickCounts, setLockClickCounts] = useState<Record<FluxModel, number>>({} as Record<FluxModel, number>)
  const [shakingLocks, setShakingLocks] = useState<Set<FluxModel>>(new Set())
  const [celebratingModels, setCelebratingModels] = useState<Set<FluxModel>>(new Set())

  // 组件挂载时加载解锁状态
  useEffect(() => {
    const unlockedArray = loadUnlockStatus()
    const unlockedSet = new Set(unlockedArray as FluxModel[])
    setUnlockedModels(unlockedSet)

    // 开发环境下输出调试信息
    if (process.env.NODE_ENV === 'development' && unlockedArray.length > 0) {
      console.log('已解锁的模型:', unlockedArray)
    }
  }, [])

  // 重置解锁状态（开发用，长按标题10秒触发）
  const [titlePressStart, setTitlePressStart] = useState<number | null>(null)

  const handleTitleMouseDown = () => {
    setTitlePressStart(Date.now())
  }

  const handleTitleMouseUp = () => {
    if (titlePressStart && Date.now() - titlePressStart >= 10000) {
      // 长按10秒，重置解锁状态
      setUnlockedModels(new Set())
      setLockClickCounts({} as Record<FluxModel, number>)
      clearUnlockStatus()
      console.log('已重置所有模型解锁状态')
    }
    setTitlePressStart(null)
  }

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
    // 检查模型是否被锁定
    const modelOption = modelCategories
      .flatMap(cat => cat.models)
      .find(m => m.value === model)

    if (modelOption?.locked && !unlockedModels.has(model)) {
      return // 被锁定的模型无法选择
    }

    onChange(model)
    setIsOpen(false)
    setSelectedCategory(null)
  }

  // 处理小锁点击
  const handleLockClick = (model: FluxModel, e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡

    const currentCount = lockClickCounts[model] || 0
    const newCount = currentCount + 1

    // 移动端触摸振动反馈（如果支持）
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      (navigator as any).vibrate(50) // 50ms 轻微振动
    }

    setLockClickCounts(prev => ({
      ...prev,
      [model]: newCount
    }))

    // 添加震动动画
    setShakingLocks(prev => {
      const newSet = new Set(prev)
      newSet.add(model)
      return newSet
    })
    setTimeout(() => {
      setShakingLocks(prev => {
        const newSet = new Set(prev)
        newSet.delete(model)
        return newSet
      })
    }, 300)

    // 连续点击5次解锁
    if (newCount >= 5) {
      // 解锁成功时的强烈振动反馈
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        (navigator as any).vibrate([100, 50, 100]) // 解锁成功的振动模式
      }

      const newUnlockedModels = new Set(unlockedModels)
      newUnlockedModels.add(model)
      setUnlockedModels(newUnlockedModels)

      // 添加庆祝动画
      setCelebratingModels(prev => {
        const newSet = new Set(prev)
        newSet.add(model)
        return newSet
      })

      // 3秒后移除庆祝动画
      setTimeout(() => {
        setCelebratingModels(prev => {
          const newSet = new Set(prev)
          newSet.delete(model)
          return newSet
        })
      }, 3000)

      // 保存到本地存储
      const unlockedArray: FluxModel[] = []
      newUnlockedModels.forEach(model => unlockedArray.push(model))
      saveUnlockStatus(unlockedArray)

      // 开发环境下输出调试信息
      if (process.env.NODE_ENV === 'development') {
        console.log(`模型 ${model} 已解锁，当前已解锁模型:`, unlockedArray)
      }

      setLockClickCounts(prev => ({
        ...prev,
        [model]: 0
      }))
    }
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
              <h3
                className="text-lg pc:text-xl font-medium text-gray-900 select-none"
                onMouseDown={handleTitleMouseDown}
                onMouseUp={handleTitleMouseUp}
                onMouseLeave={handleTitleMouseUp}
                onTouchStart={handleTitleMouseDown}
                onTouchEnd={handleTitleMouseUp}
                title="长按10秒重置解锁状态"
              >
                {selectedCategory ? '选择模型' : '选择生图类型'}
                {/* 移动端长按提示 */}
                <span className="pc:hidden text-xs text-gray-400 ml-2">
                  (长按重置)
                </span>
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
                    ?.models.map((model) => {
                      const isLocked = model.locked && !unlockedModels.has(model.value)
                      const isUnlocking = model.locked && unlockedModels.has(model.value)
                      const isShaking = shakingLocks.has(model.value)
                      const isCelebrating = celebratingModels.has(model.value)
                      const clickCount = lockClickCounts[model.value] || 0

                      return (
                        <div
                          key={model.value}
                          className={cn(
                            'w-full p-4 pc:p-3 border rounded-lg transition-all duration-300 min-h-[60px] pc:min-h-[auto] flex items-center justify-between touch-feedback relative',
                            value === model.value
                              ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                              : isLocked
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-75'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 active:bg-primary-100 cursor-pointer',
                            // 庆祝动画效果
                            isCelebrating && 'animate-celebrate rainbow-border bg-gradient-to-r from-green-50 via-blue-50 to-purple-50'
                          )}
                          onClick={() => !isLocked && handleModelSelect(model.value)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-base pc:text-sm flex items-center gap-2">
                              {model.name}
                              {isUnlocking && (
                                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full animate-pulse border border-green-200 shadow-sm">
                                  ✨ 已解锁 ✨
                                </span>
                              )}
                            </div>
                            <div className="text-sm pc:text-sm text-gray-500 mt-1">{model.description}</div>
                            {value === model.value && (
                              <div className="text-xs text-primary-600 mt-1 font-medium">✓ 当前选中</div>
                            )}
                            {isLocked && clickCount > 0 && (
                              <div className={cn(
                                "unlock-hint text-xs pc:text-xs mt-1 font-medium px-2 py-1 rounded-md inline-block transition-all duration-300",
                                // 根据点击次数改变提示颜色
                                clickCount === 1 && "text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50",
                                clickCount === 2 && "text-green-700 bg-gradient-to-r from-green-50 to-emerald-50",
                                clickCount === 3 && "text-yellow-700 bg-gradient-to-r from-yellow-50 to-orange-50",
                                clickCount === 4 && "text-red-700 bg-gradient-to-r from-red-50 to-pink-50 animate-pulse"
                              )}>
                                {/* 根据点击次数显示不同的emoji */}
                                {clickCount === 1 && "🔵"}
                                {clickCount === 2 && "🟢"}
                                {clickCount === 3 && "🟡"}
                                {clickCount === 4 && "🔴"}
                                还需点击 {5 - clickCount} 次解锁
                                {clickCount === 4 && " 🎉"}
                              </div>
                            )}
                          </div>

                          {/* 小锁图标 */}
                          {model.locked && !unlockedModels.has(model.value) && (
                            <button
                              onClick={(e) => handleLockClick(model.value, e)}
                              className={cn(
                                'lock-button ml-2 p-3 pc:p-2 rounded-full transition-all duration-300 flex-shrink-0',
                                'hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:shadow-lg hover:scale-105',
                                'active:bg-gradient-to-r active:from-purple-200 active:to-pink-200 active:scale-95',
                                'touch-feedback border-2 border-transparent',
                                'min-h-[48px] min-w-[48px] pc:min-h-[auto] pc:min-w-[auto]',
                                'flex items-center justify-center',
                                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                                isShaking && 'animate-shake',
                                // 根据点击次数改变背景色和边框
                                clickCount === 0 && 'bg-gray-50 hover:border-gray-200',
                                clickCount === 1 && 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-blue-100 shadow-md',
                                clickCount === 2 && 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100 shadow-md',
                                clickCount === 3 && 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-yellow-100 shadow-md',
                                clickCount === 4 && 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-red-100 shadow-lg colorful-lock-hover'
                              )}
                              title={`点击 ${5 - clickCount} 次解锁`}
                              aria-label={`解锁 ${model.name} 模型，还需点击 ${5 - clickCount} 次`}
                            >
                              <Lock className={cn(
                                'w-5 h-5 pc:w-4 pc:h-4 transition-colors duration-200',
                                // 根据点击次数改变锁的颜色
                                clickCount === 0 && 'text-gray-400',
                                clickCount === 1 && 'text-blue-500',
                                clickCount === 2 && 'text-green-500',
                                clickCount === 3 && 'text-yellow-500',
                                clickCount === 4 && 'text-red-500'
                              )} />
                            </button>
                          )}

                          {/* 解锁成功的小锁（带解锁动画） */}
                          {model.locked && unlockedModels.has(model.value) && (
                            <div className="ml-2 p-3 pc:p-2 flex-shrink-0 min-h-[48px] min-w-[48px] pc:min-h-[auto] pc:min-w-[auto] flex items-center justify-center bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 rounded-full border-2 border-green-300 shadow-lg shadow-green-200 animate-pulse">
                              <Lock className="w-5 h-5 pc:w-4 pc:h-4 text-green-600" />
                              {/* 添加闪烁效果 */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-200 to-emerald-200 opacity-50 animate-ping"></div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
