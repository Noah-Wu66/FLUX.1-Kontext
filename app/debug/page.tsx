'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function DebugPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testGeminiAPI = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: '给女孩戴上墨镜'
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

  const testOptimizePrompt = async () => {
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

  const checkConfig = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch('/api/check-config')
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
      <h1 className="text-3xl font-bold mb-8">Gemini API 调试页面</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API 测试</h2>
        
        <div className="space-y-4">
          <Button
            onClick={checkConfig}
            disabled={testing}
            loading={testing}
            variant="secondary"
          >
            检查配置
          </Button>

          <Button
            onClick={testGeminiAPI}
            disabled={testing}
            loading={testing}
          >
            测试 Gemini API 基础功能
          </Button>

          <Button
            onClick={testOptimizePrompt}
            disabled={testing}
            loading={testing}
            variant="outline"
          >
            测试提示词优化功能
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
