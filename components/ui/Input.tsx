import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm pc:text-base font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 pc:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200',
          'min-h-[48px] text-base mobile-text-size', // 移动端优化：确保触摸目标尺寸，防止iOS缩放
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm pc:text-base text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm pc:text-base text-gray-500">{helperText}</p>
      )}
    </div>
  )
}
