'use client'

import { useState } from 'react'

export default function TestOptimizationPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testWithImage = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: '给女孩戴上墨镜',
          model: 'max',
          imageUrl: 'https://example.com/test-image.jpg' // 测试图片URL
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setTesting(false)
    }
  }

  const testWithoutImage = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: '给女孩戴上墨镜',
          model: 'max'
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">提示词优化功能测试</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">测试选项</h2>
        
        <div className="space-y-4">
          <button 
            onClick={testWithImage}
            disabled={testing}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? '测试中...' : '测试图像理解优化（带图片）'}
          </button>
          
          <button 
            onClick={testWithoutImage}
            disabled={testing}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? '测试中...' : '测试纯文本优化（无图片）'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
