'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Palette,
  Wand2,
  Edit3,
  Sparkles,
  Zap,
  Image,
  Layers,
  PenTool
} from 'lucide-react'
import { Menu, MenuToggle, type MenuItem } from './ui/Menu'
import { cn } from '@/lib/utils'

interface MainMenuProps {
  className?: string
  onMenuItemSelect?: (item: MenuItem) => void
}

export function MainMenu({ className, onMenuItemSelect }: MainMenuProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.href) {
      router.push(item.href)
    }
    
    if (onMenuItemSelect) {
      onMenuItemSelect(item)
    }
    
    // 移动端点击后关闭菜单
    setIsMobileMenuOpen(false)
  }

  const menuItems: MenuItem[] = [
    {
      id: 'image-generation',
      label: '图片生成',
      icon: <Wand2 className="w-4 h-4" />,
      children: [
        {
          id: 'flux-pro-text-to-image',
          label: 'FLUX.1 Pro',
          icon: <Zap className="w-4 h-4" />,
          href: '/generate/pro-text-to-image',
          onClick: () => console.log('Navigate to FLUX.1 Pro')
        },
        {
          id: 'flux-max-text-to-image',
          label: 'FLUX.1 Max',
          icon: <Sparkles className="w-4 h-4" />,
          href: '/generate/max-text-to-image',
          onClick: () => console.log('Navigate to FLUX.1 Max')
        }
      ]
    },
    {
      id: 'image-editing',
      label: '图片编辑',
      icon: <Edit3 className="w-4 h-4" />,
      children: [
        {
          id: 'flux-kontext-dev',
          label: 'Kontext Dev',
          icon: <PenTool className="w-4 h-4" />,
          href: '/edit/kontext-dev',
          onClick: () => console.log('Navigate to Kontext Dev')
        },
        {
          id: 'flux-pro',
          label: 'Kontext Pro',
          icon: <PenTool className="w-4 h-4" />,
          href: '/edit/pro',
          onClick: () => console.log('Navigate to Kontext Pro')
        },
        {
          id: 'flux-max',
          label: 'Kontext Max',
          icon: <Image className="w-4 h-4" />,
          href: '/edit/max',
          onClick: () => console.log('Navigate to Kontext Max')
        },
        {
          id: 'flux-max-multi',
          label: 'Kontext Multi',
          icon: <Layers className="w-4 h-4" />,
          href: '/edit/max-multi',
          onClick: () => console.log('Navigate to Kontext Multi')
        }
      ]
    }
  ]

  return (
    <div className={cn('main-menu', className)}>
      {/* PC端菜单 (≥768px) */}
      <div className="hidden pc:block">
        <Menu
          items={menuItems}
          orientation="horizontal"
          onMenuItemClick={handleMenuItemClick}
          className="flex items-center"
        />
      </div>

      {/* 移动端菜单 (<768px) */}
      <div className="pc:hidden">
        <MenuToggle
          isOpen={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* 移动端菜单面板 */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <MobileMenu
                items={menuItems}
                onMenuItemClick={handleMenuItemClick}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 移动端菜单组件
interface MobileMenuProps {
  items: MenuItem[]
  onMenuItemClick: (item: MenuItem) => void
}

function MobileMenu({ items, onMenuItemClick }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="mobile-menu space-y-2">
      {items.map((item) => (
        <div key={item.id} className="mobile-menu-item">
          {/* 一级菜单项 */}
          <button
            onClick={() => {
              if (item.children && item.children.length > 0) {
                toggleExpanded(item.id)
              } else {
                onMenuItemClick(item)
              }
            }}
            className="flex items-center justify-between w-full px-4 py-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-feedback min-h-[48px]"
          >
            <div className="flex items-center">
              {item.icon && (
                <span className="mr-3 flex-shrink-0">{item.icon}</span>
              )}
              <span className="font-medium text-gray-900">{item.label}</span>
            </div>
            {item.children && item.children.length > 0 && (
              <span className={cn(
                "transition-transform duration-200",
                expandedItems.has(item.id) ? "rotate-90" : ""
              )}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </button>

          {/* 二级菜单项 */}
          {item.children && expandedItems.has(item.id) && (
            <div className="mt-3 ml-4 space-y-2">
              {item.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onMenuItemClick(child)}
                  className="flex items-center w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-feedback min-h-[48px]"
                >
                  {child.icon && (
                    <span className="mr-3 flex-shrink-0">{child.icon}</span>
                  )}
                  <span className="font-medium">{child.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
