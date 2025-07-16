'use client'

import React, { useState } from 'react'
import { ChevronDown, Wand2, Edit3 } from 'lucide-react'
import { Button } from './ui/Button'
import { getPresetOptions, getPresetByName } from '@/lib/presets'

interface PresetSelectorProps {
  onPresetSelect: (presetName: string) => void
  onCustomMode: () => void
  disabled?: boolean
  loading?: boolean
  selectedPreset?: string
}

export function PresetSelector({
  onPresetSelect,
  onCustomMode,
  disabled = false,
  loading = false,
  selectedPreset
}: PresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const presetOptions = getPresetOptions()
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useClickOutside(dropdownRef, () => setIsOpen(false))

  const handlePresetClick = (presetName: string) => {
    onPresetSelect(presetName)
    setIsOpen(false)
  }

  const selectedPresetData = selectedPreset ? getPresetByName(selectedPreset) : null

  return (
    <div className="space-y-3">
      {/* 预设选择器 */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI 编辑预设
        </label>
        
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled || loading}
            className={`
              w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              transition-colors duration-200 flex items-center justify-between
              ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'}
            `}
          >
            <div className="flex items-center">
              <Wand2 className="w-4 h-4 text-primary-600 mr-2" />
              <span className="text-gray-900">
                {selectedPresetData ? selectedPresetData.name : '选择编辑预设...'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* 下拉菜单 */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {presetOptions.map((option) => {
                const preset = getPresetByName(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePresetClick(option.value)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors duration-150
                      border-b border-gray-100 last:border-b-0
                      ${selectedPreset === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-900'}
                    `}
                  >
                    <div className="font-medium">{option.label}</div>
                    {preset && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {preset.brief}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 预设描述 */}
        {selectedPresetData && (
          <div className="mt-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-primary-700">
              <span className="font-medium">预设说明：</span>
              {selectedPresetData.brief}
            </p>
          </div>
        )}
      </div>

      {/* 自定义模式按钮 */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCustomMode}
          disabled={disabled || loading}
          className="text-gray-600 hover:text-gray-800"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          切换到自定义提示词
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        选择预设后，AI 将分析您的图片并自动生成相应的编辑指令
      </p>
    </div>
  )
}

// 点击外部关闭下拉菜单的 Hook
export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, handler])
}
