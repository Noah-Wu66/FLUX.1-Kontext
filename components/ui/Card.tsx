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
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}
