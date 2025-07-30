import { NextRequest, NextResponse } from 'next/server'
import { geminiAPI } from '@/lib/gemini-api'
import GeminiUtils from '@/lib/gemini-utils'

export async function GET() {
  try {
    // 检查环境变量
    const envCheck = {
      hasApiKey: !!process.env.GEMINI_API_KEY,
      apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      baseUrl: process.env.GEMINI_BASE_URL || 'default',
      isConfigured: geminiAPI.isConfigured()
    }

    console.log('Gemini API 配置检查:', envCheck)

    if (!envCheck.isConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API 未配置',
        details: envCheck
      })
    }

    // 测试简单的文本对话
    const testResult = await GeminiUtils.textChat(
      '请回复"测试成功"',
      '你是一个测试助手，请简短回复。',
      {
        temperature: 0.1
      }
    )

    return NextResponse.json({
      success: true,
      envCheck,
      testResult,
      message: 'Gemini API 测试完成'
    })

  } catch (error) {
    console.error('Gemini API 测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: '请提供测试提示词'
      }, { status: 400 })
    }

    console.log('测试 Gemini API 开始:', {
      prompt: prompt.substring(0, 100) + '...',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      baseUrl: process.env.GEMINI_BASE_URL
    })

    // 测试提示词优化
    const result = await GeminiUtils.textChat(
      `Please optimize this prompt for image generation: ${prompt}`,
      'You are an AI prompt optimizer. Optimize the prompt for image generation. Output optimized English prompt only.',
      {
        temperature: 0.7
      }
    )

    console.log('测试 Gemini API 结果:', {
      success: result.success,
      hasData: !!result.data,
      dataLength: result.data?.length || 0,
      error: result.error
    })

    return NextResponse.json({
      success: true,
      originalPrompt: prompt,
      result,
      config: {
        hasApiKey: !!process.env.GEMINI_API_KEY,
        baseUrl: process.env.GEMINI_BASE_URL
      }
    })

  } catch (error) {
    console.error('提示词优化测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
