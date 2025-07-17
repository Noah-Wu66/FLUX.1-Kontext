import React from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  helperText?: string
}

export function Select({
  label,
  options,
  error,
  helperText,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm pc:text-base font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full px-3 pc:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 bg-white',
          'min-h-[48px] text-base mobile-text-size', // 移动端优化：确保触摸目标尺寸，防止iOS缩放
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm pc:text-base text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm pc:text-base text-gray-500">{helperText}</p>
      )}
    </div>
  )
}
