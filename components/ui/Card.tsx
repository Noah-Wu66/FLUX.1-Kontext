import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export function Card({ children, className, title, description }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-4 pc:p-6', className)}>
      {(title || description) && (
        <div className="mb-4 pc:mb-6">
          {title && (
            <h3 className="text-lg pc:text-xl lg:text-2xl font-semibold text-gray-900 mb-1 pc:mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-sm pc:text-base text-gray-600 leading-relaxed">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 pc:mb-6', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-4 pc:space-y-6', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-4 pc:mt-6 pt-4 pc:pt-6 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}
