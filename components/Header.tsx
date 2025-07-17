'use client'

import React from 'react'
import Link from 'next/link'
import { Palette } from 'lucide-react'



export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 pc:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 pc:h-18">
          {/* Logo 和标题 */}
          <div className="flex items-center min-w-0 flex-1">
            <Link href="/" className="flex items-center min-w-0 touch-feedback">
              <div className="w-10 h-10 pc:w-12 pc:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3 pc:mr-4 flex-shrink-0">
                <Palette className="w-5 h-5 pc:w-6 pc:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg pc:text-xl lg:text-2xl font-bold text-gray-900 truncate">FLUX.1 Kontext</h1>
                <p className="text-sm pc:text-base text-gray-500 hidden pc:block">AI 绘图应用</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
