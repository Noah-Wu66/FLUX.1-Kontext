import { NextRequest, NextResponse } from 'next/server'
import { geminiAPI } from '@/lib/gemini-api'

export async function GET(request: NextRequest) {
  try {
    // 检查环境变量配置
    const config = {
      hasOpenAIApiKey: !!process.env.OPENAI_API_KEY,
      openAIApiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      openAIBaseUrl: process.env.OPENAI_BASE_URL || '未设置',
      geminiConfigured: geminiAPI.isConfigured()
    }

    console.log('配置检查结果:', config)

    return NextResponse.json({
      success: true,
      config,
      message: '配置检查完成'
    })
  } catch (error) {
    console.error('配置检查错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
