import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-primary-200 border-t-primary-600',
          sizes[size]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

export function LoadingOverlay({ children, loading, text }: {
  children: React.ReactNode
  loading: boolean
  text?: string
}) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <Loading text={text} />
        </div>
      )}
    </div>
  )
}
