'use client'

import React from 'react'
import Link from 'next/link'
import { Palette } from 'lucide-react'



export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo 和标题 */}
          <div className="flex items-center min-w-0 flex-1">
            <Link href="/" className="flex items-center min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">FLUX.1 Kontext</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">AI 绘图应用</p>
              </div>
            </Link>
          </div>


        </div>
      </div>
    </header>
  )
}
