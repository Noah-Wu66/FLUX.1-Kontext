import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FLUX.1 Kontext AI 绘图应用',
  description: '基于 FLUX.1 Kontext API 的智能图片生成和编辑应用',
  keywords: ['AI绘图', 'FLUX.1', 'Kontext', '图片生成', '人工智能'],
  authors: [{ name: 'AI Drawing App' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
}
