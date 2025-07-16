import { NextRequest, NextResponse } from 'next/server'
import { fluxAPI } from '@/lib/flux-api'
import type { GenerationRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json()
    
    // 验证必需字段
    if (!body.prompt) {
      return NextResponse.json(
        { success: false, error: '提示词不能为空' },
        { status: 400 }
      )
    }

    // 如果是预设模式，记录相关信息（用于调试和统计）
    if (body.usePreset && body.presetName) {
      console.log(`使用预设模式: ${body.presetName}`, {
        model: body.model,
        hasImage: !!(body.imageUrl || (body.imageUrls && body.imageUrls.length > 0)),
        subject: body.subject
      })
    }

    // 调用 FLUX API 生成图片
    const result = await fluxAPI.generateImage(body)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API 错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'FLUX.1 Kontext API 服务正常运行' },
    { status: 200 }
  )
}
