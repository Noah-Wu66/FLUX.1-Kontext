'use client'

import React from 'react'
import { Plus, Lightbulb } from 'lucide-react'
import { Button } from './ui/Button'

interface PromptPresetsProps {
  onPresetClick: (preset: string) => void
  className?: string
}

const presets = [
  {
    id: 'indoor-lighting',
    label: '室内光照',
    text: 'Change the lighting environment to indoor lighting',
    category: 'lighting'
  },
  {
    id: 'morning-light',
    label: '晨光',
    text: 'Change the lighting environment to morning light',
    category: 'lighting'
  },
  {
    id: 'daylight',
    label: '日光',
    text: 'Change the lighting environment to daylight',
    category: 'lighting'
  },
  {
    id: 'photo-light',
    label: '摄影光',
    text: 'Change the lighting environment into photographic light',
    category: 'lighting'
  },
  {
    id: 'remove-background-people',
    label: '移除背景人物',
    text: 'Remove distant background people',
    category: 'editing'
  }
]

export function PromptPresets({ onPresetClick, className }: PromptPresetsProps) {
  const lightingPresets = presets.filter(preset => preset.category === 'lighting')
  const editingPresets = presets.filter(preset => preset.category === 'editing')

  return (
    <div className={`prompt-presets ${className || ''}`}>
      <div className="mb-4">
        <div className="flex items-center mb-3">
          <Lightbulb className="w-4 h-4 text-primary-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">预设提示词</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          点击下方预设词快速添加到描述中，帮助您更好地编辑图片
        </p>
      </div>

      {/* 光照预设 */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
          光照环境
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lightingPresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => onPresetClick(preset.text)}
              className="justify-start text-left h-auto py-2 px-3 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {preset.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {preset.text}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 编辑预设 */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
          图片编辑
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {editingPresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => onPresetClick(preset.text)}
              className="justify-start text-left h-auto py-2 px-3 hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {preset.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {preset.text}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-4 p-2 bg-gray-50 rounded border">
        <p className="mb-1">💡 <strong>使用提示：</strong></p>
        <ul className="space-y-0.5 ml-4">
          <li>• 预设词会自动添加到您的描述末尾</li>
          <li>• 可以组合多个预设词使用</li>
          <li>• 建议先上传参考图片再使用预设词</li>
        </ul>
      </div>
    </div>
  )
}
