import { NextRequest, NextResponse } from 'next/server'
import GeminiUtils from '@/lib/gemini-utils'

interface OptimizePromptRequest {
  prompt: string
  model: string // FLUX 模型类型，用于针对性优化
  imageUrl?: string // 图片URL，用于图像理解
}

export async function POST(request: NextRequest) {
  let body: OptimizePromptRequest | null = null

  try {
    body = await request.json()

    // 验证 body 不为空
    if (!body) {
      return NextResponse.json(
        { success: false, error: '请求数据不能为空' },
        { status: 400 }
      )
    }

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

    // 检查是否有图片需要分析
    if (body.imageUrl) {
      // 有图片的情况：使用图像理解功能
      console.log('检测到图片，使用图像理解优化提示词:', {
        imageUrl: body.imageUrl.substring(0, 100) + '...',
        prompt: body.prompt
      })

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
          { success: false, error: '无法下载图片，请重试' },
          { status: 400 }
        )
      }

      // 构建图像理解的提示词
      const imageAnalysisPrompt = `You are an expert at analyzing images and optimizing prompts for FLUX.1 Kontext image editing models.

Task: Analyze the uploaded image and optimize the user's editing instruction.

User's instruction: "${body.prompt.trim()}"

Please:
1. Analyze the image content (people, objects, background, style, lighting, etc.)
2. Understand the user's editing intention
3. Create a complete, detailed English prompt that combines image analysis with user instruction
4. If the instruction involves people or main subjects, add "Maintain the consistency between the characters and the background."
5. Make the prompt specific and actionable for image editing

Output format: Optimized English prompt only, no explanations or analysis text.`

      // 使用 Gemini 进行图像理解和提示词优化
      const result = await GeminiUtils.imageChat(
        imageAnalysisPrompt,
        imageBase64,
        'jpeg',
        {
          temperature: 0.7
        }
      )

      if (result.success && result.data) {
        const optimizedPrompt = result.data.trim()
        if (optimizedPrompt) {
          console.log('图像理解提示词优化成功:', {
            originalLength: body.prompt.length,
            optimizedLength: optimizedPrompt.length,
            optimizedPreview: optimizedPrompt.substring(0, 100) + '...'
          })
          return NextResponse.json({
            success: true,
            optimizedPrompt,
            originalPrompt: body.prompt.trim(),
            usedImageAnalysis: true
          })
        }
      }

      // 如果图像理解失败，回退到纯文本优化
      console.warn('图像理解失败，回退到纯文本优化:', result.error)
    }

    // 纯文本优化（无图片或图像理解失败时）
    const systemPrompt = `You are an AI prompt optimizer for FLUX.1 Kontext models.

Task: Optimize the user's prompt for image generation/editing.

Rules:
1. Translate to English if needed
2. Make the prompt complete and specific
3. Add visual details and style descriptions
4. Use FLUX-compatible terminology
5. If the prompt involves people or main subjects, add "Maintain the consistency between the characters and the background."

Model: ${body.model}
${body.model.includes('text-to-image') ? 'Focus: scene description, style, composition' : 'Focus: clear editing instructions'}

Output: Optimized English prompt only, no explanations.`

    const userPrompt = `Optimize this prompt: ${body.prompt.trim()}`

    console.log('开始优化提示词:', {
      originalPrompt: body.prompt.substring(0, 100) + '...',
      model: body.model,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length
    })

    // 使用 Gemini 优化提示词
    const result = await GeminiUtils.textChat(
      userPrompt,
      systemPrompt,
      {
        temperature: 0.7
      }
    )

    console.log('优化提示词结果:', {
      success: result.success,
      hasData: !!result.data,
      dataLength: result.data?.length || 0,
      error: result.error
    })

    if (result.success && result.data) {
      const optimizedPrompt = result.data.trim()
      if (optimizedPrompt) {
        console.log('提示词优化成功:', {
          originalLength: body.prompt.length,
          optimizedLength: optimizedPrompt.length,
          optimizedPreview: optimizedPrompt.substring(0, 100) + '...'
        })
        return NextResponse.json({
          success: true,
          optimizedPrompt,
          originalPrompt: body.prompt.trim()
        })
      } else {
        console.error('优化后的提示词为空')
        return NextResponse.json(
          { success: false, error: '优化后的提示词为空，请重试' },
          { status: 500 }
        )
      }
    } else {
      const errorMessage = result.error || 'AI 优化失败'
      console.error('Gemini API 调用失败:', {
        error: errorMessage,
        prompt: body.prompt.substring(0, 100) + '...',
        model: body.model,
        resultSuccess: result.success,
        resultData: result.data
      })
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('优化提示词错误:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      prompt: body?.prompt ? body.prompt.substring(0, 100) + '...' : '未知',
      model: body?.model || '未知'
    })

    let errorMessage = '服务器内部错误'
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = '网络连接错误，请检查网络设置'
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else if (error.message.includes('JSON')) {
        errorMessage = '数据格式错误'
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
