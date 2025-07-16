import { NextRequest, NextResponse } from 'next/server'
import { geminiAPI } from '@/lib/gemini-api'
import { buildPresetPrompt, getPresetByName } from '@/lib/presets'
import { GeminiUtils } from '@/lib/gemini'

interface GeneratePresetPromptRequest {
  presetName: string
  imageUrl: string
  subject?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePresetPromptRequest = await request.json()
    
    // 验证必需字段
    if (!body.presetName) {
      return NextResponse.json(
        { success: false, error: '预设名称不能为空' },
        { status: 400 }
      )
    }
    
    if (!body.imageUrl) {
      return NextResponse.json(
        { success: false, error: '图片URL不能为空' },
        { status: 400 }
      )
    }

    // 获取预设配置
    const preset = getPresetByName(body.presetName)
    if (!preset) {
      return NextResponse.json(
        { success: false, error: '未找到指定的预设' },
        { status: 400 }
      )
    }

    // 构建预设提示词
    const presetPrompt = buildPresetPrompt(preset, body.subject)

    // 检查 Gemini API 是否配置
    if (!geminiAPI.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Gemini API 未配置，无法生成预设提示词' },
        { status: 500 }
      )
    }

    // 下载图片并转换为 base64
    let imageBase64: string
    try {
      const imageResponse = await fetch(body.imageUrl)
      if (!imageResponse.ok) {
        throw new Error('无法下载图片')
      }
      
      const imageBuffer = await imageResponse.arrayBuffer()
      imageBase64 = Buffer.from(imageBuffer).toString('base64')
    } catch (error) {
      console.error('图片下载失败:', error)
      return NextResponse.json(
        { success: false, error: '无法下载图片' },
        { status: 400 }
      )
    }

    // 使用 Gemini 分析图片并生成提示词
    const result = await GeminiUtils.imageChat(
      presetPrompt,
      imageBase64,
      'jpeg', // 假设是 JPEG 格式，实际可以根据 URL 或 Content-Type 判断
      {
        model: 'gemini-2.5-flash',
        reasoning_effort: 'medium',
        temperature: 0.8
      }
    )

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        prompt: result.data.trim(),
        preset: preset.name
      })
    } else {
      console.error('Gemini API 调用失败:', result.error)
      return NextResponse.json(
        { success: false, error: result.error || 'AI 分析失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('生成预设提示词错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
