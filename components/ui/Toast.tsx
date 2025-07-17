'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: () => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

const iconStyles = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400'
}

export function Toast({ type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = toastIcons[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 等待动画完成
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        'fixed top-4 right-4 left-4 pc:left-auto max-w-sm w-full pc:w-auto bg-white border rounded-lg shadow-lg p-3 pc:p-4 transition-all duration-300 z-50',
        toastStyles[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn('h-4 w-4 pc:h-5 pc:w-5', iconStyles[type])} />
        </div>
        <div className="ml-2 sm:ml-3 flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium truncate">{title}</p>
          {message && (
            <p className="mt-1 text-xs sm:text-sm opacity-90 line-clamp-2">{message}</p>
          )}
        </div>
        <div className="ml-2 sm:ml-4 flex-shrink-0">
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none p-1 min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto sm:p-0 items-center justify-center"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast 管理器
interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )

  return {
    addToast,
    ToastContainer,
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message })
  }
}
