'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  children?: MenuItem[]
}

interface MenuProps {
  items: MenuItem[]
  className?: string
  orientation?: 'horizontal' | 'vertical'
  onMenuItemClick?: (item: MenuItem) => void
}

export function Menu({ 
  items, 
  className, 
  orientation = 'horizontal',
  onMenuItemClick
}: MenuProps) {
  return (
    <nav className={cn(
      'menu',
      orientation === 'horizontal' ? 'flex flex-row items-center' : 'flex flex-col',
      className
    )}>
      <ul className={cn(
        'menu-list',
        orientation === 'horizontal' 
          ? 'flex flex-row items-center space-x-1 pc:space-x-2'
          : 'flex flex-col space-y-1'
      )}>
        {items.map((item) => (
          <MenuItem 
            key={item.id} 
            item={item} 
            orientation={orientation}
            onMenuItemClick={onMenuItemClick}
          />
        ))}
      </ul>
    </nav>
  )
}

interface MenuItemProps {
  item: MenuItem
  orientation: 'horizontal' | 'vertical'
  onMenuItemClick?: (item: MenuItem) => void
}

function MenuItem({ item, orientation, onMenuItemClick }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLLIElement>(null)

  const hasChildren = item.children && item.children.length > 0

  // 点击外部关闭子菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen)
    } else {
      if (item.onClick) {
        item.onClick()
      }
      if (onMenuItemClick) {
        onMenuItemClick(item)
      }
    }
  }

  return (
    <li 
      ref={menuRef}
      className={cn(
        'relative',
        hasChildren && isOpen ? 'menu-item-active' : ''
      )}
    >
      <button
        onClick={handleClick}
        className={cn(
          'menu-item flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
          hasChildren && isOpen ? 'bg-gray-100' : '',
          item.href ? 'cursor-pointer' : ''
        )}
      >
        {item.icon && (
          <span className="mr-2 flex-shrink-0">{item.icon}</span>
        )}
        <span>{item.label}</span>
        {hasChildren && (
          <span className="ml-1">
            {orientation === 'horizontal' ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
      </button>

      {/* 子菜单 */}
      {hasChildren && isOpen && (
        <ul className={cn(
          'submenu absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 mt-1 min-w-[200px]',
          orientation === 'horizontal' ? 'left-0' : 'left-full top-0'
        )}>
          {item.children?.map((child) => (
            <li key={child.id} className="submenu-item">
              <button
                onClick={() => {
                  if (child.onClick) {
                    child.onClick()
                  }
                  if (onMenuItemClick) {
                    onMenuItemClick(child)
                  }
                  setIsOpen(false)
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                {child.icon && (
                  <span className="mr-2 flex-shrink-0">{child.icon}</span>
                )}
                <span>{child.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

// 移动端菜单按钮
export function MenuToggle({ 
  isOpen, 
  onClick 
}: { 
  isOpen: boolean, 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={isOpen ? "关闭菜单" : "打开菜单"}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span className={cn(
          "block w-5 h-0.5 bg-gray-600 transition-all duration-300",
          isOpen ? "rotate-45 translate-y-0.5" : "-translate-y-1"
        )} />
        <span className={cn(
          "block w-5 h-0.5 bg-gray-600 transition-all duration-300",
          isOpen ? "opacity-0" : "opacity-100"
        )} />
        <span className={cn(
          "block w-5 h-0.5 bg-gray-600 transition-all duration-300",
          isOpen ? "-rotate-45 -translate-y-0.5" : "translate-y-1"
        )} />
      </div>
    </button>
  )
}
