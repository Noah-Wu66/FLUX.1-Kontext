import { NextRequest, NextResponse } from 'next/server'
import GeminiUtils from '@/lib/gemini-utils'

interface OptimizePromptRequest {
  prompt: string
  model: string // FLUX 模型类型，用于针对性优化
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizePromptRequest = await request.json()

    // 验证必需字段
    if (!body.prompt || !body.prompt.trim()) {
      return NextResponse.json(
        { success: false, error: '提示词不能为空' },
        { status: 400 }
      )
    }

    if (!body.model) {
      return NextResponse.json(
        { success: false, error: '模型类型不能为空' },
        { status: 400 }
      )
    }

    // 检查环境变量配置
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY 环境变量未配置')
      return NextResponse.json(
        { success: false, error: 'AI 服务未配置，请联系管理员' },
        { status: 500 }
      )
    }

    // 构建优化提示词的系统提示
    const systemPrompt = `You are a professional AI image generation prompt optimization expert, specializing in optimizing prompts for FLUX.1 Kontext models.

Your task is to optimize the user's prompt to make it more suitable for FLUX.1 Kontext models to generate high-quality images.

Optimization principles:
1. Maintain the user's original intent
2. Add specific visual description details
3. Use professional terminology that FLUX models understand
4. Optimize language structure and vocabulary choices
5. Add appropriate style, lighting, and composition descriptions
6. Ensure prompts are clear, specific, and expressive

Model type: ${body.model}
${body.model.includes('text-to-image') ?
  '- This is a text-to-image model, focus on optimizing scene descriptions, styles, compositions, etc.' :
  '- This is an image editing model, focus on optimizing the clarity and specificity of editing instructions'
}

IMPORTANT: You must output the optimized prompt in English only. Do not add any explanations or additional text.`

    const userPrompt = `Please optimize the following prompt (translate to English if needed and optimize):

${body.prompt.trim()}`

    // 使用 Gemini 优化提示词
    const result = await GeminiUtils.textChat(
      userPrompt,
      systemPrompt,
      {
        temperature: 0.7,
        max_tokens: 500
      }
    )

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        optimizedPrompt: result.data.trim(),
        originalPrompt: body.prompt.trim()
      })
    } else {
      const errorMessage = result.error || 'AI 优化失败'
      console.error('Gemini API 调用失败:', {
        error: errorMessage,
        prompt: body.prompt.substring(0, 100) + '...',
        model: body.model
      })
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('优化提示词错误:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
