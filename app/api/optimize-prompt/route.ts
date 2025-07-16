import { NextRequest, NextResponse } from 'next/server'
import { GeminiUtils } from '@/lib/gemini'

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

    // 构建优化提示词的系统提示
    const systemPrompt = `你是一个专业的 AI 图像生成提示词优化专家，专门为 FLUX.1 Kontext 模型优化提示词。

你的任务是优化用户提供的提示词，使其更适合 FLUX.1 Kontext 模型生成高质量图片。

优化原则：
1. 保持用户原意不变
2. 添加具体的视觉描述细节
3. 使用 FLUX 模型理解的专业术语
4. 优化语言结构和词汇选择
5. 添加适当的风格、光照、构图描述
6. 确保提示词清晰、具体、富有表现力

模型类型：${body.model}
${body.model.includes('text-to-image') ? 
  '- 这是文生图模型，重点优化场景描述、风格、构图等' : 
  '- 这是图片编辑模型，重点优化编辑指令的清晰度和具体性'
}

请直接输出优化后的提示词，不要添加任何解释或额外文字。`

    const userPrompt = `请优化以下提示词：

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
      console.error('Gemini API 调用失败:', result.error)
      return NextResponse.json(
        { success: false, error: result.error || 'AI 优化失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('优化提示词错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
